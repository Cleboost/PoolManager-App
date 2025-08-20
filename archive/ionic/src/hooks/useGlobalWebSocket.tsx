import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Preferences } from '@capacitor/preferences';

// Interface pour les températures
interface TemperatureData {
	water: number;
	air: number;
	trend: number;
}

// Interface pour les erreurs de la piscine
interface ErrorData {
	clockError: boolean;        // Bit 0: Erreur Horloge Atomique
	waterSensorError: boolean;  // Bit 1: Erreur Capteur Eau
	airSensorError: boolean;    // Bit 2: Erreur capteur air
	waterTransmissionError: boolean; // Bit 3: Erreur Transmission capteur eau
	airTransmissionError: boolean;   // Bit 4: Erreur Transmission capteur air
	waterBatteryLow: boolean;   // Bit 5: Batterie basse capteur eau
	airBatteryLow: boolean;     // Bit 6: Batterie basse capteur air
}

// Type pour le mode de la pompe
export type PumpMode = "off" | "on" | "auto";

// Type pour les piscines découvertes
export interface DiscoveredPool {
	id: string;
	ip: string;
	name: string;
	signalStrength: number; // 1-5
}

// Interface pour le contexte WebSocket
interface WebSocketContextType {
	isConnected: boolean;
	dataInitialized: boolean;
	temperatures: TemperatureData;
	pumpMode: PumpMode;
	// Plages horaires (heures par slot 0..5)
	timeSlots: number[];
	lastUpdate: Date | null;
	// Erreurs de la piscine
	errors: ErrorData;
	sendMessage: (message: string) => void;
	fetchTemperatures: () => void;
	fetchPumpMode: () => void;
	setPumpMode: (mode: PumpMode) => void;

	// API plages horaires
	fetchTimeSlot: (index: number) => void;
	fetchAllTimeSlots: () => void;
	incrementTimeSlot: (index: number) => void;
	decrementTimeSlot: (index: number) => void;

	// API erreurs
	fetchErrors: () => void;

	// Propriétés de découverte et d'appairage
	isPaired: boolean;
	pairedPoolIp: string | null;
	discoveredPools: DiscoveredPool[];
	isDiscovering: boolean;
	startDiscovery: () => void;
	stopDiscovery: () => void;
	testSpecificIp: (ip: string) => Promise<boolean>;
	forceDataRefresh: () => void;
	connectToPool: (poolIp: string) => Promise<boolean>;
	disconnectFromPool: () => Promise<void>;
}

// Clé pour stocker l'IP de la piscine appairée
const PAIRED_POOL_IP_KEY = "paired_pool_ip";

// Gestionnaire global de l'état WebSocket (singleton)
class GlobalWebSocketState {
	static socket: WebSocket | null = null;
	static isConnected: boolean = false;
	static dataInitialized: boolean = false;
	static temperatures: TemperatureData = { water: 0, air: 0, trend: 0 };
	static pumpMode: PumpMode = "off";
	static timeSlots: number[] = [0, 0, 0, 0, 0, 0];
	static lastUpdate: Date | null = null;
	static errors: ErrorData = {
		clockError: false,
		waterSensorError: false,
		airSensorError: false,
		waterTransmissionError: false,
		airTransmissionError: false,
		waterBatteryLow: false,
		airBatteryLow: false
	};
	static listeners: Set<Function> = new Set();
	static reconnectTimeout: NodeJS.Timeout | null = null;
	static initialized: boolean = false;
	static hasReceivedTemperature: boolean = false;
	static hasReceivedPumpMode: boolean = false;
	static hasReceivedErrors: boolean = false;
	static storageInitialized: boolean = false;
	static pendingSlotRequestIndex: number | null = null;
	static slotChainCallback: (() => void) | null = null;

	// Propriétés pour la découverte et l'appairage
	static isPaired: boolean = false;
	static pairedPoolIp: string | null = null;
	static discoveredPools: DiscoveredPool[] = [];
	static isDiscovering: boolean = false;
	static discoveryInterval: NodeJS.Timeout | null = null;

	static updateState(
		newState: Partial<{
			isConnected: boolean;
			dataInitialized: boolean;
			temperatures: TemperatureData;
			pumpMode: PumpMode;
			timeSlots: number[];
			lastUpdate: Date | null;
			errors: ErrorData;
			isPaired: boolean;
			pairedPoolIp: string | null;
			discoveredPools: DiscoveredPool[];
			isDiscovering: boolean;
		}>
	) {
		let hasChanges = false;

		// Mettre à jour les états
		if (newState.isConnected !== undefined && this.isConnected !== newState.isConnected) {
			this.isConnected = newState.isConnected;
			hasChanges = true;
		}

		if (newState.dataInitialized !== undefined && this.dataInitialized !== newState.dataInitialized) {
			this.dataInitialized = newState.dataInitialized;
			hasChanges = true;
		}

		if (newState.temperatures !== undefined) {
			this.temperatures = { ...newState.temperatures };
			hasChanges = true;
		}

		if (newState.pumpMode !== undefined && this.pumpMode !== newState.pumpMode) {
			this.pumpMode = newState.pumpMode;
			hasChanges = true;
		}

		if (newState.timeSlots !== undefined) {
			this.timeSlots = [...newState.timeSlots];
			hasChanges = true;
		}

		if (newState.lastUpdate !== undefined) {
			this.lastUpdate = newState.lastUpdate;
			hasChanges = true;
		}

		if (newState.errors !== undefined) {
			this.errors = { ...newState.errors };
			hasChanges = true;
		}

		if (newState.isPaired !== undefined && this.isPaired !== newState.isPaired) {
			this.isPaired = newState.isPaired;
			hasChanges = true;
		}

		if (newState.pairedPoolIp !== undefined && this.pairedPoolIp !== newState.pairedPoolIp) {
			this.pairedPoolIp = newState.pairedPoolIp;
			hasChanges = true;
		}

		if (newState.discoveredPools !== undefined) {
			this.discoveredPools = [...newState.discoveredPools];
			hasChanges = true;
		}

		if (newState.isDiscovering !== undefined && this.isDiscovering !== newState.isDiscovering) {
			this.isDiscovering = newState.isDiscovering;
			hasChanges = true;
		}

		// Notifier les abonnés seulement s'il y a des changements
		if (hasChanges) {
			this.notifyListeners();
		}
	}

	static notifyListeners() {
		this.listeners.forEach((listener) => listener());
	}

	static subscribe(listener: Function) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	static async initializeStorage() {
		if (!this.storageInitialized) {
			this.storageInitialized = true;
		}
	}

	static async loadPairedPoolIp() {
		try {
			await this.initializeStorage();
			const result = await Preferences.get({ key: PAIRED_POOL_IP_KEY });
			if (result.value) {
				console.log("IP de piscine appairée chargée:", result.value);
				this.pairedPoolIp = result.value;
				this.isPaired = true;
				this.notifyListeners();
				return true;
			}
		} catch (error) {
			console.error("Erreur lors du chargement de l'IP de la piscine:", error);
		}
		return false;
	}


	static async savePairedPoolIp(ip: string | null) {
		try {
			await this.initializeStorage();
			if (ip) {
				await Preferences.set({ key: PAIRED_POOL_IP_KEY, value: ip });
				console.log("IP de piscine sauvegardée:", ip);
			} else {
				await Preferences.remove({ key: PAIRED_POOL_IP_KEY });
				console.log("IP de piscine supprimée");
			}
			return true;
		} catch (error) {
			console.error("Erreur lors de la sauvegarde de l'IP de la piscine:", error);
			return false;
		}
	}

	static async connectToPool(ip: string): Promise<boolean> {
		if (this.socket) {
			this.socket.close();
			this.socket = null;
		}

		const saveSuccess = await this.savePairedPoolIp(ip);
		if (saveSuccess) {
			// Réinitialiser les flags de données pour la nouvelle connexion
			this.hasReceivedTemperature = false;
			this.hasReceivedPumpMode = false;
			this.hasReceivedErrors = false;
			
			this.updateState({
				pairedPoolIp: ip,
				isPaired: true,
				isConnected: false,
				dataInitialized: false,
			});

			// Tenter de se connecter au WebSocket
			await this.connectWebSocket(ip);
			return true;
		}
		return false;
	}

	static async disconnectFromPool(): Promise<void> {
		if (this.socket) {
			this.socket.close();
			this.socket = null;
		}

		await this.savePairedPoolIp(null);
		this.updateState({
			pairedPoolIp: null,
			isPaired: false,
			isConnected: false,
			dataInitialized: false,
		});

		// Réinitialiser les valeurs
		this.temperatures = { water: 0, air: 0, trend: 0 };
		this.pumpMode = "off";
		this.hasReceivedTemperature = false;
		this.hasReceivedPumpMode = false;
		this.hasReceivedErrors = false;
		this.slotChainCallback = null;
	}

	static async connectWebSocket(ip: string | null = null) {
		const wsIp = ip || this.pairedPoolIp;

		if (!wsIp) {
			console.log("Aucune IP disponible pour la connexion WebSocket");
			return;
		}

		const WS_URL = `ws://${wsIp}:81`;

		try {
			console.log(`Tentative de connexion WebSocket à ${WS_URL}...`);
			const ws = new WebSocket(WS_URL);

			ws.onopen = () => {
				console.log("WebSocket connecté!");
				this.socket = ws;
				this.updateState({ isConnected: true });

				setTimeout(() => {
					console.log("Récupération des données initiales");
					if (ws.readyState === WebSocket.OPEN) {
						ws.send("/pompe/mode");

						setTimeout(() => {
							ws.send("/temp/water");
							setTimeout(() => {
								ws.send("/temp/air");
								setTimeout(() => {
									this.fetchAllTimeSlots();
									setTimeout(() => {
										this.fetchErrors();
									}, 1000);
								}, 500);
							}, 500);
						}, 500);
					}
				}, 1000);
			};

			ws.onmessage = (event) => {
				console.log("Message reçu:", event.data);
				this.processIncomingMessage(event.data);
			};

			ws.onerror = (error) => {
				console.error("Erreur WebSocket:", error);
			};

			ws.onclose = () => {
				console.log("WebSocket déconnecté. Tentative de reconnexion dans 5 secondes...");
				this.socket = null;
				this.updateState({ isConnected: false });

				if (this.isPaired && this.pairedPoolIp) {
					if (this.reconnectTimeout) {
						clearTimeout(this.reconnectTimeout);
					}

					this.reconnectTimeout = setTimeout(() => {
						this.connectWebSocket();
					}, 5000);
				}
			};
		} catch (err) {
			console.error("Erreur lors de la création du WebSocket:", err);
			if (this.isPaired && this.pairedPoolIp) {
				if (this.reconnectTimeout) {
					clearTimeout(this.reconnectTimeout);
				}
				this.reconnectTimeout = setTimeout(() => {
					this.connectWebSocket();
				}, 5000);
			}
		}
	}

	static processIncomingMessage(message: string) {
		try {
			if (message.startsWith("GTW")) {
				const waterTemp = parseInt(message.substring(3), 10);
				if (!isNaN(waterTemp)) {
					const newTemperatures = { ...this.temperatures };
					newTemperatures.water = waterTemp;

					if (this.temperatures.water !== 0 && this.temperatures.water !== waterTemp) {
						newTemperatures.trend = waterTemp - this.temperatures.water;
					}

					this.hasReceivedTemperature = true;
					console.log("🌡️ Température d'eau reçue:", waterTemp);

					this.updateState({
						temperatures: newTemperatures,
						lastUpdate: new Date(),
					});

					this.checkDataInitialized();
				}
			}
			else if (message.startsWith("GTA")) {
				const airTemp = parseInt(message.substring(3), 10);
				if (!isNaN(airTemp)) {
					const newTemperatures = { ...this.temperatures };
					newTemperatures.air = airTemp;

					this.updateState({
						temperatures: newTemperatures,
						lastUpdate: new Date(),
					});
				}
			}
			else if (message.startsWith("GMD")) {
				const modeValue = message.substring(3);
				let newPumpMode: PumpMode;

				switch (modeValue) {
					case "0":
						newPumpMode = "off";
						break;
					case "1":
						newPumpMode = "on";
						break;
					case "2":
						newPumpMode = "auto";
						break;
					default:
						console.warn(`Mode de pompe non reconnu: ${modeValue}`);
						return;
				}

				this.hasReceivedPumpMode = true;
				console.log("⚡ Mode pompe reçu:", newPumpMode);

				this.updateState({
					pumpMode: newPumpMode,
					lastUpdate: new Date(),
				});

				this.checkDataInitialized();
			}
			else if (message.startsWith("GTS")) {
				const rest = message.substring(3);
				let slotIndex: number | null = null;
				let hoursValue: number | null = null;

				if (/^[0-5]\d{1,2}$/.test(rest)) {
					slotIndex = parseInt(rest.charAt(0), 10);
					hoursValue = parseInt(rest.substring(1), 10);
				}
				else if (/^\d{1,3}$/.test(rest)) {
					slotIndex = this.pendingSlotRequestIndex !== null ? this.pendingSlotRequestIndex : null;
					hoursValue = parseInt(rest, 10);
				}

				if (slotIndex !== null && hoursValue !== null && !isNaN(slotIndex) && !isNaN(hoursValue)) {
					if (slotIndex >= 0 && slotIndex <= 5) {
						const updatedSlots = [...this.timeSlots];
						updatedSlots[slotIndex] = hoursValue;
						this.updateState({ timeSlots: updatedSlots, lastUpdate: new Date() });
					}
				} else {
					console.log("Format GTS non reconnu:", message, "(pending index:", this.pendingSlotRequestIndex, ")");
				}

				// Par sécurité, on libère l'index pending (éventuelles demandes qui se chevauchent)
				this.pendingSlotRequestIndex = null;

				// Si on a un callback de chaîne de slots, déclencher le slot suivant
				if (this.slotChainCallback) {
					console.log("📋 Slot reçu, passage au suivant...");
					setTimeout(() => {
						this.slotChainCallback!();
					}, 200); // Petit délai pour laisser le module piscine respirer
				}
			}
			else if (message.startsWith("GER")) {
				const errorBits = parseInt(message.substring(3), 10);
				const newErrors: ErrorData = {
					clockError: (errorBits & 1) !== 0,
					waterSensorError: (errorBits & 2) !== 0,
					airSensorError: (errorBits & 4) !== 0,
					waterTransmissionError: (errorBits & 8) !== 0,
					airTransmissionError: (errorBits & 16) !== 0,
					waterBatteryLow: (errorBits & 32) !== 0,
					airBatteryLow: (errorBits & 64) !== 0,
				};
				this.hasReceivedErrors = true;
				this.updateState({ errors: newErrors, lastUpdate: new Date() });
				console.log("🚨 Erreurs de la piscine reçues:", newErrors);
				
				// Nettoyer le callback de chaîne de slots
				this.slotChainCallback = null;
				
				// Vérifier si toutes les données initiales sont reçues
				this.checkDataInitialized();
			}
		} catch (error) {
			console.error("Erreur lors du traitement du message:", error);
		}
	}

	static checkDataInitialized() {
		console.log("🔍 Vérification des données:", {
			hasReceivedPumpMode: this.hasReceivedPumpMode,
			hasReceivedTemperature: this.hasReceivedTemperature,
			hasReceivedErrors: this.hasReceivedErrors,
			dataInitialized: this.dataInitialized
		});
		
		// Si nous avons reçu à la fois la température, le mode de pompe et les erreurs, nous considérons les données comme initialisées
		if (this.hasReceivedPumpMode && this.hasReceivedTemperature && this.hasReceivedErrors && !this.dataInitialized) {
			console.log("✅ Toutes les données initiales ont été reçues - Interface activée");
			this.dataInitialized = true;
			this.notifyListeners();
		}
	}


	static sendMessage(message: string) {
		if (this.socket && this.isConnected) {
			console.log("Envoi de message:", message);
			this.socket.send(message);
		} else {
			console.warn("Impossible d'envoyer le message - WebSocket non connecté");
		}
	}

	static fetchTemperatures() {
		this.sendMessage("/temp/water");
		setTimeout(() => {
			this.sendMessage("/temp/air");
		}, 500);
	}

	static fetchPumpMode() {
		this.sendMessage("/pompe/mode");
	}

	static setPumpMode(mode: PumpMode) {
		this.sendMessage(`/pompe/${mode}`);

		this.updateState({ pumpMode: mode });
	}

	static fetchTimeSlot(index: number) {
		if (index < 0 || index > 5) return;
		this.pendingSlotRequestIndex = index;
		this.sendMessage(`/slot/${index}`);
	}

	static fetchAllTimeSlots() {
		// Créer une queue séquentielle pour éviter de surcharger le module piscine
		const slotsToFetch = [0, 1, 2, 3, 4, 5];
		let currentIndex = 0;

		const fetchNextSlot = () => {
			if (currentIndex < slotsToFetch.length) {
				const slotIndex = slotsToFetch[currentIndex];
				console.log(`📋 Récupération du slot ${slotIndex} (${currentIndex + 1}/${slotsToFetch.length})`);
				this.fetchTimeSlot(slotIndex);
				currentIndex++;
			} else {
				// Tous les slots ont été demandés, maintenant demander les erreurs
				console.log("📋 Tous les slots demandés, récupération des erreurs...");
				setTimeout(() => {
					this.fetchErrors();
				}, 500);
			}
		};

		// Stocker la fonction de callback pour la chaîne de slots
		this.slotChainCallback = fetchNextSlot;

		// Démarrer la séquence
		fetchNextSlot();
	}

	static incrementTimeSlot(index: number) {
		if (index < 0 || index > 5) return;
		this.pendingSlotRequestIndex = index;
		this.sendMessage(`/slot/${index}/add`);
	}

	static decrementTimeSlot(index: number) {
		if (index < 0 || index > 5) return;
		this.pendingSlotRequestIndex = index;
		this.sendMessage(`/slot/${index}/sub`);
	}

	static fetchErrors() {
		this.sendMessage("/errors");
	}

	static startDiscovery() {
		if (this.isDiscovering) return;

		this.updateState({
			isDiscovering: true,
			discoveredPools: [],
		});

		console.log("Démarrage de la découverte intelligente des piscines...");
		
		const isProduction = window.location.protocol === 'file:' || 
							window.location.hostname === 'localhost' && window.location.port === '' ||
							window.location.hostname === '' ||
							window.location.href.includes('capacitor://') ||
							window.location.href.includes('ionic://');
		
		console.log("Mode détecté:", isProduction ? "Production (Android/iOS)" : "Développement");
		console.log("URL actuelle:", window.location.href);
		console.log("Protocole:", window.location.protocol);
		console.log("Hostname:", window.location.hostname);
		console.log("Port:", window.location.port);

		const scanQueue: string[] = [];
		let totalScanned = 0;
		let activeScanCount = 0;
		const maxConcurrentScans = 20;

		const generateScanQueue = () => {
			const networkRanges = ["192.168.1", "192.168.0"];
			
			if (isProduction) {
				networkRanges.push("10.0.0", "172.16.0", "172.20.0", "172.24.0");
				console.log("Mode production: scan étendu sur", networkRanges.length, "plages réseau");
			}
			
			networkRanges.forEach(range => {
				for (let i = 1; i <= 10; i++) {
					scanQueue.push(`${range}.${i}`);
				}
			});

			networkRanges.forEach(range => {
				for (let i = 100; i <= 120; i++) {
					scanQueue.push(`${range}.${i}`);
				}
			});

			networkRanges.forEach(range => {
				for (let i = 110; i <= 115; i++) {
					if (!scanQueue.includes(`${range}.${i}`)) {
						scanQueue.push(`${range}.${i}`);
					}
				}
			});

			networkRanges.forEach(range => {
				for (let i = 121; i <= 200; i++) {
					if (!scanQueue.includes(`${range}.${i}`)) {
						scanQueue.push(`${range}.${i}`);
					}
				}
			});

			networkRanges.forEach(range => {
				for (let i = 11; i <= 99; i++) {
					scanQueue.push(`${range}.${i}`);
				}
			});

			networkRanges.forEach(range => {
				for (let i = 201; i <= 254; i++) {
					scanQueue.push(`${range}.${i}`);
				}
			});
		};

		generateScanQueue();
		
		const shuffleArray = (array: string[], start: number, end: number) => {
			for (let i = end - 1; i > start; i--) {
				const j = Math.floor(Math.random() * (i - start + 1)) + start;
				[array[i], array[j]] = [array[j], array[i]];
			}
		};

		shuffleArray(scanQueue, 0, Math.min(40, scanQueue.length));
		
		const totalToScan = scanQueue.length;
		console.log(`Scan intelligent: ${totalToScan} adresses à vérifier dans l'ordre de priorité`);

		const testIpAddress = (ip: string) => {
			activeScanCount++;

			console.log(`Test de ws://${ip}:81...`);

			const ws = new WebSocket(`ws://${ip}:81`);
			
			const connectionTimeoutMs = isProduction ? 2000 : 1200;
			const responseTimeoutMs = isProduction ? 1500 : 800;
			let hasResponse = false;
			let timeoutId: NodeJS.Timeout | null = null;
			
			const connectionTimeout = setTimeout(() => {
				if (!hasResponse) {
					ws.close();
					scanNextBatch();
				}
			}, connectionTimeoutMs);

			ws.onopen = () => {
				console.log(`WebSocket connecté à ${ip}, test de la commande...`);
				ws.send("/pompe/mode"); // Envoyer une commande de test

				timeoutId = setTimeout(() => {
					console.log(`Pas de réponse valide de ${ip}`);
					ws.close();
					scanNextBatch();
				}, responseTimeoutMs);
			};

			ws.onmessage = (event) => {
				hasResponse = true;
				clearTimeout(timeoutId as NodeJS.Timeout);
				clearTimeout(connectionTimeout);

				const response = event.data.toString();
				console.log(`Réponse reçue de ${ip}: ${response}`);

				if (response.startsWith("GMD") || response.startsWith("GTW") || response.startsWith("GTA")) {
					console.log(`🎯 Piscine détectée à ${ip} (réponse: ${response})`);

					const signalStrength = Math.floor(Math.random() * 2) + 4;

					const existingPool = this.discoveredPools.find(pool => pool.ip === ip);
					if (!existingPool) {
						const newPools = [
							...this.discoveredPools,
							{
								id: `pool-${ip}`,
								ip,
								name: `Piscine (${ip})`,
								signalStrength,
							},
						];

						this.updateState({ discoveredPools: newPools });
						console.log(`✅ Piscine ajoutée: ${ip} (Total: ${newPools.length})`);
					}
				} else {
					console.log(`❌ Réponse non valide de ${ip}: ${response}`);
				}

				ws.close();
				scanNextBatch();
			};

			ws.onerror = () => {
				if (!hasResponse) {
					clearTimeout(connectionTimeout);
					clearTimeout(timeoutId as NodeJS.Timeout);
					ws.close();
					scanNextBatch();
				}
			};

			ws.onclose = () => {
				clearTimeout(connectionTimeout);
				clearTimeout(timeoutId as NodeJS.Timeout);
			};
		};

		const scanNextBatch = () => {
			totalScanned++;
			activeScanCount--;

			if (totalScanned % 20 === 0 || this.discoveredPools.length > 0) {
				const progress = Math.floor((totalScanned / totalToScan) * 100);
				console.log(`📊 Progression: ${progress}% (${totalScanned}/${totalToScan}) | Piscines trouvées: ${this.discoveredPools.length}`);
			}

			if (totalScanned >= totalToScan && activeScanCount === 0) {
				console.log(`🏁 Scan terminé: ${this.discoveredPools.length} piscine(s) trouvée(s) sur ${totalToScan} adresses testées.`);
				this.stopDiscovery();
				return;
			}

			while (scanQueue.length > 0 && activeScanCount < maxConcurrentScans) {
				const nextIp = scanQueue.shift();
				if (nextIp) {
					testIpAddress(nextIp);
				}
			}
		};

		for (let i = 0; i < maxConcurrentScans && scanQueue.length > 0; i++) {
			const ip = scanQueue.shift();
			if (ip) {
				testIpAddress(ip);
			}
		}

		this.discoveryInterval = setTimeout(() => {
			if (this.isDiscovering) {
				console.log("⏰ Temps maximum de scan atteint, arrêt du scan.");
				this.stopDiscovery();
			}
		}, 60000);
	}

	static stopDiscovery() {
		if (this.discoveryInterval) {
			if (this.discoveryInterval) {
				clearTimeout(this.discoveryInterval);
			}
			this.discoveryInterval = null;
			this.updateState({ isDiscovering: false });
			console.log("🛑 Découverte des piscines arrêtée");
		}
	}

	static forceDataRefresh() {
		console.log("🔄 Force refresh des données - réinitialisation des flags");
		this.hasReceivedTemperature = false;
		this.hasReceivedPumpMode = false;
		this.hasReceivedErrors = false;
		this.dataInitialized = false;
		this.slotChainCallback = null;
		
		this.updateState({
			dataInitialized: false
		});
		
		// Relancer la récupération des données
		if (this.socket && this.isConnected) {
			setTimeout(() => {
				console.log("🔄 Relance des commandes de récupération");
				this.sendMessage("/pompe/mode");
				setTimeout(() => {
					this.sendMessage("/temp/water");
					setTimeout(() => {
						this.sendMessage("/temp/air");
						setTimeout(() => {
							this.fetchErrors();
						}, 500);
					}, 500);
				}, 500);
			}, 100);
		}
	}

	static async testSpecificIp(ip: string): Promise<boolean> {
		return new Promise((resolve) => {
			console.log(`🔍 Test direct de l'adresse ${ip}...`);
			
			const isProduction = window.location.protocol === 'file:' || 
								window.location.hostname === 'localhost' && window.location.port === '' ||
								window.location.hostname === '' ||
								window.location.href.includes('capacitor://') ||
								window.location.href.includes('ionic://');
			
			console.log(`🌐 Mode détecté: ${isProduction ? 'Production' : 'Développement'}`);
			console.log(`🔗 Tentative de connexion WebSocket à ws://${ip}:81...`);
			
			const ws = new WebSocket(`ws://${ip}:81`);
			let hasResponse = false;
			
			const connectionTimeoutMs = isProduction ? 5000 : 3000;
			const responseTimeoutMs = isProduction ? 4000 : 2000;
			
			const connectionTimeout = setTimeout(() => {
				if (!hasResponse) {
					console.log(`⏰ Timeout de connexion (${connectionTimeoutMs}ms) pour ${ip}`);
					ws.close();
					resolve(false);
				}
			}, connectionTimeoutMs);

			const responseTimeout = setTimeout(() => {
				console.log(`⏰ Timeout de réponse (${responseTimeoutMs}ms) pour ${ip}`);
				ws.close();
				resolve(false);
			}, responseTimeoutMs);

			ws.onopen = () => {
				console.log(`✅ WebSocket connecté à ${ip}, envoi de la commande test...`);
				ws.send("/pompe/mode");
			};

			ws.onmessage = (event) => {
				hasResponse = true;
				clearTimeout(connectionTimeout);
				clearTimeout(responseTimeout);

				const response = event.data.toString();
				console.log(`📨 Réponse de ${ip}: ${response}`);

				if (response.startsWith("GMD") || response.startsWith("GTW") || response.startsWith("GTA")) {
					console.log(`✅ Piscine confirmée à ${ip}`);
					
					const existingPool = this.discoveredPools.find(pool => pool.ip === ip);
					if (!existingPool) {
						const newPools = [
							...this.discoveredPools,
							{
								id: `pool-${ip}`,
								ip,
								name: `Piscine (${ip})`,
								signalStrength: 5,
							},
						];
						this.updateState({ discoveredPools: newPools });
					}
					
					ws.close();
					resolve(true);
				} else {
					console.log(`❌ Réponse invalide de ${ip}: ${response}`);
					ws.close();
					resolve(false);
				}
			};

			ws.onerror = (error) => {
				clearTimeout(connectionTimeout);
				clearTimeout(responseTimeout);
				console.log(`❌ Erreur de connexion à ${ip}:`, error);
				console.log(`🔍 Détails de l'erreur:`, {
					url: `ws://${ip}:81`,
					readyState: ws.readyState,
					protocol: window.location.protocol,
					hostname: window.location.hostname
				});
				resolve(false);
			};

			ws.onclose = () => {
				clearTimeout(connectionTimeout);
				clearTimeout(responseTimeout);
			};
		});
	}

	static async initialize() {
		if (!this.initialized) {
			console.log("Initialisation unique du WebSocket global");
			this.initialized = true;

			const hasPairedPool = await this.loadPairedPoolIp();
			if (hasPairedPool) {
				this.connectWebSocket();
			} else {
				this.startDiscovery();
			}
		}
	}
}

const defaultContext: WebSocketContextType = {
	isConnected: false,
	dataInitialized: false,
	temperatures: { water: 0, air: 0, trend: 0 },
	pumpMode: "off",
	timeSlots: [0,0,0,0,0,0],
	lastUpdate: null,
	errors: {
		clockError: false,
		waterSensorError: false,
		airSensorError: false,
		waterTransmissionError: false,
		airTransmissionError: false,
		waterBatteryLow: false,
		airBatteryLow: false
	},
	sendMessage: () => {},
	fetchTemperatures: () => {},
	fetchPumpMode: () => {},
	setPumpMode: () => {},
	fetchTimeSlot: () => {},
	fetchAllTimeSlots: () => {},
	incrementTimeSlot: () => {},
	decrementTimeSlot: () => {},
	fetchErrors: () => {},

	isPaired: false,
	pairedPoolIp: null,
	discoveredPools: [],
	isDiscovering: false,
	startDiscovery: () => {},
	stopDiscovery: () => {},
	testSpecificIp: async () => false,
	forceDataRefresh: () => {},
	connectToPool: async () => false,
	disconnectFromPool: async () => {},
};

export const WebSocketContext = createContext<WebSocketContextType>(defaultContext);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [, forceUpdate] = useState({});

	useEffect(() => {
		GlobalWebSocketState.initialize();

		const unsubscribe = GlobalWebSocketState.subscribe(() => {
			forceUpdate({});
		});

		return () => {
			unsubscribe();
		};
	}, []);

	const contextValue: WebSocketContextType = {
		isConnected: GlobalWebSocketState.isConnected,
		dataInitialized: GlobalWebSocketState.dataInitialized,
		temperatures: GlobalWebSocketState.temperatures,
		pumpMode: GlobalWebSocketState.pumpMode,
		timeSlots: GlobalWebSocketState.timeSlots,
		lastUpdate: GlobalWebSocketState.lastUpdate,
		errors: GlobalWebSocketState.errors,
		sendMessage: (message) => GlobalWebSocketState.sendMessage(message),
		fetchTemperatures: () => GlobalWebSocketState.fetchTemperatures(),
		fetchPumpMode: () => GlobalWebSocketState.fetchPumpMode(),
		setPumpMode: (mode) => GlobalWebSocketState.setPumpMode(mode),
		fetchTimeSlot: (i) => GlobalWebSocketState.fetchTimeSlot(i),
		fetchAllTimeSlots: () => GlobalWebSocketState.fetchAllTimeSlots(),
		incrementTimeSlot: (i) => GlobalWebSocketState.incrementTimeSlot(i),
		decrementTimeSlot: (i) => GlobalWebSocketState.decrementTimeSlot(i),
		fetchErrors: () => GlobalWebSocketState.fetchErrors(),

		isPaired: GlobalWebSocketState.isPaired,
		pairedPoolIp: GlobalWebSocketState.pairedPoolIp,
		discoveredPools: GlobalWebSocketState.discoveredPools,
		isDiscovering: GlobalWebSocketState.isDiscovering,
		startDiscovery: () => GlobalWebSocketState.startDiscovery(),
		stopDiscovery: () => GlobalWebSocketState.stopDiscovery(),
		testSpecificIp: (ip) => GlobalWebSocketState.testSpecificIp(ip),
		forceDataRefresh: () => GlobalWebSocketState.forceDataRefresh(),
		connectToPool: (ip) => GlobalWebSocketState.connectToPool(ip),
		disconnectFromPool: () => GlobalWebSocketState.disconnectFromPool(),
	};

	return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>;
};

export function useWebSocket() {
	const context = useContext(WebSocketContext);
	if (context === undefined) {
		throw new Error("useWebSocket doit être utilisé à l'intérieur d'un WebSocketProvider");
	}
	return context;
}

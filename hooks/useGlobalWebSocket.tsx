import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Interface pour les températures
interface TemperatureData {
	water: number;
	air: number;
	trend: number;
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
	lastUpdate: Date | null;
	sendMessage: (message: string) => void;
	fetchTemperatures: () => void;
	fetchPumpMode: () => void;
	setPumpMode: (mode: PumpMode) => void;

	// Propriétés de découverte et d'appairage
	isPaired: boolean;
	pairedPoolIp: string | null;
	discoveredPools: DiscoveredPool[];
	isDiscovering: boolean;
	startDiscovery: () => void;
	stopDiscovery: () => void;
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
	static lastUpdate: Date | null = null;
	static listeners: Set<Function> = new Set();
	static reconnectTimeout: NodeJS.Timeout | null = null;
	static initialized: boolean = false;
	static hasReceivedTemperature: boolean = false;
	static hasReceivedPumpMode: boolean = false;

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
			lastUpdate: Date | null;
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

		if (newState.lastUpdate !== undefined) {
			this.lastUpdate = newState.lastUpdate;
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

	// Chargement de l'IP appairée depuis AsyncStorage
	static async loadPairedPoolIp() {
		try {
			const poolIp = await AsyncStorage.getItem(PAIRED_POOL_IP_KEY);
			if (poolIp) {
				console.log("IP de piscine appairée chargée:", poolIp);
				this.pairedPoolIp = poolIp;
				this.isPaired = true;
				this.notifyListeners();
				return true;
			}
		} catch (error) {
			console.error("Erreur lors du chargement de l'IP de la piscine:", error);
		}
		return false;
	}

	// Sauvegarde de l'IP appairée dans AsyncStorage
	static async savePairedPoolIp(ip: string | null) {
		try {
			if (ip) {
				await AsyncStorage.setItem(PAIRED_POOL_IP_KEY, ip);
				console.log("IP de piscine sauvegardée:", ip);
			} else {
				await AsyncStorage.removeItem(PAIRED_POOL_IP_KEY);
				console.log("IP de piscine supprimée");
			}
			return true;
		} catch (error) {
			console.error("Erreur lors de la sauvegarde de l'IP de la piscine:", error);
			return false;
		}
	}

	// Connexion à une piscine spécifique
	static async connectToPool(ip: string): Promise<boolean> {
		// Arrêter la connexion existante si elle existe
		if (this.socket) {
			this.socket.close();
			this.socket = null;
		}

		// Sauvegarder l'IP et mettre à jour l'état
		const saveSuccess = await this.savePairedPoolIp(ip);
		if (saveSuccess) {
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

	// Déconnexion de la piscine appairée
	static async disconnectFromPool(): Promise<void> {
		// Fermer la connexion WebSocket
		if (this.socket) {
			this.socket.close();
			this.socket = null;
		}

		// Supprimer l'IP sauvegardée et mettre à jour l'état
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
	}

	// Fonction pour se connecter au WebSocket avec l'IP fournie
	static async connectWebSocket(ip: string | null = null) {
		// Utiliser l'IP fournie ou l'IP appairée
		const wsIp = ip || this.pairedPoolIp;

		// Ne pas continuer s'il n'y a pas d'IP
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

				// Récupérer les données initiales après la connexion
				setTimeout(() => {
					console.log("Récupération des données initiales");
					if (ws.readyState === WebSocket.OPEN) {
						// Récupérer le mode de la pompe
						ws.send("/pompe/mode");

						// Puis les températures avec délai
						setTimeout(() => {
							ws.send("/temp/water");
							setTimeout(() => {
								ws.send("/temp/air");
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

				// Planifier une reconnexion seulement si on est toujours appairé
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
			// Planifier une tentative de reconnexion si on est appairé
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

	// Traitement des messages entrants
	static processIncomingMessage(message: string) {
		try {
			// Format attendu pour la température de l'eau: GTWxx
			if (message.startsWith("GTW")) {
				const waterTemp = parseInt(message.substring(3), 10);
				if (!isNaN(waterTemp)) {
					const newTemperatures = { ...this.temperatures };
					newTemperatures.water = waterTemp;

					// Calculer la tendance si on a déjà une température d'eau précédente
					if (this.temperatures.water !== 0 && this.temperatures.water !== waterTemp) {
						newTemperatures.trend = waterTemp - this.temperatures.water;
					}

					this.hasReceivedTemperature = true;

					this.updateState({
						temperatures: newTemperatures,
						lastUpdate: new Date(),
					});

					// Vérifier si toutes les données initiales sont reçues
					this.checkDataInitialized();
				}
			}
			// Format attendu pour la température de l'air: GTAxx
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
			// Format attendu pour le mode de la pompe: GMD0, GMD1 ou GMD2
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

				this.updateState({
					pumpMode: newPumpMode,
					lastUpdate: new Date(),
				});

				// Vérifier si toutes les données initiales sont reçues
				this.checkDataInitialized();
			}
		} catch (error) {
			console.error("Erreur lors du traitement du message:", error);
		}
	}

	// Vérifier si toutes les données nécessaires ont été initialisées
	static checkDataInitialized() {
		// Si nous avons reçu à la fois la température et le mode de pompe, nous considérons les données comme initialisées
		if (this.hasReceivedPumpMode && this.hasReceivedTemperature && !this.dataInitialized) {
			console.log("Toutes les données initiales ont été reçues");
			this.dataInitialized = true;
			this.notifyListeners();
		}
	}

	// Fonction pour envoyer des messages
	static sendMessage(message: string) {
		if (this.socket && this.isConnected) {
			console.log("Envoi de message:", message);
			this.socket.send(message);
		} else {
			console.warn("Impossible d'envoyer le message - WebSocket non connecté");
		}
	}

	// Fonction pour récupérer les températures
	static fetchTemperatures() {
		this.sendMessage("/temp/water");
		setTimeout(() => {
			this.sendMessage("/temp/air");
		}, 500); // Délai pour éviter les collisions
	}

	// Fonction pour récupérer le mode de la pompe
	static fetchPumpMode() {
		this.sendMessage("/pompe/mode");
	}

	// Fonction pour définir le mode de la pompe
	static setPumpMode(mode: PumpMode) {
		// Envoyer la commande au serveur avec le bon format
		this.sendMessage(`/pompe/${mode}`);

		// Mettre à jour l'état local immédiatement pour une meilleure réactivité de l'UI
		// Le serveur confirmera le changement en renvoyant le mode actuel
		this.updateState({ pumpMode: mode });
	} // Démarrer la découverte des piscines
	static startDiscovery() {
		if (this.isDiscovering) return;

		this.updateState({
			isDiscovering: true,
			discoveredPools: [],
		});

		console.log("Démarrage de la découverte rapide des piscines...");

		// Optimisations pour scan rapide :
		// 1. Scanner uniquement les adresses IP les plus probables (plages courantes pour les appareils IoT)
		// 2. Concentrer d'abord sur la plage 192.168.1.x qui est plus commune
		// 3. Commencer par les adresses terminant par 1 à 20, car souvent utilisées pour les points d'accès
		const scanQueue: string[] = [];
		let totalScanned = 0;
		let activeScanCount = 0;
		const maxConcurrentScans = 15; // Nombre maximum de scans simultanés pour plus de rapidité

		// Ajouter d'abord les adresses les plus probables
		["192.168.1", "192.168.0"].forEach((range) => {
			// Adresses courantes pour les points d'accès et routeurs (1-10)
			for (let i = 1; i <= 10; i++) {
				scanQueue.push(`${range}.${i}`);
			}

			// Plage d'adresses typiques pour les appareils IoT (100-150)
			for (let i = 100; i <= 150; i++) {
				scanQueue.push(`${range}.${i}`);
			}

			// Quelques adresses supplémentaires qui pourraient contenir des appareils
			[50, 60, 70, 80, 90, 200, 201, 202, 203, 204, 205, 250, 251, 252, 253, 254].forEach((i) => {
				scanQueue.push(`${range}.${i}`);
			});
		});

		// Calculer le nombre total d'adresses à scanner
		const totalToScan = scanQueue.length;
		console.log(`Scan rapide: ${totalToScan} adresses à vérifier`);

		// Fonction pour tester une adresse IP
		const testIpAddress = (ip: string) => {
			activeScanCount++;

			// Essayer de se connecter à l'adresse IP avec un WebSocket
			console.log(`Tentative de connexion à ws://${ip}:81...`);

			const ws = new WebSocket(`ws://${ip}:81`);
			let hasResponse = false;
			let timeoutId: NodeJS.Timeout | null = null; // Définir un délai d'attente pour la connexion (réduit pour accélérer le scan)
			const connectionTimeout = setTimeout(() => {
				if (!hasResponse) {
					console.log(`Délai d'attente dépassé pour ${ip}`);
					ws.close();
					scanNextBatch();
				}
			}, 1500); // Réduit de 3000ms à 1500ms

			ws.onopen = () => {
				console.log(`WebSocket ouvert pour ${ip}, envoi d'une commande de test...`);
				ws.send("/pompe/mode"); // Envoyer une commande de test

				// Définir un délai d'attente pour la réponse (réduit pour accélérer le scan)
				timeoutId = setTimeout(() => {
					console.log(`Pas de réponse de ${ip}, fermeture de la connexion`);
					ws.close();
					scanNextBatch();
				}, 1000); // Réduit de 2000ms à 1000ms
			};

			ws.onmessage = (event) => {
				hasResponse = true;
				clearTimeout(timeoutId as NodeJS.Timeout);

				const response = event.data.toString();
				console.log(`Réponse reçue de ${ip}: ${response}`);

				// Vérifier si la réponse correspond au format attendu d'une piscine
				// Par exemple, vérifie si la réponse commence par "GMD"
				if (response.startsWith("GMD")) {
					console.log(`Appareil détecté comme une piscine à ${ip}`);

					// Déterminer la force du signal (simulée pour l'instant)
					const signalStrength = Math.floor(Math.random() * 3) + 3; // 3-5

					// Ajouter la piscine détectée à la liste
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
				}

				ws.close();
				scanNextBatch();
			};

			ws.onerror = () => {
				// Une erreur indique généralement qu'il n'y a pas de WebSocket à cette adresse
				if (!hasResponse) {
					clearTimeout(connectionTimeout);
					clearTimeout(timeoutId as NodeJS.Timeout);
					ws.close();
					scanNextBatch();
				}
			};

			ws.onclose = () => {
				// Nettoyage en cas de fermeture
				clearTimeout(connectionTimeout);
				clearTimeout(timeoutId as NodeJS.Timeout);
			};
		};
		// Fonction pour scanner le prochain lot d'IPs
		const scanNextBatch = () => {
			totalScanned++;
			activeScanCount--;

			// Mettre à jour le pourcentage de progression pour l'utilisateur
			if (totalScanned % 10 === 0) {
				const progress = Math.floor((totalScanned / totalToScan) * 100);
				console.log(`Progression du scan: ${progress}%`);
			}

			// Vérifier si nous avons terminé tous les scans ou trouvé au moins une piscine
			if ((totalScanned >= totalToScan && activeScanCount === 0) || this.discoveredPools.length > 0) {
				// Arrêter le scan si on a terminé ou si on a déjà trouvé au moins une piscine
				if (this.discoveredPools.length > 0) {
					console.log(`Scan terminé avec succès: ${this.discoveredPools.length} piscine(s) trouvée(s).`);
				} else {
					console.log("Scan terminé, aucune piscine n'a été trouvée.");
				}
				this.stopDiscovery();
				return;
			}

			// Lancer les prochains scans si la file n'est pas vide et que nous n'avons pas atteint le nombre maximum de scans simultanés
			while (scanQueue.length > 0 && activeScanCount < maxConcurrentScans) {
				const nextIp = scanQueue.shift();
				if (nextIp) {
					testIpAddress(nextIp);
				}
			}
		};

		// Commencer le scan avec les premiers lots d'IPs
		for (let i = 0; i < maxConcurrentScans && scanQueue.length > 0; i++) {
			const ip = scanQueue.shift();
			if (ip) {
				testIpAddress(ip);
			}
		}
		// Configurer un délai maximum pour le scan complet (réduit pour une expérience utilisateur plus rapide)
		this.discoveryInterval = setTimeout(() => {
			if (this.isDiscovering) {
				console.log("Temps maximum de scan atteint, arrêt du scan.");
				this.stopDiscovery();
			}
		}, 30000); // 30 secondes maximum
	}

	// Arrêter la découverte des piscines
	static stopDiscovery() {
		if (this.discoveryInterval) {
			// Vérifier et nettoyer l'intervalle/timeout correctement
			if (this.discoveryInterval) {
				clearTimeout(this.discoveryInterval);
			}
			this.discoveryInterval = null;
			this.updateState({ isDiscovering: false });
			console.log("Découverte des piscines arrêtée");
		}
	}

	// Initialisation du WebSocket
	static async initialize() {
		if (!this.initialized) {
			console.log("Initialisation unique du WebSocket global");
			this.initialized = true;

			// Charger l'IP de la piscine appairée
			const hasPairedPool = await this.loadPairedPoolIp();
			if (hasPairedPool) {
				// Si une piscine est déjà appairée, s'y connecter
				this.connectWebSocket();
			} else {
				// Sinon, démarrer la découverte des piscines
				this.startDiscovery();
			}
		}
	}
}

// Valeurs par défaut pour le contexte
const defaultContext: WebSocketContextType = {
	isConnected: false,
	dataInitialized: false,
	temperatures: { water: 0, air: 0, trend: 0 },
	pumpMode: "off",
	lastUpdate: null,
	sendMessage: () => {},
	fetchTemperatures: () => {},
	fetchPumpMode: () => {},
	setPumpMode: () => {},

	// Valeurs par défaut pour la découverte et l'appairage
	isPaired: false,
	pairedPoolIp: null,
	discoveredPools: [],
	isDiscovering: false,
	startDiscovery: () => {},
	stopDiscovery: () => {},
	connectToPool: async () => false,
	disconnectFromPool: async () => {},
};

// Création du contexte
export const WebSocketContext = createContext<WebSocketContextType>(defaultContext);

// Provider du WebSocket
export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	// État local utilisé uniquement pour forcer le rendu quand les données globales changent
	const [, forceUpdate] = useState({});

	// Initialiser le WebSocket au premier montage
	useEffect(() => {
		// Initialiser le WebSocket global s'il ne l'est pas déjà
		GlobalWebSocketState.initialize();

		// S'abonner aux changements d'état pour forcer les re-rendus
		const unsubscribe = GlobalWebSocketState.subscribe(() => {
			forceUpdate({});
		});

		// Nettoyage à la destruction du composant
		return () => {
			unsubscribe();
		};
	}, []);

	// Créer un objet de contexte avec les données actuelles
	const contextValue: WebSocketContextType = {
		isConnected: GlobalWebSocketState.isConnected,
		dataInitialized: GlobalWebSocketState.dataInitialized,
		temperatures: GlobalWebSocketState.temperatures,
		pumpMode: GlobalWebSocketState.pumpMode,
		lastUpdate: GlobalWebSocketState.lastUpdate,
		sendMessage: (message) => GlobalWebSocketState.sendMessage(message),
		fetchTemperatures: () => GlobalWebSocketState.fetchTemperatures(),
		fetchPumpMode: () => GlobalWebSocketState.fetchPumpMode(),
		setPumpMode: (mode) => GlobalWebSocketState.setPumpMode(mode),

		// Propriétés de découverte et d'appairage
		isPaired: GlobalWebSocketState.isPaired,
		pairedPoolIp: GlobalWebSocketState.pairedPoolIp,
		discoveredPools: GlobalWebSocketState.discoveredPools,
		isDiscovering: GlobalWebSocketState.isDiscovering,
		startDiscovery: () => GlobalWebSocketState.startDiscovery(),
		stopDiscovery: () => GlobalWebSocketState.stopDiscovery(),
		connectToPool: (ip) => GlobalWebSocketState.connectToPool(ip),
		disconnectFromPool: () => GlobalWebSocketState.disconnectFromPool(),
	};

	return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>;
};

// Hook pour utiliser le contexte WebSocket
export function useWebSocket() {
	const context = useContext(WebSocketContext);
	if (context === undefined) {
		throw new Error("useWebSocket doit être utilisé à l'intérieur d'un WebSocketProvider");
	}
	return context;
}

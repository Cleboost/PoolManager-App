import React, { useState, useEffect } from "react";
import { StyleSheet, SafeAreaView, Platform, StatusBar, ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card } from "@/components/Card";
import { EditableTitle } from "@/components/header/EditableTitle";
import { AnimatedTime } from "@/components/AnimatedTime";
import { TemperatureCard } from "@/components/temperature/TemperatureCard";
import { PumpCard } from "@/components/pump/PumpCard";
import { TemperatureRangesCard } from "@/components/temperature/TemperatureRangesCard";
import { PoolDiscoveryCard } from "@/components/pool/PoolDiscoveryCard";
import { Ionicons } from "@expo/vector-icons";
import useTemperature from "../hooks/useTemperature";
import { WebSocketProvider, useWebSocket, PumpMode } from "../hooks/useGlobalWebSocket";

// Composant principal de l'app
export default function App() {
	// L'app est uniquement responsable d'initialiser le WebSocketProvider
	return (
		<WebSocketProvider>
			<AppContent />
		</WebSocketProvider>
	);
}

// Composant interne qui utilise les hooks
function AppContent() {
	const [poolName, setPoolName] = useState("Ma Piscine");
	const [previousPumpMode, setPreviousPumpMode] = useState<"on" | "off">("off");
	const temperature = useTemperature();
	const { isConnected, dataInitialized, fetchTemperatures, pumpMode, setPumpMode, isPaired, isDiscovering, discoveredPools, startDiscovery, stopDiscovery, connectToPool, disconnectFromPool } = useWebSocket();

	const handleAutoModeChange = (isAuto: boolean) => {
		if (isAuto) {
			setPreviousPumpMode(pumpMode === "auto" ? "off" : pumpMode);
			setPumpMode("auto");
		} else {
			setPumpMode(previousPumpMode);
		}
	};

	const handlePumpModeChange = (newMode: PumpMode) => {
		setPumpMode(newMode);
		if (newMode !== "auto") {
			setPreviousPumpMode(newMode as "on" | "off");
		}
	};

	const handleSaveNewName = async (newName: string) => {
		try {
			await AsyncStorage.setItem("poolName", newName);
			setPoolName(newName);
		} catch (error) {
			console.error("Erreur lors de la sauvegarde du nom:", error);
		}
	};

	const handleRefresh = () => {
		fetchTemperatures();
	};

	// Charger le nom de la piscine au démarrage
	useEffect(() => {
		const loadPoolName = async () => {
			try {
				const savedName = await AsyncStorage.getItem("poolName");
				if (savedName) setPoolName(savedName);
			} catch (error) {
				console.error("Erreur lors du chargement du nom:", error);
			}
		};
		loadPoolName();
	}, []); // Gérer l'appairage d'une piscine
	const handleConnectToPool = async (poolIp: string) => {
		const success = await connectToPool(poolIp);
		if (success) {
			console.log(`Appairé avec succès à la piscine: ${poolIp}`);
		} else {
			console.error(`Échec de l'appairage avec la piscine: ${poolIp}`);
		}
	};

	// Gérer le désappairage de la piscine
	const handleDisconnectFromPool = async () => {
		await disconnectFromPool();
		console.log("Désappairage de la piscine effectué");
	};

	// Calculer l'état d'affichage avant le rendu pour éviter le flash
	const showLoadingScreen = isPaired && isConnected && !dataInitialized;
	const showDiscoveryScreen = !isPaired;

	return (
		<SafeAreaView style={styles.container}>
			{showDiscoveryScreen ? (
				/* Écran de découverte - s'affiche uniquement si aucune piscine n'est appairée */
				<View style={styles.discoveryContainer}>
					<Card>
						<View style={styles.header}>
							<Text style={styles.welcomeTitle}>Bienvenue dans PoolManager</Text>
						</View>
						<Text style={styles.welcomeText}>Pour commencer, veuillez connecter votre piscine à l'application.</Text>
					</Card>

					<View style={{ height: 16 }} />

					{/* Composant de découverte des piscines */}
					<PoolDiscoveryCard pools={discoveredPools} isDiscovering={isDiscovering} onConnectPress={handleConnectToPool} onStartDiscovery={startDiscovery} onStopDiscovery={stopDiscovery} />
				</View>
			) : showLoadingScreen ? (
				/* Écran de chargement - ne s'affiche que si connecté mais données non initialisées */
				<View style={styles.loadingContainer}>
					<Card>
						<View style={styles.header}>
							<EditableTitle value={poolName} onSave={handleSaveNewName} />
							<View style={[styles.connectionIndicator, { backgroundColor: "#FFA000" }]}>
								<Text style={styles.connectionText}>Initialisation...</Text>
							</View>
						</View>
						<View style={styles.loadingContent}>
							<Ionicons name="refresh" size={36} color="#2196F3" style={styles.loadingIcon} />
							<Text style={styles.loadingText}>Récupération des données en cours...</Text>
							<Text style={styles.loadingSubText}>Obtention des températures et du mode de pompe</Text>
						</View>
					</Card>
				</View>
			) : (
				<ScrollView>
					{/* En-tête avec indicateur de connexion */}
					<Card>
						<View style={styles.header}>
							<EditableTitle value={poolName} onSave={handleSaveNewName} />
							<View style={[styles.connectionIndicator, { backgroundColor: isConnected ? "#4CAF50" : "#F44336" }]}>
								<Text style={styles.connectionText}>{isConnected ? "Connecté" : "Déconnecté"}</Text>
							</View>
						</View>
						<AnimatedTime />
					</Card>{" "}
					{/* Températures */}
					<TemperatureCard waterTemp={temperature.water} airTemp={temperature.air} trend={temperature.trend} />
					{/* Pompe avec indicateur mode auto intégré */}
					<PumpCard mode={pumpMode} onModeChange={handlePumpModeChange} onAutoModeChange={handleAutoModeChange} waterTemp={temperature.water} />
					{/* Plages de température */}
					<TemperatureRangesCard /> {/* Bouton pour rafraîchir les données */}
					<TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
						<Ionicons name="refresh" size={24} color="#FFFFFF" />
						<Text style={styles.refreshText}>Actualiser les données</Text>
					</TouchableOpacity>
					{/* Bouton de désappairage */}
					<TouchableOpacity
						style={styles.unpairButton}
						onPress={() => {
							Alert.alert("Désappairer la piscine", "Êtes-vous sûr de vouloir désappairer cette piscine ? Vous devrez la rechercher à nouveau pour vous y reconnecter.", [
								{ text: "Annuler", style: "cancel" },
								{ text: "Désappairer", style: "destructive", onPress: handleDisconnectFromPool },
							]);
						}}
					>
						<Ionicons name="unlink-outline" size={24} color="#FFFFFF" />
						<Text style={styles.unpairButtonText}>Désappairer cette piscine</Text>
					</TouchableOpacity>
				</ScrollView>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
		paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
		padding: 16,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	connectionIndicator: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	connectionText: {
		color: "white",
		fontSize: 12,
		fontWeight: "600",
	},
	refreshButton: {
		backgroundColor: "#2196F3",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		marginTop: 16,
		marginBottom: 24,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	refreshText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
		marginLeft: 8,
	},
	// Styles pour l'écran de chargement
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingContent: {
		alignItems: "center",
		padding: 16,
	},
	loadingIcon: {
		marginBottom: 16,
	},
	loadingText: {
		fontSize: 18,
		fontWeight: "600",
		color: "#2196F3",
		marginBottom: 8,
		textAlign: "center",
	},
	loadingSubText: {
		fontSize: 14,
		color: "#757575",
		textAlign: "center",
	},
	// Styles pour l'écran de découverte
	discoveryContainer: {
		flex: 1,
		paddingTop: 24,
	},
	welcomeTitle: {
		fontSize: 22,
		fontWeight: "700",
		color: "#333",
		marginBottom: 4,
	},
	welcomeText: {
		fontSize: 16,
		color: "#666",
		marginVertical: 8,
		lineHeight: 22,
	},
	// Style pour le bouton de désappairage
	unpairButton: {
		backgroundColor: "#FF5252",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		marginTop: 8,
		marginBottom: 24,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	unpairButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
		marginLeft: 8,
	},
});

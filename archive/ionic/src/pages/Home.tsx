import React, { useState, useEffect } from "react";
import { 
	IonPage, 
	IonContent, 
	IonHeader, 
	IonToolbar, 
	IonTitle, 
	IonText, 
	IonButton, 
	IonIcon,
	IonAlert,
	IonSpinner
} from "@ionic/react";
import { refreshOutline, unlinkOutline } from 'ionicons/icons';
import { Card } from "../components/Card";
import { EditableTitle } from "../components/header/EditableTitle";
import { AnimatedTime } from "../components/AnimatedTime";
import { TemperatureCard } from "../components/temperature/TemperatureCard";
import { PumpCard } from "../components/pump/PumpCard";
import { TimeSlotsCard } from "../components/scheduler/TimeSlotsCard";
import { ErrorsCard } from "../components/errors/ErrorsCard";
import { PoolDiscoveryCard } from "../components/pool/PoolDiscoveryCard";
import useTemperature from "../hooks/useTemperature";
import { WebSocketProvider, useWebSocket, PumpMode } from "../hooks/useGlobalWebSocket";
import { Preferences } from '@capacitor/preferences';

// Composant principal de l'app
export default function Home() {
	// L'app est uniquement responsable d'initialiser le WebSocketProvider
	return (
		<WebSocketProvider>
			<HomeContent />
		</WebSocketProvider>
	);
}

// Composant interne qui utilise les hooks
function HomeContent() {
	const [poolName, setPoolName] = useState("Ma Piscine");
	const [previousPumpMode, setPreviousPumpMode] = useState<"on" | "off">("off");
	const [storageInitialized, setStorageInitialized] = useState<boolean>(false);
	const [showUnpairAlert, setShowUnpairAlert] = useState<boolean>(false);
	const temperature = useTemperature();
	const { 
		isConnected, 
		dataInitialized, 
		fetchTemperatures, 
		pumpMode, 
		setPumpMode, 
		isPaired, 
		isDiscovering, 
		discoveredPools, 
		startDiscovery, 
		stopDiscovery, 
		connectToPool, 
		disconnectFromPool,
		forceDataRefresh,
		testSpecificIp,
		timeSlots,
		fetchAllTimeSlots,
		incrementTimeSlot,
		decrementTimeSlot,
		errors,
		fetchErrors
	} = useWebSocket();

	// Initialiser le stockage
	useEffect(() => {
		setStorageInitialized(true);
	}, []);

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
			await Preferences.set({ key: "poolName", value: newName });
			setPoolName(newName);
		} catch (error) {
			console.error("Erreur lors de la sauvegarde du nom:", error);
		}
	};

	const handleRefresh = () => {
		fetchTemperatures();
		fetchErrors();
	};

	// Charger le nom de la piscine au démarrage
	useEffect(() => {
		const loadPoolName = async () => {
			try {
				const result = await Preferences.get({ key: "poolName" });
				if (result.value) setPoolName(result.value);
			} catch (error) {
				console.error("Erreur lors du chargement du nom:", error);
			}
		};
		if (storageInitialized) {
			loadPoolName();
		}
	}, [storageInitialized]);

	// Gérer l'appairage d'une piscine
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
		setShowUnpairAlert(false);
		console.log("Désappairage de la piscine effectué");
	};

	// Calculer l'état d'affichage avant le rendu pour éviter le flash
	const showLoadingScreen = isPaired && !dataInitialized;
	const showDiscoveryScreen = !isPaired;
	
	// Debug: afficher l'état des variables
	console.log("🔍 État de l'interface:", {
		isPaired,
		isConnected,
		dataInitialized,
		showLoadingScreen,
		showDiscoveryScreen,
		temperatures: temperature,
		pumpMode
	});
	
	// Log plus détaillé pour identifier le problème
	if (!showDiscoveryScreen && !showLoadingScreen && !(isPaired && dataInitialized)) {
		console.error("🚨 ÉCRAN GRIS DÉTECTÉ - État problématique:", {
			isPaired,
			isConnected,
			dataInitialized,
			showLoadingScreen,
			showDiscoveryScreen,
			"Condition écran principal": isPaired && dataInitialized
		});
	}

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Pool Manager</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent className="ion-padding">
				{showDiscoveryScreen ? (
					/* Écran de découverte - s'affiche uniquement si aucune piscine n'est appairée */
					<div className="discovery-container">
						<Card>
							<div className="welcome-header">
								<IonText className="welcome-title">Bienvenue dans PoolManager</IonText>
							</div>
							<IonText className="welcome-text">
								Pour commencer, veuillez connecter votre piscine à l'application.
							</IonText>
						</Card>

						<div style={{ height: "16px" }} />

						{/* Composant de découverte des piscines */}
											<PoolDiscoveryCard
						pools={discoveredPools}
						isDiscovering={isDiscovering}
						onConnectPress={handleConnectToPool}
						onStartDiscovery={startDiscovery}
						onStopDiscovery={stopDiscovery}
						onTestSpecificIp={testSpecificIp}
					/>
					</div>
				) : showLoadingScreen ? (
					/* Écran de chargement - ne s'affiche que si connecté mais données non initialisées */
					<div className="loading-container">
						<Card>
							<div className="loading-header">
								<EditableTitle value={poolName} onSave={handleSaveNewName} />
								<IonText className="loading-connection-text">Initialisation...</IonText>
							</div>
							<div className="loading-content">
								<IonSpinner name="crescent" />
								<IonText className="loading-text">Récupération des données en cours...</IonText>
								<IonText className="loading-sub-text">Obtention des températures et du mode de pompe</IonText>
							</div>
						</Card>
					</div>
				) : isPaired && dataInitialized ? (
					<div className="main-content">
						{/* En-tête avec indicateur de connexion */}
						<Card>
							<div className="main-header">
								<EditableTitle value={poolName} onSave={handleSaveNewName} />
								<IonText className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
									{isConnected ? "Connecté" : "Déconnecté"}
								</IonText>
							</div>
							<AnimatedTime />
						</Card>

						{/* Températures */}
						<TemperatureCard waterTemp={temperature.water} airTemp={temperature.air} trend={temperature.trend} />
						
						{/* Pompe avec indicateur mode auto intégré */}
						<PumpCard 
							mode={pumpMode} 
							onModeChange={handlePumpModeChange} 
							onAutoModeChange={handleAutoModeChange} 
							waterTemp={temperature.water} 
						/>
						{/* Plages horaires (0..5) */}
						<TimeSlotsCard 
							timeSlots={timeSlots}
							onRefreshAll={fetchAllTimeSlots}
							onIncrement={incrementTimeSlot}
							onDecrement={decrementTimeSlot}
						/>
						
						{/* Erreurs de la piscine */}
						<ErrorsCard errors={errors} />
						
						{/* Bouton pour rafraîchir les données */}
						<IonButton 
							expand="block" 
							onClick={handleRefresh}
							className="refresh-button"
						>
							<IonIcon icon={refreshOutline} slot="start" />
							Actualiser les données
						</IonButton>
						
						{/* Bouton de désappairage */}
						<IonButton 
							expand="block" 
							fill="outline" 
							color="danger"
							onClick={() => setShowUnpairAlert(true)}
							className="unpair-button"
						>
							<IonIcon icon={unlinkOutline} slot="start" />
							Désappairer cette piscine
						</IonButton>
					</div>
				) : (
					/* État de fallback - ÉCRAN GRIS */
					<div className="loading-container">
						<Card>
							<div className="loading-content">
								<IonSpinner name="crescent" />
								<IonText className="loading-text">🚨 ÉCRAN GRIS - Debug</IonText>
								<IonText className="loading-sub-text">
									isPaired: {isPaired.toString()}<br/>
									isConnected: {isConnected.toString()}<br/>
									dataInitialized: {dataInitialized.toString()}<br/>
									showLoadingScreen: {showLoadingScreen.toString()}<br/>
									showDiscoveryScreen: {showDiscoveryScreen.toString()}<br/>
									Temp eau: {temperature.water}°C<br/>
									Mode pompe: {pumpMode}
								</IonText>
								<IonButton 
									onClick={() => {
										console.log("🔄 Force refresh des données");
										forceDataRefresh();
									}}
									fill="outline"
									size="small"
								>
									Forcer le rafraîchissement
								</IonButton>
							</div>
						</Card>
					</div>
				)}
			</IonContent>
			
			{/* Alerte de confirmation pour désappairage */}
			<IonAlert
				isOpen={showUnpairAlert}
				onDidDismiss={() => setShowUnpairAlert(false)}
				header="Désappairer la piscine"
				message="Êtes-vous sûr de vouloir désappairer cette piscine ? Vous devrez la rechercher à nouveau pour vous y reconnecter."
				buttons={[
					{
						text: 'Annuler',
						role: 'cancel',
						handler: () => setShowUnpairAlert(false)
					},
					{
						text: 'Désappairer',
						role: 'destructive',
						handler: handleDisconnectFromPool
					}
				]}
			/>
		</IonPage>
	);
}


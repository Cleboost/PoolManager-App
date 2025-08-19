import React from "react";
import { IonText, IonIcon, IonButton, IonItem, IonLabel, IonSpinner } from '@ionic/react';
import { searchOutline, waterOutline, wifiOutline, flashOutline } from 'ionicons/icons';
import { Card } from "../../components/Card";
import { DiscoveredPool } from "../../hooks/useGlobalWebSocket";

interface PoolDiscoveryCardProps {
	pools: DiscoveredPool[];
	isDiscovering: boolean;
	onConnectPress: (poolIp: string) => void;
	onStartDiscovery: () => void;
	onStopDiscovery: () => void;
	onTestSpecificIp?: (ip: string) => Promise<boolean>;
}

export const PoolDiscoveryCard = ({ pools, isDiscovering, onConnectPress, onStartDiscovery, onStopDiscovery, onTestSpecificIp }: PoolDiscoveryCardProps) => {
	// Rendu d'une piscine découverte
	const renderPool = (pool: DiscoveredPool) => {
		// Générer les icônes de signal
		const signalIcons = [];
		for (let i = 1; i <= 5; i++) {
			signalIcons.push(
				<IonIcon 
					key={i} 
					icon={wifiOutline} 
					color={i <= pool.signalStrength ? "primary" : "medium"} 
				/>
			);
		}

		return (
			<IonItem key={pool.id} button onClick={() => onConnectPress(pool.ip)} className="pool-item">
				<IonIcon icon={waterOutline} slot="start" color="primary" />
				<IonLabel>
					<IonText className="pool-name">{pool.name}</IonText>
					<IonText className="pool-ip">{pool.ip}</IonText>
				</IonLabel>
				<div className="pool-signal" slot="end">
					{signalIcons}
				</div>
			</IonItem>
		);
	};

	return (
		<Card>
			<div className="pool-discovery-header">
				<div className="pool-discovery-header-left">
					<IonIcon icon={searchOutline} color="primary" />
					<IonText className="pool-discovery-title">Recherche de piscine</IonText>
				</div>
				<IonButton 
					fill="outline" 
					size="small"
					onClick={isDiscovering ? onStopDiscovery : onStartDiscovery}
				>
					{isDiscovering ? "Arrêter" : "Scanner"}
				</IonButton>
			</div>

			{isDiscovering && (
				<div className="pool-discovery-searching">
					<IonSpinner />
					<IonText className="pool-discovery-searching-text">Recherche en cours...</IonText>
					<IonButton 
						fill="clear" 
						size="small"
						onClick={onStopDiscovery}
						style={{ marginTop: '8px' }}
					>
						Arrêter le scan
					</IonButton>
				</div>
			)}

			{onTestSpecificIp && (
				<div className="pool-discovery-test-section">
					<IonButton 
						fill="outline" 
						size="small"
						onClick={async () => {
							console.log("🔍 Test direct de 192.168.1.111...");
							
							// Test de connectivité réseau d'abord
							try {
								console.log("🌐 Test de connectivité réseau...");
								const start = Date.now();
								const response = await fetch('http://192.168.1.111:81', { 
									method: 'GET',
									mode: 'no-cors',
									signal: AbortSignal.timeout(3000)
								});
								const end = Date.now();
								console.log("✅ Connectivité réseau OK (", end - start, "ms)");
							} catch (error) {
								console.log("⚠️ Connectivité réseau limitée:", error);
							}
							
							const found = await onTestSpecificIp("192.168.1.111");
							if (found) {
								console.log("✅ Piscine trouvée à 192.168.1.111 !");
							} else {
								console.log("❌ Piscine non trouvée à 192.168.1.111");
							}
						}}
					>
						<IonIcon icon={flashOutline} slot="start" />
						Test direct 192.168.1.111
					</IonButton>
					
					<IonButton 
						fill="outline" 
						size="small"
						onClick={async () => {
							console.log("🌐 Test de connectivité réseau complet...");
							console.log("📱 Informations appareil:");
							console.log("  - URL:", window.location.href);
							console.log("  - User Agent:", navigator.userAgent);
							console.log("  - Platform:", navigator.platform);
							console.log("  - Connection:", (navigator as any).connection?.effectiveType || 'unknown');
							
							// Test 1: Internet
							try {
								const start = Date.now();
								const response = await fetch('https://httpbin.org/get', { 
									method: 'GET',
									mode: 'no-cors'
								});
								const end = Date.now();
								console.log("✅ Internet OK (", end - start, "ms)");
							} catch (error) {
								console.log("❌ Internet KO:", error);
							}
							
							// Test 2: Réseau local
							try {
								console.log("🏠 Test réseau local 192.168.1.1 (gateway)...");
								const response = await fetch('http://192.168.1.1', { 
									method: 'GET',
									mode: 'no-cors',
									signal: AbortSignal.timeout(3000)
								});
								console.log("✅ Gateway accessible");
							} catch (error) {
								console.log("❌ Gateway inaccessible:", error);
							}
							
							// Test 3: Piscine
							try {
								console.log("🏊 Test piscine 192.168.1.111:81...");
								const response = await fetch('http://192.168.1.111:81', { 
									method: 'GET',
									mode: 'no-cors',
									signal: AbortSignal.timeout(3000)
								});
								console.log("✅ Piscine accessible via HTTP");
							} catch (error) {
								console.log("❌ Piscine inaccessible via HTTP:", error);
							}
							
							// Test 4: Autres adresses courantes
							const commonIps = ['192.168.0.1', '192.168.1.254', '10.0.0.1'];
							for (const ip of commonIps) {
								try {
									console.log(`🔍 Test ${ip}...`);
									const response = await fetch(`http://${ip}`, { 
										method: 'GET',
										mode: 'no-cors',
										signal: AbortSignal.timeout(2000)
									});
									console.log(`✅ ${ip} accessible`);
								} catch (error) {
									console.log(`❌ ${ip} inaccessible`);
								}
							}
						}}
					>
						<IonIcon icon={wifiOutline} slot="start" />
						Test réseau complet
					</IonButton>
					
					{!isDiscovering && (
						<IonButton 
							fill="outline" 
							size="small"
							onClick={onStartDiscovery}
						>
							<IonIcon icon={searchOutline} slot="start" />
							Démarrer le scan
						</IonButton>
					)}
				</div>
			)}

			{pools.length > 0 ? (
				<div className="pool-discovery-list">
					{pools.map(renderPool)}
				</div>
			) : (
				<div className="pool-discovery-empty">
					<IonText className="pool-discovery-empty-text">
						{isDiscovering 
							? "En attente de piscines..." 
							: "Aucune piscine trouvée. Appuyez sur Scanner pour rechercher."
						}
					</IonText>
				</div>
			)}
		</Card>
	);
};

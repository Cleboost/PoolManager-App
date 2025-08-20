import React from "react";
import { IonIcon, IonText, IonItem } from "@ionic/react";
import { warningOutline, timeOutline, thermometerOutline, batteryDeadOutline, wifiOutline } from "ionicons/icons";
import { Card } from "../Card";

interface ErrorData {
	clockError: boolean;
	waterSensorError: boolean;
	airSensorError: boolean;
	waterTransmissionError: boolean;
	airTransmissionError: boolean;
	waterBatteryLow: boolean;
	airBatteryLow: boolean;
}

interface ErrorsCardProps {
	errors: ErrorData;
}

export const ErrorsCard: React.FC<ErrorsCardProps> = ({ errors }) => {
	// Vérifier s'il y a des erreurs
	const hasErrors = Object.values(errors).some(error => error);

	if (!hasErrors) {
		return null; // Ne pas afficher la carte s'il n'y a pas d'erreurs
	}

	const errorItems = [
		{
			key: "clockError",
			label: "Erreur Horloge Atomique",
			icon: timeOutline,
			active: errors.clockError
		},
		{
			key: "waterSensorError",
			label: "Erreur Capteur Eau",
			icon: thermometerOutline,
			active: errors.waterSensorError
		},
		{
			key: "airSensorError",
			label: "Erreur Capteur Air",
			icon: thermometerOutline,
			active: errors.airSensorError
		},
		{
			key: "waterTransmissionError",
			label: "Erreur Transmission Capteur Eau",
			icon: wifiOutline,
			active: errors.waterTransmissionError
		},
		{
			key: "airTransmissionError",
			label: "Erreur Transmission Capteur Air",
			icon: wifiOutline,
			active: errors.airTransmissionError
		},
		{
			key: "waterBatteryLow",
			label: "Batterie Basse Capteur Eau",
			icon: batteryDeadOutline,
			active: errors.waterBatteryLow
		},
		{
			key: "airBatteryLow",
			label: "Batterie Basse Capteur Air",
			icon: batteryDeadOutline,
			active: errors.airBatteryLow
		}
	].filter(item => item.active);

	return (
		<Card className="errors-card">
			<div className="errors-header" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
				<IonIcon icon={warningOutline} color="danger" />
				<IonText className="errors-title" style={{ color: 'var(--ion-color-danger)', fontWeight: 'bold' }}>
					Erreurs Détectées
				</IonText>
			</div>

			<div className="errors-list">
				{errorItems.map((item) => (
					<IonItem key={item.key} className="error-item" style={{ 
						'--background': 'var(--ion-color-danger-tint)',
						'--color': 'var(--ion-color-danger-contrast)',
						borderRadius: '8px',
						marginBottom: '8px'
					} as any}>
						<IonIcon icon={item.icon} slot="start" color="danger" />
						<IonText className="error-label" style={{ color: 'var(--ion-color-danger-contrast)' }}>
							{item.label}
						</IonText>
					</IonItem>
				))}
			</div>
		</Card>
	);
};

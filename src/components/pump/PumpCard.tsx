import React from "react";
import { IonText, IonIcon, IonItem } from '@ionic/react';
import { snowOutline, sunnyOutline } from 'ionicons/icons';
import { Card } from "../../components/Card";
import { PumpHeader } from "./PumpHeader";
import { PumpControls } from "./PumpControls";
import { PumpMode } from '../../hooks/useGlobalWebSocket';

interface PumpCardProps {
	mode: PumpMode;
	onModeChange: (mode: PumpMode) => void;
	onAutoModeChange: (isAuto: boolean) => void;
	disabled?: boolean;
	waterTemp?: number;
}

export const PumpCard = ({ mode, onModeChange, onAutoModeChange, disabled, waterTemp = 18 }: PumpCardProps) => {
	const isWinterMode = waterTemp <= 12;

	return (
		<Card>
			<PumpHeader mode={mode} />
			{mode === "auto" && (
				<IonItem className="pump-auto-mode-indicator" color={isWinterMode ? "primary" : "warning"}>
					<IonIcon icon={isWinterMode ? snowOutline : sunnyOutline} slot="start" />
					<IonText>
						{isWinterMode 
							? "Mode antigel activé : la pompe protège votre installation !"
							: "Mode été : Bonne baignade !"
						}
					</IonText>
				</IonItem>
			)}
			<div className="pump-content">
				<PumpControls 
					mode={mode} 
					onModeChange={onModeChange} 
					onAutoModeChange={onAutoModeChange} 
					disabled={disabled} 
				/>
			</div>
		</Card>
	);
};

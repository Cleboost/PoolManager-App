import React from "react";
import { IonText, IonIcon } from '@ionic/react';
import { waterOutline, sunnyOutline } from 'ionicons/icons';
import { AnimatedNumber } from "../../components/AnimatedNumber";

interface TemperatureBoxProps {
	type: "water" | "air";
	value: number;
}

export const TemperatureBox = ({ type, value }: TemperatureBoxProps) => {
	const config = {
		water: {
			icon: waterOutline,
			color: "#2196F3",
			bgColor: "#E3F2FD",
			label: "Eau"
		},
		air: {
			icon: sunnyOutline,
			color: "#F44336",
			bgColor: "#FBE9E7",
			label: "Air"
		},
	};

	const { icon, color, bgColor, label } = config[type];

	return (
		<div className="temperature-box" style={{ borderLeftColor: color }}>
			<div className="temperature-content">
				<div className="temperature-header">
					<div className="temperature-icon" style={{ backgroundColor: bgColor }}>
						<IonIcon icon={icon} style={{ color }} />
					</div>
					<IonText className="temperature-label">{label}</IonText>
				</div>
				<div className="temperature-value">
					<AnimatedNumber value={value} className="temperature-number" />
				</div>
			</div>
			<div className="temperature-indicator" style={{ backgroundColor: color }} />
		</div>
	);
};

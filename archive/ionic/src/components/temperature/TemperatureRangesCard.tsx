import React, { useState, useEffect } from "react";
import { IonText, IonIcon, IonButton } from '@ionic/react';
import { timeOutline, addOutline, removeOutline } from 'ionicons/icons';
import { Card } from "../../components/Card";
import { TemperatureRange } from "../../types/temperatureRanges";

export const TemperatureRangesCard = () => {
	const initialRanges: TemperatureRange[] = [
		{ id: "0", minTemp: 13, maxTemp: 17, duration: 7, origine: 7 },
		{ id: "1", minTemp: 18, maxTemp: 20, duration: 9, origine: 9 },
		{ id: "2", minTemp: 21, maxTemp: 24, duration: 6, origine: 6 },
		{ id: "3", minTemp: 25, maxTemp: 28, duration: 2, origine: 2 },
		{ id: "4", minTemp: 29, maxTemp: 32, duration: 0, origine: 0 },
	];

	const [ranges, setRanges] = useState<TemperatureRange[]>(initialRanges);

	const handleDurationChange = (id: string, currentDuration: number, increment: number) => {
		const newDuration = currentDuration + increment;
		const range = ranges.find((r) => r.id === id);

		if (range) {
			const diff = Math.abs(newDuration - range.origine);
			if (diff <= 2 && newDuration >= 0 && newDuration <= 24) {
				setRanges((prevRanges) => prevRanges.map((range) => (range.id === id ? { ...range, duration: newDuration } : range)));
			}
		}
	};

	const renderRange = (range: TemperatureRange) => {
		return (
			<div key={range.id} className="temperature-range-item">
				<div className="temperature-range-info">
					<div className="temperature-range-icon">
						<IonIcon icon={timeOutline} />
					</div>
					<IonText className="temperature-range-text">
						{range.minTemp}°C - {range.maxTemp}°C
					</IonText>
				</div>
				<div className="temperature-range-controls">
					<IonButton 
						fill="clear" 
						size="small"
						onClick={() => handleDurationChange(range.id, range.duration, -1)}
					>
						<IonIcon icon={removeOutline} />
					</IonButton>
					<div className="temperature-duration">
						<IonText>{range.duration}h</IonText>
					</div>
					<IonButton 
						fill="clear" 
						size="small"
						onClick={() => handleDurationChange(range.id, range.duration, 1)}
					>
						<IonIcon icon={addOutline} />
					</IonButton>
				</div>
			</div>
		);
	};

	return (
		<Card className="temperature-ranges-card">
			<div className="temperature-ranges-header">
				<div className="temperature-ranges-header-left">
					<div className="temperature-ranges-icon">
						<IonIcon icon={timeOutline} />
					</div>
					<div className="temperature-ranges-title-container">
						<IonText className="temperature-ranges-title">Plages de fonctionnement</IonText>
						<IonText className="temperature-ranges-subtitle">
							Ces plages horaires ne sont utilisées qu'en mode automatique
						</IonText>
					</div>
				</div>
			</div>
			<div className="temperature-ranges-container">
				{ranges.map(renderRange)}
			</div>
		</Card>
	);
};

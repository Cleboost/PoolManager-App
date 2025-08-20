import React, { useState, useEffect } from "react";
import { IonText } from '@ionic/react';

interface AnimatedNumberProps {
	value: number;
	className?: string;
}

export const AnimatedNumber = ({ value, className }: AnimatedNumberProps) => {
	const [previousValue, setPreviousValue] = useState(value);
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		if (previousValue !== value) {
			setIsAnimating(true);
			setPreviousValue(value);
			
			// Arrêter l'animation après un délai
			const timer = setTimeout(() => {
				setIsAnimating(false);
			}, 300);
			
			return () => clearTimeout(timer);
		}
	}, [value]);

	return (
		<div className={`animated-number ${className || ''}`}>
			<IonText className={`number ${isAnimating ? 'animate' : ''}`}>
				{value}°C
			</IonText>
		</div>
	);
};

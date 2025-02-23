import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card } from "@/components/Card";
import { Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { withSpring, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { TemperatureRange } from "@/types/temperatureRanges";

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
		const widthValue = useSharedValue(48);

		useEffect(() => {
			// Ajuster la largeur en fonction du nombre de chiffres
			const digits = range.duration.toString().length;
			widthValue.value = withSpring(Math.max(48, digits * 20 + 28));
		}, [range.duration]);

		const animatedStyles = useAnimatedStyle(() => ({
			width: widthValue.value,
		}));

		return (
			<View key={range.id} style={styles.rangeItem}>
				<View style={styles.tempRange}>
					<View style={styles.tempIconContainer}>
						<MaterialCommunityIcons name="thermometer" size={16} color="#2196F3" />
					</View>
					<Text style={styles.rangeText}>
						{range.minTemp}°C - {range.maxTemp}°C
					</Text>
				</View>
				<View style={styles.controls}>
					<TouchableOpacity 
						style={[styles.button, styles.buttonMinus]} 
						onPress={() => handleDurationChange(range.id, range.duration, -1)}
					>
						<MaterialCommunityIcons name="minus" size={16} color="white" />
					</TouchableOpacity>
					<Animated.View style={[styles.durationContainer, animatedStyles]}>
							<Text numberOfLines={1} style={styles.durationText}>{range.duration}h</Text>
					</Animated.View>
					<TouchableOpacity 
						style={[styles.button, styles.buttonPlus]}
						onPress={() => handleDurationChange(range.id, range.duration, 1)}
					>
						<MaterialCommunityIcons name="plus" size={16} color="white" />
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	return (
		<Card style={styles.card}>
			<View style={styles.header}>
				<View style={styles.headerLeft}>
					<View style={styles.iconContainer}>
						<MaterialCommunityIcons name="clock-time-four-outline" size={24} color="#2196F3" />
					</View>
						<View style={styles.titleContainer}>
						<Text style={styles.title}>Plages de fonctionnement</Text>
						<Text style={styles.subtitle}>Ces plages horaires ne sont utilisées qu'en mode automatique</Text>
					</View>
				</View>
			</View>
			<View style={styles.rangesContainer}>
				{ranges.map(renderRange)}
			</View>
		</Card>
	);
};

const styles = StyleSheet.create({
	card: {
		padding: 16,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 20,
	},
	headerLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	iconContainer: {
		backgroundColor: "#E3F2FD",
		padding: 10,
		borderRadius: 12,
	},
	titleContainer: {
		flex: 1,  // Permet au conteneur de prendre tout l'espace disponible
	},
	title: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1F2937",
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 13,
		color: "#64748B",
		flexWrap: 'wrap',  // Permet le retour à la ligne du texte
		lineHeight: 18,
	},
	rangesContainer: {
		gap: 12,
	},
	rangeItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 12,
		backgroundColor: "#F8FAFC",
		borderRadius: 12,
		marginBottom: 8,
	},
	tempRange: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	tempIconContainer: {
		backgroundColor: "#E3F2FD",
		padding: 6,
		borderRadius: 8,
	},
	rangeText: {
		fontSize: 15,
		fontWeight: "500",
		color: "#1F2937",
	},
	controls: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	button: {
		width: 32,
		height: 32,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
		elevation: 2,
	},
	buttonMinus: {
		backgroundColor: "#EF4444",
	},
	buttonPlus: {
		backgroundColor: "#10B981",
	},
	durationContainer: {
		backgroundColor: "#E3F2FD",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 8,
		overflow: 'hidden',  // Ajouté pour éviter les débordements pendant l'animation
		height: 32, // Hauteur fixe
		justifyContent: 'center', // Centre le texte verticalement
	},
	durationText: {
		fontSize: 15,
		fontWeight: "600",
		color: "#2196F3",
		textAlign: "center",
		flexShrink: 1, // Permet au texte de se réduire si nécessaire
	},
});

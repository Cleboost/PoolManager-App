import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedNumber } from "@/components/AnimatedNumber";

interface TemperatureBoxProps {
	type: "water" | "air";
	value: number;
}

export const TemperatureBox = ({ type, value }: TemperatureBoxProps) => {
	const config = {
		water: {
			icon: "water-outline" as const,
			color: "#2196F3",
			bgColor: "#E3F2FD",
		},
		air: {
			icon: "sunny" as const,
			color: "#F44336",
			bgColor: "#FBE9E7",
		},
	};

	const { icon, color, bgColor } = config[type];

	return (
		<View style={[styles.box, { borderLeftColor: color }]}>
			<View style={styles.content}>
				<View style={styles.header}>
					<View style={[styles.icon, { backgroundColor: bgColor }]}>
						<Ionicons name={icon} size={18} color={color} />
					</View>
					<Text style={styles.label}>{type === "water" ? "Eau" : "Air"}</Text>
				</View>
				<View style={styles.valueContainer}>
					<AnimatedNumber value={value} style={styles.value} />
					<Text style={styles.unit}></Text>
				</View>
			</View>
			<View style={[styles.indicator, { backgroundColor: color }]} />
		</View>
	);
};

const styles = StyleSheet.create({
	box: {
		flex: 1,
		backgroundColor: "#ffffff",
		borderRadius: 12,
		padding: 10,
		position: "relative",
		overflow: "hidden",
		borderLeftWidth: 4,
	},
	content: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginBottom: 6,
	},
	icon: {
		padding: 5,
		borderRadius: 8,
	},
	label: {
		fontSize: 13,
		color: "#666",
		fontWeight: "500",
	},
	valueContainer: {
		flexDirection: "row",
		alignItems: "flex-end",
		gap: 1,
		marginLeft: 2,
	},
	value: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#333",
		lineHeight: 28,
	},
	unit: {
		fontSize: 12,
		color: "#666",
		marginBottom: 3,
	},
	indicator: {
		position: "absolute",
		left: 0,
		top: 0,
		bottom: 0,
		width: 3,
		borderTopLeftRadius: 12,
		borderBottomLeftRadius: 12,
	},
});

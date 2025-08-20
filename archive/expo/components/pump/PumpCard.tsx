import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Card } from "@/components/Card";
import { PumpHeader } from "@/components/pump/PumpHeader";
import { PumpControls } from "@/components/pump/PumpControls";
import { Ionicons } from "@expo/vector-icons";

interface PumpCardProps {
	mode: "auto" | "on" | "off";
	onModeChange: (mode: "auto" | "on" | "off") => void;
	onAutoModeChange: (isAuto: boolean) => void;
	disabled?: boolean;
	waterTemp?: number; // Nouvelle prop pour la température de l'eau
}

export const PumpCard = ({ mode, onModeChange, onAutoModeChange, disabled, waterTemp = 18 }: PumpCardProps) => {
	const isWinterMode = waterTemp <= 12;

	return (
		<Card>
			<PumpHeader mode={mode} />
			{mode === "auto" && (
				<View style={[styles.autoModeIndicator, { backgroundColor: isWinterMode ? "#E3F2FD" : "#FFF8E1" }]}>
					{isWinterMode ? (
						<>
							<Ionicons name="snow" size={22} color="#2196F3" />
							<Text style={[styles.autoModeText, { color: "#2196F3" }]}>Mode antigel activé : la pompe protège votre installation !</Text>
						</>
					) : (
						<>
							<Ionicons name="sunny" size={22} color="#FBC02D" />
							<Text style={[styles.autoModeText, { color: "#FBC02D" }]}>Mode été : Bonne baignade !</Text>
						</>
					)}
				</View>
			)}
			<View style={styles.content}>
				<PumpControls mode={mode} onModeChange={onModeChange} onAutoModeChange={onAutoModeChange} disabled={disabled} />
			</View>
		</Card>
	);
};

const styles = StyleSheet.create({
	content: {
		gap: 24,
	},
	autoModeIndicator: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 8,
		marginBottom: 16,
	},
	autoModeText: {
		flex: 1,
		fontSize: 14,
		fontWeight: "500",
	},
});

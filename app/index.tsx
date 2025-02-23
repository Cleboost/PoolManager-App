import React, { useState } from "react";
import { StyleSheet, SafeAreaView, Platform, StatusBar, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card } from "@/components/Card";
import { EditableTitle } from "@/components/header/EditableTitle";
import { AnimatedTime } from "@/components/AnimatedTime";
import { TemperatureCard } from "@/components/temperature/TemperatureCard";
import { PumpCard } from "@/components/pump/PumpCard";
import { TemperatureRangesCard } from "@/components/temperature/TemperatureRangesCard";
import { useTemperature } from "@/hooks/useTemperature";
import { TemperatureRanges } from "@/types/temperatureRanges";

type PumpMode = "auto" | "on" | "off";
type TemperatureRange = {
	id: string;
	minTemp: number;
	maxTemp: number;
	duration: number;
};

export default function App() {
	const [poolName, setPoolName] = useState("Ma Piscine");
	const [pumpMode, setPumpMode] = useState<PumpMode>("auto");
	const [previousPumpMode, setPreviousPumpMode] = useState<"on" | "off">("off");
	const temperature = useTemperature();

	const handleAutoModeChange = (isAuto: boolean) => {
		if (isAuto) {
			setPreviousPumpMode(pumpMode === "auto" ? "off" : pumpMode);
			setPumpMode("auto");
		} else {
			setPumpMode(previousPumpMode);
		}
	};

	const handlePumpModeChange = (newMode: "auto" | "on" | "off") => {
		setPumpMode(newMode);
		if (newMode !== "auto") {
			setPreviousPumpMode(newMode);
		}
	};

	const handleSaveNewName = async (newName: string) => {
		try {
			await AsyncStorage.setItem("poolName", newName);
			setPoolName(newName);
		} catch (error) {
			console.error("Erreur lors de la sauvegarde du nom:", error);
		}
	};

	React.useEffect(() => {
		const loadPoolName = async () => {
			try {
				const savedName = await AsyncStorage.getItem("poolName");
				if (savedName) setPoolName(savedName);
			} catch (error) {
				console.error("Erreur lors du chargement du nom:", error);
			}
		};
		loadPoolName();
	}, []);

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView>
				{/* En-tête */}
				<Card>
					<EditableTitle value={poolName} onSave={handleSaveNewName} />
					<AnimatedTime />
				</Card>

				{/* Températures */}
				<TemperatureCard waterTemp={temperature.water} airTemp={temperature.air} trend={temperature.trend} />

				{/* Pompe */}
				<PumpCard mode={pumpMode} onModeChange={handlePumpModeChange} onAutoModeChange={handleAutoModeChange} />

				{/* Plages de température */}
				<TemperatureRangesCard />
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
		paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
		padding: 16,
	},
});

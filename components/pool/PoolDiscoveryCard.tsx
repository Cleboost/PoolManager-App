import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/Card";
import { DiscoveredPool } from "@/hooks/useGlobalWebSocket";

interface PoolDiscoveryCardProps {
	pools: DiscoveredPool[];
	isDiscovering: boolean;
	onConnectPress: (poolIp: string) => void;
	onStartDiscovery: () => void;
	onStopDiscovery: () => void;
}

export const PoolDiscoveryCard = ({ pools, isDiscovering, onConnectPress, onStartDiscovery, onStopDiscovery }: PoolDiscoveryCardProps) => {
	// Rendu d'une piscine découverte
	const renderPool = (pool: DiscoveredPool) => {
		// Générer les icônes de signal
		const signalIcons = [];
		for (let i = 1; i <= 5; i++) {
			signalIcons.push(<Ionicons key={i} name="wifi" size={12} color={i <= pool.signalStrength ? "#2196F3" : "#E0E0E0"} />);
		}

		return (
			<TouchableOpacity key={pool.id} style={styles.poolItem} onPress={() => onConnectPress(pool.ip)}>
				<View style={styles.poolItemLeft}>
					<Ionicons name="water-outline" size={24} color="#2196F3" />
					<View>
						<Text style={styles.poolName}>{pool.name}</Text>
						<Text style={styles.poolIp}>{pool.ip}</Text>
					</View>
				</View>
				<View style={styles.poolSignal}>{signalIcons}</View>
			</TouchableOpacity>
		);
	};

	return (
		<Card>
			<View style={styles.header}>
				<View style={styles.headerLeft}>
					<Ionicons name="search-outline" size={24} color="#2196F3" />
					<Text style={styles.title}>Recherche de piscine</Text>
				</View>
				{isDiscovering ? (
					<TouchableOpacity style={styles.searchButton} onPress={onStopDiscovery}>
						<Text style={styles.searchButtonText}>Arrêter</Text>
					</TouchableOpacity>
				) : (
					<TouchableOpacity style={styles.searchButton} onPress={onStartDiscovery}>
						<Text style={styles.searchButtonText}>Scanner</Text>
					</TouchableOpacity>
				)}
			</View>

			{isDiscovering && (
				<View style={styles.searchingIndicator}>
					<ActivityIndicator color="#2196F3" />
					<Text style={styles.searchingText}>Recherche en cours...</Text>
				</View>
			)}

			{pools.length > 0 ? (
				<View style={styles.poolsList}>{pools.map(renderPool)}</View>
			) : (
				<View style={styles.noPools}>
					<Text style={styles.noPoolsText}>{isDiscovering ? "En attente de piscines..." : "Aucune piscine trouvée. Appuyez sur Scanner pour rechercher."}</Text>
				</View>
			)}
		</Card>
	);
};

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	headerLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	title: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
	},
	searchButton: {
		backgroundColor: "#2196F3",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
	},
	searchButtonText: {
		color: "white",
		fontWeight: "600",
		fontSize: 14,
	},
	searchingIndicator: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginVertical: 16,
		justifyContent: "center",
	},
	searchingText: {
		fontSize: 16,
		color: "#2196F3",
		fontWeight: "500",
	},
	poolsList: {
		gap: 12,
	},
	poolItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		backgroundColor: "#F5F5F5",
	},
	poolItemLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	poolName: {
		fontSize: 16,
		fontWeight: "600",
	},
	poolIp: {
		fontSize: 14,
		color: "#666",
	},
	poolSignal: {
		flexDirection: "row",
		gap: 2,
	},
	noPools: {
		padding: 16,
		alignItems: "center",
	},
	noPoolsText: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
	},
});

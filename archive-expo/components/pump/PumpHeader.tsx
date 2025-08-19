import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { withSpring, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

interface PumpHeaderProps {
    mode: "auto" | "on" | "off";
}

export const PumpHeader = ({ mode }: PumpHeaderProps) => {
    const widthValue = useSharedValue(85);
    
    const getModeConfig = () =>
        ({
            on: { text: "En marche", icon: "flash" as const, color: "#4caf50", width: 120 },
            off: { text: "Arrêtée", icon: "power" as const, color: "#f44336", width: 100 },
            auto: { text: "Auto", icon: "timer-outline" as const, color: "#2196F3", width: 85 },
        }[mode]);

    const config = getModeConfig();

    useEffect(() => {
        widthValue.value = withSpring(config.width);
    }, [mode]);

    const animatedStyles = useAnimatedStyle(() => ({
        width: widthValue.value,
    }));

    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name="water-outline" size={24} color="#2196F3" />
                </View>
                <Text style={styles.title}>Pompe</Text>
            </View>
            <Animated.View style={[styles.status, { backgroundColor: config.color }, animatedStyles]}>
                <Ionicons name={config.icon} size={16} color="white" />
                <Text numberOfLines={1} style={styles.statusText}>{config.text}</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconContainer: {
        backgroundColor: "#E3F2FD",
        padding: 8,
        borderRadius: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
    },
    status: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'center',
        paddingHorizontal: 12,
        height: 32,
        borderRadius: 16,
        gap: 6,
        overflow: 'hidden',
    },
    statusText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
        flexShrink: 1,
    },
});

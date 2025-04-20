import React from "react";
import { StyleSheet, View, Text } from "react-native";
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withTiming, interpolate } from "react-native-reanimated";

interface AnimatedNumberProps {
	value: number;
	style?: any;
}

export const AnimatedNumber = ({ value, style }: AnimatedNumberProps) => {
	const [previousValue, setPreviousValue] = React.useState(value);
	const progress = useSharedValue(0);

	React.useEffect(() => {
		if (previousValue !== value) {
			progress.value = 0;
			setPreviousValue(value);
			progress.value = withSpring(1, {
				mass: 1,
				damping: 15,
				stiffness: 100,
			});
		}
	}, [value]);

	const oldNumberStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: interpolate(progress.value, [0, 1], [0, previousValue > value ? 30 : -30]),
				},
			],
			opacity: interpolate(progress.value, [0, 1], [1, 0]),
		};
	});

	const newNumberStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: interpolate(progress.value, [0, 1], [previousValue > value ? -30 : 30, 0]),
				},
			],
			opacity: progress.value,
		};
	});

	return (
		<View style={[styles.container, style, { flexDirection: "row", alignItems: "center", justifyContent: "center" }]}>
			<View style={{ position: "relative" }}>
				<Animated.Text style={[styles.number, oldNumberStyle]}>{previousValue}</Animated.Text>
				<Animated.Text style={[styles.number, styles.absolute, newNumberStyle]}>{value}</Animated.Text>
			</View>
			<Text style={{ fontSize: 18, color: "#666", marginLeft: 4, fontWeight: "bold" }}>°C</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		height: 36,
		overflow: "hidden",
	},
	number: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#333",
	},
	absolute: {
		position: "absolute",
		left: 0,
		right: 0,
	},
});

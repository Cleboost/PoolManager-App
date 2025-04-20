import { useState, useEffect } from "react";
import { useWebSocket } from "./useGlobalWebSocket";

// Interface pour les données de température
interface Temperature {
	water: number;
	air: number;
	trend: number;
}

// Exporter le hook comme fonction par défaut
export default function useTemperature(): Temperature {
	const { temperatures } = useWebSocket();

	return {
		water: temperatures.water,
		air: temperatures.air,
		trend: temperatures.trend,
	};
}

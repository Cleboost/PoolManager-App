export interface TemperatureRange {
	id: string;
	minTemp: number;
	maxTemp: number;
	duration: number;
	origine: number;
}

export type TemperatureRanges = TemperatureRange[];

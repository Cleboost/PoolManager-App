import { useState, useEffect } from 'react';

interface Temperature {
  water: number;
  air: number;
  trend: number;
}

export const useTemperature = (updateInterval = 5000) => {
  const [temperature, setTemperature] = useState<Temperature>({
    water: 26,
    air: 28,
    trend: 1.2,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTemperature(prev => ({
        water: parseFloat((Math.random() * 10 + 20).toFixed(1)),
        air: parseFloat((Math.random() * 20 + 10).toFixed(1)),
        trend: parseFloat((prev.trend + (Math.random() * 0.4 - 0.2)).toFixed(1)),
      }));
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return temperature;
};

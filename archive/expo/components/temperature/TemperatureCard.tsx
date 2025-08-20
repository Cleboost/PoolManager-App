import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/Card";
import { TemperatureBox } from "./TemperatureBox";

interface TemperatureCardProps {
  waterTemp: number;
  airTemp: number;
  trend: number;
}

export const TemperatureCard = ({ waterTemp, airTemp, trend }: TemperatureCardProps) => {
  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="thermometer-outline" size={24} color="#2196F3" />
          </View>
          <Text style={styles.title}>Températures</Text>
        </View>
        <View style={styles.headerRight}>
          <Ionicons name="trending-up" size={20} color="#4CAF50" />
          <Text style={styles.trend}>+{trend}°C</Text>
        </View>
      </View>
      <View style={styles.grid}>
        <TemperatureBox type="water" value={waterTemp} />
        <TemperatureBox type="air" value={airTemp} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 0,
  },
  trend: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
});

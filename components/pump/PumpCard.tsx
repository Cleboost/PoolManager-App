import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from "@/components/Card";
import { PumpHeader } from "@/components/pump/PumpHeader";
import { PumpControls } from "@/components/pump/PumpControls";

interface PumpCardProps {
  mode: "auto" | "on" | "off";
  onModeChange: (mode: "auto" | "on" | "off") => void;
  onAutoModeChange: (isAuto: boolean) => void;
  disabled?: boolean;
}

export const PumpCard = ({ mode, onModeChange, onAutoModeChange, disabled }: PumpCardProps) => {
  return (
    <Card>
      <PumpHeader mode={mode} />
      <View style={styles.content}>
        <PumpControls 
          mode={mode}
          onModeChange={onModeChange}
          onAutoModeChange={onAutoModeChange}
          disabled={disabled}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 24,
  },
});

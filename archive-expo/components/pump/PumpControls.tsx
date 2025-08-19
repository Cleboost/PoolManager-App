import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { CustomSwitch } from "@/components/CustomSwitch";

interface PumpControlsProps {
  mode: "auto" | "on" | "off";
  onModeChange: (mode: "on" | "off") => void;
  onAutoModeChange: (isAuto: boolean) => void;
  disabled?: boolean;
}

export const PumpControls = ({ mode, onModeChange, onAutoModeChange, disabled }: PumpControlsProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.autoMode}>
        <View style={styles.autoModeInfo}>
          <Text style={styles.autoModeText}>Mode Automatique</Text>
          <Text style={styles.autoModeSubtext}>
            La pompe suivra la plage horaire définie
          </Text>
        </View>
        <CustomSwitch 
          value={mode === "auto"}
          onValueChange={onAutoModeChange}
          size="medium"
        />
      </View>
      
      <View style={styles.buttonsContainer}>
        <PumpButton
          icon="flash"
          label="Marche"
          active={mode === "on"}
          disabled={mode === "auto"}
          onPress={() => onModeChange("on")}
        />
        <PumpButton
          icon="power"
          label="Arrêt"
          active={mode === "off"}
          disabled={mode === "auto"}
          onPress={() => onModeChange("off")}
        />
      </View>
    </View>
  );
};

interface PumpButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  disabled: boolean;
  onPress: () => void;
}

const PumpButton = ({ icon, label, active, disabled, onPress }: PumpButtonProps) => (
  <Pressable 
    style={[
      styles.button,
      active && styles.buttonActive,
      disabled && styles.buttonDisabled
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Ionicons 
      name={icon} 
      size={24} 
      color={active ? "white" : "#666"} 
    />
    <Text style={[
      styles.buttonText,
      active && styles.buttonTextActive
    ]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  autoMode: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
  },
  autoModeInfo: {
    flex: 1,
    marginRight: 16,
  },
  autoModeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  autoModeSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    gap: 8,
  },
  buttonActive: {
    backgroundColor: '#2196F3',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  buttonTextActive: {
    color: 'white',
  },
});

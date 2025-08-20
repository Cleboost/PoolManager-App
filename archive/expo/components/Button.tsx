import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'default' | 'outline';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ onPress, title, variant = 'outline', disabled }) => (
  <TouchableOpacity 
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.button,
      variant === 'default' ? styles.buttonFilled : styles.buttonOutline,
      disabled && styles.buttonDisabled
    ]}
  >
    <Text style={[
      styles.buttonText,
      variant === 'default' ? styles.buttonTextFilled : styles.buttonTextOutline,
      disabled && styles.buttonTextDisabled
    ]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonFilled: {
    backgroundColor: '#2196F3',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextFilled: {
    color: 'white',
  },
  buttonTextOutline: {
    color: '#2196F3',
  },
  buttonTextDisabled: {
    color: '#666',
  },
});
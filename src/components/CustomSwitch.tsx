import React from 'react';
import { IonToggle } from '@ionic/react';

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export const CustomSwitch = ({ 
  value, 
  onValueChange, 
  size = 'medium',
  disabled = false 
}: CustomSwitchProps) => (
  <IonToggle
    checked={value}
    onIonChange={(e) => onValueChange(e.detail.checked)}
    disabled={disabled}
    className={size === 'small' ? 'toggle-small' : size === 'large' ? 'toggle-large' : 'toggle-medium'}
  />
);

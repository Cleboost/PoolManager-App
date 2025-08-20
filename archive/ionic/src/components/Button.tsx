import React from 'react';
import { IonButton } from '@ionic/react';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'default' | 'outline';
  disabled?: boolean;
  expand?: 'block' | 'full';
  fill?: 'clear' | 'outline' | 'solid' | 'default';
}

export const Button: React.FC<ButtonProps> = ({ 
  onPress, 
  title, 
  variant = 'outline', 
  disabled,
  expand = 'block',
  fill = 'outline'
}) => (
  <IonButton 
    onClick={onPress}
    disabled={disabled}
    expand={expand}
    fill={fill}
    color={variant === 'default' ? 'primary' : 'primary'}
  >
    {title}
  </IonButton>
);

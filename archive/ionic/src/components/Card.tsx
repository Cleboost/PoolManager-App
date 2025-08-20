import React from 'react';
import { IonCard, IonCardContent } from '@ionic/react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => (
  <IonCard className={className}>
    <IonCardContent>
      {children}
    </IonCardContent>
  </IonCard>
);

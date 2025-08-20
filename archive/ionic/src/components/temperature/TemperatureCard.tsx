import React from 'react';
import { IonText, IonIcon } from '@ionic/react';
import { thermometerOutline, trendingUpOutline } from 'ionicons/icons';
import { Card } from "../../components/Card";
import { TemperatureBox } from "./TemperatureBox";

interface TemperatureCardProps {
  waterTemp: number;
  airTemp: number;
  trend: number;
}

export const TemperatureCard = ({ waterTemp, airTemp, trend }: TemperatureCardProps) => {
  return (
    <Card>
      <div className="temperature-card-header">
        <div className="temperature-card-header-left">
          <div className="temperature-card-icon">
            <IonIcon icon={thermometerOutline} />
          </div>
          <IonText className="temperature-card-title">Températures</IonText>
        </div>
        <div className="temperature-card-header-right">
          <IonIcon icon={trendingUpOutline} />
          <IonText className="temperature-trend">+{trend}°C</IonText>
        </div>
      </div>
      <div className="temperature-grid">
        <TemperatureBox type="water" value={waterTemp} />
        <TemperatureBox type="air" value={airTemp} />
      </div>
    </Card>
  );
};

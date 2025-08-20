import React from 'react';
import { IonText, IonButton, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { flashOutline, powerOutline } from 'ionicons/icons';
import { CustomSwitch } from "../../components/CustomSwitch";
import { PumpMode } from '../../hooks/useGlobalWebSocket';

interface PumpControlsProps {
  mode: PumpMode;
  onModeChange: (mode: "on" | "off") => void;
  onAutoModeChange: (isAuto: boolean) => void;
  disabled?: boolean;
}

export const PumpControls = ({ mode, onModeChange, onAutoModeChange, disabled }: PumpControlsProps) => {
  return (
    <div className="pump-controls">
      <IonItem className="pump-auto-mode">
        <IonLabel>
          <IonText className="pump-auto-mode-text">Mode Automatique</IonText>
          <IonText className="pump-auto-mode-subtext">
            La pompe suivra la plage horaire définie
          </IonText>
        </IonLabel>
        <CustomSwitch 
          value={mode === "auto"}
          onValueChange={onAutoModeChange}
          size="medium"
        />
      </IonItem>
      
      <div className="pump-buttons-container">
        <IonButton
          fill={mode === "on" ? "solid" : "outline"}
          disabled={mode === "auto"}
          onClick={() => onModeChange("on")}
          className="pump-button"
        >
          <IonIcon icon={flashOutline} slot="start" />
          <IonText>Marche</IonText>
        </IonButton>
        <IonButton
          fill={mode === "off" ? "solid" : "outline"}
          disabled={mode === "auto"}
          onClick={() => onModeChange("off")}
          className="pump-button"
        >
          <IonIcon icon={powerOutline} slot="start" />
          <IonText>Arrêt</IonText>
        </IonButton>
      </div>
    </div>
  );
};

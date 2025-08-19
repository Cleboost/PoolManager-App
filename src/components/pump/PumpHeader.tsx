import React from "react";
import { IonText, IonIcon, IonChip } from '@ionic/react';
import { waterOutline, flashOutline, powerOutline, timeOutline } from 'ionicons/icons';

interface PumpHeaderProps {
    mode: "auto" | "on" | "off";
}

export const PumpHeader = ({ mode }: PumpHeaderProps) => {
    const getModeConfig = () =>
        ({
            on: { text: "En marche", icon: flashOutline, color: "success" },
            off: { text: "Arrêtée", icon: powerOutline, color: "danger" },
            auto: { text: "Auto", icon: timeOutline, color: "primary" },
        }[mode]);

    const config = getModeConfig();

    return (
        <div className="pump-header">
            <div className="pump-header-left">
                <div className="pump-icon-container">
                    <IonIcon icon={waterOutline} />
                </div>
                <IonText className="pump-title">Pompe</IonText>
            </div>
            <IonChip color={config.color as any} className="pump-status">
                <IonIcon icon={config.icon} />
                <IonText>{config.text}</IonText>
            </IonChip>
        </div>
    );
};

import React, { useEffect, useMemo, useRef, useState } from "react";
import { IonButton, IonIcon, IonItem, IonLabel, IonText, IonSpinner } from "@ionic/react";
import { addOutline, removeOutline, timeOutline } from "ionicons/icons";
import { Card } from "../Card";

interface TimeSlotsCardProps {
    timeSlots: number[];
    onRefreshAll: () => void;
    onIncrement: (index: number) => void;
    onDecrement: (index: number) => void;
}

export const TimeSlotsCard: React.FC<TimeSlotsCardProps> = ({ timeSlots, onRefreshAll, onIncrement, onDecrement }) => {
    const SLOT_LABELS = [
        "13°C - 16°C",
        "17°C - 20°C",
        "21°C - 24°C",
        "25°C - 28°C",
        "29°C - 32°C",
        ">32°C",
    ];
    const [pending, setPending] = useState<boolean[]>([false, false, false, false, false, false]);
    const prevValuesRef = useRef<number[]>(timeSlots);

    useEffect(() => {
        // Récupérer toutes les plages au montage
        onRefreshAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Quand une valeur change, on libère le pending du slot correspondant
    useEffect(() => {
        const prev = prevValuesRef.current;
        const nextPending = [...pending];
        for (let i = 0; i < 6; i++) {
            if (timeSlots[i] !== prev[i]) {
                nextPending[i] = false;
            }
        }
        prevValuesRef.current = [...timeSlots];
        if (nextPending.some((v, idx) => v !== pending[idx])) {
            setPending(nextPending);
        }
    }, [timeSlots]);

    const handleInc = (i: number) => {
        if (pending[i]) return;
        const next = [...pending];
        next[i] = true;
        setPending(next);
        onIncrement(i);
        // Sécurité: clear pending si aucun retour serveur après 6s
        setTimeout(() => {
            setPending((cur) => {
                if (!cur[i]) return cur;
                const copy = [...cur];
                copy[i] = false;
                return copy;
            });
        }, 6000);
    };

    const handleDec = (i: number) => {
        if (pending[i]) return;
        const next = [...pending];
        next[i] = true;
        setPending(next);
        onDecrement(i);
        setTimeout(() => {
            setPending((cur) => {
                if (!cur[i]) return cur;
                const copy = [...cur];
                copy[i] = false;
                return copy;
            });
        }, 6000);
    };

    return (
        <Card>
            <div className="time-slots-header" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <IonIcon icon={timeOutline} color="primary" />
                <IonText className="time-slots-title">Plages horaires</IonText>
            </div>

            {Array.from({ length: 6 }).map((_, index) => (
                <IonItem key={index} className="time-slot-item">
                    <IonLabel>
                        <IonText className="time-slot-label">{SLOT_LABELS[index] || `Plage ${index}`}</IonText>
                    </IonLabel>
                    <div slot="end" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <IonButton size="small" color="medium" onClick={() => handleDec(index)} disabled={pending[index]}>
                            <IonIcon icon={removeOutline} />
                        </IonButton>
                        <div
                            className="time-slot-box"
                            style={{
                                minWidth: 64,
                                height: 36,
                                borderRadius: 8,
                                border: '1px solid var(--ion-color-medium)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0 8px'
                            }}
                        >
                            {pending[index] ? (
                                <IonSpinner name="dots" style={{ transform: 'scale(0.7)' }} />
                            ) : (
                                <IonText>{timeSlots[index] ?? 0} h</IonText>
                            )}
                        </div>
                        <IonButton size="small" onClick={() => handleInc(index)} disabled={pending[index]}>
                            <IonIcon icon={addOutline} />
                        </IonButton>
                    </div>
                </IonItem>
            ))}
        </Card>
    );
};



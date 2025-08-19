import React, { useState, useEffect } from 'react';
import { IonText } from '@ionic/react';

export const AnimatedTime = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="animated-time">
            <IonText className="time-text">
                {formatTime(time)}
            </IonText>
        </div>
    );
};

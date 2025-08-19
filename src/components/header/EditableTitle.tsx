import React, { useState } from 'react';
import { IonText, IonInput, IonIcon } from '@ionic/react';
import { pencil } from 'ionicons/icons';

interface EditableTitleProps {
  value: string;
  onSave: (newValue: string) => void;
}

export const EditableTitle = ({ value, onSave }: EditableTitleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleEndEditing = () => {
    if (tempValue.trim() && tempValue !== value) {
      onSave(tempValue);
    }
    setIsEditing(false);
  };

  return (
    <div className="editable-title">
      {isEditing ? (
        <IonInput
          value={tempValue}
          onIonInput={(e) => setTempValue(e.detail.value || '')}
          onIonBlur={handleEndEditing}
          onKeyPress={(e) => e.key === 'Enter' && handleEndEditing()}
          autoFocus
          className="title-input"
        />
      ) : (
        <div className="title-display">
          <IonText className="title-text">{value}</IonText>
          <IonIcon 
            icon={pencil} 
            onClick={() => {
              setTempValue(value);
              setIsEditing(true);
            }}
            className="edit-icon"
          />
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

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
    <View style={styles.container}>
      {isEditing ? (
        <TextInput
          style={styles.input}
          value={tempValue}
          onChangeText={setTempValue}
          onBlur={handleEndEditing}
          onSubmitEditing={handleEndEditing}
          autoFocus
          selectTextOnFocus
        />
      ) : (
        <>
          <Text style={styles.title}>{value}</Text>
          <Pressable 
            onPress={() => {
              setTempValue(value);
              setIsEditing(true);
            }}
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.editButtonPressed
            ]}
          >
            <View style={styles.editButtonInner}>
              <Ionicons name="pencil" size={16} color="#2196F3" />
            </View>
          </Pressable>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  input: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    flex: 1,
    padding: 0,
    margin: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#2196F3',
  },
  editButton: {
    marginTop: 4,
  },
  editButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  editButtonInner: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});

import React, { useEffect, useRef } from 'react';
import { Pressable, Animated, StyleSheet } from 'react-native';

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
}: CustomSwitchProps) => {
  const translateX = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7
    }).start();
  }, [value]);

  const sizes = {
    small: { width: 40, height: 24, circle: 18 },
    medium: { width: 52, height: 32, circle: 24 },
    large: { width: 64, height: 40, circle: 32 },
  };

  const currentSize = sizes[size];
  const circleOffset = currentSize.height * 0.1;

  const switchTranslate = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [circleOffset, currentSize.width - currentSize.circle - circleOffset]
  });

  const backgroundOpacity = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1]
  });

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      style={[
        styles.container,
        {
          width: currentSize.width,
          height: currentSize.height,
          opacity: disabled ? 0.5 : 1
        }
      ]}
    >
      <Animated.View
        style={[
          styles.background,
          {
            backgroundColor: '#2196F3',
            opacity: backgroundOpacity
          }
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          {
            width: currentSize.circle,
            height: currentSize.circle,
            transform: [{ translateX: switchTranslate }]
          }
        ]}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 999,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
  },
  circle: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 4,
  }
});

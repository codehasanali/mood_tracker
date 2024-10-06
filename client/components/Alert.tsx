import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

const Alert: React.FC<AlertProps> = ({ type, message }) => {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
  });
  const [visible, setVisible] = useState(true);
  const fadeAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim]);

  if (!fontsLoaded || !visible) {
    return null;
  }

  const getAlertStyle = () => {
    switch (type) {
      case 'success':
        return styles.success;
      case 'error':
        return styles.error;
      case 'warning':
        return styles.warning;
      case 'info':
        return styles.info;
      default:
        return styles.info;
    }
  };

  return (
    <Animated.View style={[styles.container, getAlertStyle(), { opacity: fadeAnim }]}>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 1000,
  },
  success: {
    backgroundColor: '#2D4A3E',
  },
  error: {
    backgroundColor: '#4A2D2D',
  },
  warning: {
    backgroundColor: '#4A3F2D',
  },
  info: {
    backgroundColor: '#2D3A4A',
  },
  message: {
    fontFamily: 'Roboto_400Regular',
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default Alert;
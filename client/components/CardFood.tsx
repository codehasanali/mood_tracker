import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';

import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { normalize } from '../utils/normalize';
import { Food } from '../types/Food';


interface CardFoodProps {
  food: Food;
  isSelected: boolean;
  onSelect: () => void;
  quantity: number;
  onQuantityChange: (quantity: string) => void;
}

const CardFood: React.FC<CardFoodProps> = ({ food, isSelected, onSelect, quantity, onQuantityChange }) => {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={onSelect}
    >
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{food.name}</Text>
        <Text style={styles.calories}>{food.calories} kcal</Text>
      </View>
      {isSelected && (
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Quantity:</Text>
          <TextInput
            style={styles.quantityInput}
            value={quantity.toString()}
            onChangeText={onQuantityChange}
            keyboardType="numeric"
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2C2C2C',
    borderRadius: normalize(8),
    padding: normalize(16),
    marginBottom: normalize(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedContainer: {
    backgroundColor: '#4CAF50',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontFamily: 'Roboto_700Bold',
    fontSize: normalize(16),
    color: '#FFFFFF',
    marginBottom: normalize(4),
  },
  calories: {
    fontFamily: 'Roboto_400Regular',
    fontSize: normalize(14),
    color: '#B3B3B3',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityLabel: {
    fontFamily: 'Roboto_400Regular',
    fontSize: normalize(14),
    color: '#FFFFFF',
    marginRight: normalize(8),
  },
  quantityInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(4),
    padding: normalize(4),
    width: normalize(40),
    textAlign: 'center',
    fontFamily: 'Roboto_400Regular',
    fontSize: normalize(14),
  },
});

export default CardFood;
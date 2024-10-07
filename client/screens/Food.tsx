import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getCategories } from '../service/categoryService';
import { getFoods } from '../service/foodService';
import { Category } from '../types/category';
import { Food } from '../types/Food';

const FoodSelectionScreen: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedFoods, setSelectedFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation();

  useEffect(() => {
    fetchCategories();
    fetchFoods();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFoods = async () => {
    setIsLoading(true);
    try {
      const fetchedFoods = await getFoods();
      setFoods(fetchedFoods);
    } catch (err) {
      setError('Failed to fetch foods');
      console.error('Error fetching foods:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = useCallback((category: Category) => {
    setSelectedCategory(category);
  }, []);

  const handleFoodSelect = useCallback((food: Food) => {
    setSelectedFoods(prevSelectedFoods => {
      const isAlreadySelected = prevSelectedFoods.some(selectedFood => selectedFood.id === food.id);
      if (isAlreadySelected) {
        return prevSelectedFoods.filter(selectedFood => selectedFood.id !== food.id);
      } else {
        return [...prevSelectedFoods, food];
      }
    });
  }, []);

  const handleConfirm = useCallback(() => {
    console.log('Selected foods:', selectedFoods);
    navigation.goBack();
  }, [selectedFoods, navigation]);

  const renderCategoryItem = useCallback(({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory?.id === item.id && styles.selectedCategoryItem
      ]}
      onPress={() => handleCategorySelect(item)}
    >
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  ), [selectedCategory, handleCategorySelect]);

  const renderFoodItem = useCallback(({ item }: { item: Food }) => (
    <TouchableOpacity
      style={[
        styles.foodItem,
        selectedFoods.some(food => food.id === item.id) && styles.selectedFoodItem
      ]}
      onPress={() => handleFoodSelect(item)}
    >
      <Text style={styles.foodText}>{item.name}</Text>
      <Text style={styles.caloriesText}>{item.calories} kcal</Text>
    </TouchableOpacity>
  ), [selectedFoods, handleFoodSelect]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderContent = () => {
    if (categories.length === 0 && foods.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.noDataText}>Veri yok</Text>
        </View>
      );
    }

    return (
      <>
        <Text style={styles.title}>Select Category and Foods</Text>
        {categories.length > 0 ? (
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryList}
          />
        ) : (
          <Text style={styles.noDataText}>Kategori yok</Text>
        )}
        {foods.length > 0 ? (
          <FlatList
            data={selectedCategory ? foods.filter(food => food.category === selectedCategory.id) : foods}
            renderItem={renderFoodItem}
            keyExtractor={item => item.id.toString()}
            style={styles.foodList}
          />
        ) : (
          <Text style={styles.noDataText}>Yemek yok</Text>
        )}
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm Selection</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoryList: {
    maxHeight: 50,
    marginBottom: 16,
  },
  categoryItem: {
    backgroundColor: '#e0e0e0',
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
  },
  selectedCategoryItem: {
    backgroundColor: '#2196f3',
  },
  categoryText: {
    fontSize: 16,
  },
  foodList: {
    flex: 1,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  selectedFoodItem: {
    backgroundColor: '#e3f2fd',
  },
  foodText: {
    fontSize: 16,
  },
  caloriesText: {
    fontSize: 14,
    color: '#757575',
  },
  confirmButton: {
    backgroundColor: '#4caf50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
  },
  noDataText: {
    fontSize: 18,
    color: '#757575',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default FoodSelectionScreen;
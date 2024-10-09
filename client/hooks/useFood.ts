import { useState, useCallback } from 'react';
import * as foodService from '../service/foodService';
import { Food, FoodInput, UserFood } from '../types/Food';

export const useFood = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFoods = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedFoods = await foodService.getFoods();
      setFoods(fetchedFoods as Food[]);
    } catch (err) {
      setError('Failed to fetch foods');
      console.error('Error fetching foods:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addUserFoods = useCallback(async (selectedFoods: FoodInput[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const addedFoods = await foodService.addMultipleUserFoods(selectedFoods);
      setFoods(prevFoods => [...prevFoods, ...(addedFoods as Food[])]);
    } catch (err) {
      setError('Failed to add foods');
      console.error('Error adding foods:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addFood = useCallback(async (food: FoodInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const newFood = await foodService.createFood(food);
      setFoods(prevFoods => [...prevFoods, newFood as Food]);
    } catch (err) {
      setError('Failed to add food');
      console.error('Error adding food:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const editFood = useCallback(async (id: number, food: Partial<FoodInput>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedFood = await foodService.updateFood(id, food);
      setFoods(prevFoods => prevFoods.map(f => f.id === id ? updatedFood as Food : f));
    } catch (err) {
      setError('Failed to update food');
      console.error('Error updating food:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeFood = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await foodService.deleteFood(id);
      setFoods(prevFoods => prevFoods.filter(f => f.id !== id));
    } catch (err) {
      setError('Failed to delete food');
      console.error('Error deleting food:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFoodsByDate = useCallback(async (date: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedFoods = await foodService.getFoodsByDate(date);
      setFoods(fetchedFoods as Food[]);
    } catch (err) {
      setError('Failed to fetch foods by date');
      console.error('Error fetching foods by date:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { foods, isLoading, error, fetchFoods, addUserFoods, addFood, editFood, removeFood, fetchFoodsByDate };
};
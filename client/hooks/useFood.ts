import { useState, useCallback } from 'react';
import * as foodService from '../service/foodService';
import { Food, FoodInput, UserFoodInput } from '../types/Food';

export const useFood = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFoods = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedFoods: any[] = await foodService.getFoods();
      setFoods(fetchedFoods);
    } catch (err) {
      setError('Failed to fetch foods');
      console.error('Error fetching foods:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addUserFoods = useCallback(async (userFoods: any[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const addedFoods:any = await foodService.addUserFoods(userFoods);
      setFoods((prevFoods: Food[]) => [...prevFoods, ...addedFoods]);
      return addedFoods;
    } catch (err) {
      setError('Failed to add user foods');
      console.error('Error adding user foods:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addFood = useCallback(async (food: FoodInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const newFood: any = await foodService.createFood(food);
      setFoods(prevFoods => [...prevFoods, newFood]);
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
      const updatedFood: any = await foodService.updateFood(id, food);
      setFoods(prevFoods => prevFoods.map(f => f.id === id ? updatedFood : f));
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
      const fetchedFoods: any[] = await foodService.getFoodsByDate(date);
      setFoods(fetchedFoods);
    } catch (err) {
      setError('Failed to fetch foods by date');
      console.error('Error fetching foods by date:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { foods, isLoading, error, fetchFoods, addUserFoods, addFood, editFood, removeFood, fetchFoodsByDate };
};

import { useState, useCallback } from 'react';
import { Food, UserFood } from '../types/Food';
import { getAllFoods, addUserFood, getUserFoods, createFood, searchFoods } from '../service/foodService';
import { getUserId } from '../utils/storage';

export const useFood = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [userFoods, setUserFoods] = useState<UserFood[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllFoods = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedFoods = await getAllFoods();
      setFoods(fetchedFoods);
    } catch (err) {
      setError('Yemekleri getirirken bir hata oluştu.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addNewUserFood = useCallback(async (foodId: number, quantity: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const userId = await getUserId();
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const userFoodData = {
        user_id: parseInt(userId, 10),
        food_id: foodId,
        quantity: quantity
      };
      
      const newUserFood = await addUserFood(userFoodData);
      
      if (!newUserFood) {
        throw new Error('Kullanıcı yemeği eklenemedi');
      }
      
      setUserFoods(prevUserFoods => [...prevUserFoods, newUserFood]);
      return newUserFood;
    } catch (err) {
      setError('Kullanıcı yemeği eklenirken bir hata oluştu.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addMultipleUserFoods = useCallback(async (foods: { food_id: number; quantity: number }[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const userId = await getUserId();
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const results = await Promise.all(
        foods.map(({ food_id, quantity }) => 
          addUserFood({ user_id: parseInt(userId, 10), food_id, quantity })
        )
      );
      
      setUserFoods(prevUserFoods => [...prevUserFoods, ...results]);
      return results;
    } catch (err) {
      setError('Kullanıcı yemekleri eklenirken bir hata oluştu.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserFoods = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedUserFoods = await getUserFoods();
      setUserFoods(fetchedUserFoods);
    } catch (err) {
      setError('Kullanıcı yemeklerini getirirken bir hata oluştu.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addNewFood = useCallback(async (foodData: Omit<Food, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newFood = await createFood(foodData);
      setFoods(prevFoods => [...prevFoods, newFood]);
      return newFood;
    } catch (err) {
      setError('Yeni yemek eklenirken bir hata oluştu.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchForFoods = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const searchResults = await searchFoods(query);
      return searchResults;
    } catch (err) {
      setError('Yemek araması yapılırken bir hata oluştu.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    foods,
    userFoods,
    isLoading,
    error,
    fetchAllFoods,
    addNewUserFood,
    addMultipleUserFoods,
    fetchUserFoods,
    addNewFood,
    searchForFoods,
  };
};
import api from "../api";
import { Food, UserFood } from "../types/Food";

/**
 * Creates a new food item.
 * @param foodData - The food data to create.
 * @returns Promise containing the created Food object.
 * @throws Error if the API call fails.
 */
export const createFood = async (foodData: { name: string; calories: number; categoryId: number }): Promise<Food> => {
  try {
    const response = await api.post<Food>('/foods', foodData);
    return response.data;
  } catch (error) {
    console.error('Error creating food:', error);
    throw error;
  }
};

/**
 * Retrieves all foods for the logged-in user.
 * @returns Promise containing an array of Food objects with their associated categories.
 * @throws Error if the API call fails.
 */
export const getFoods = async (): Promise<Food[]> => {
  try {
    const response = await api.get<Food[]>('/foods');
    return response.data;
  } catch (error) {
    console.error('Error fetching foods:', error);
    throw error;
  }
};

/**
 * Updates an existing food item.
 * @param foodId - The ID of the food to update.
 * @param foodData - The updated food data.
 * @returns Promise containing the updated Food object.
 * @throws Error if the API call fails.
 */
export const updateFood = async (foodId: number, foodData: { name: string; calories: number; categoryId: number }): Promise<Food> => {
  try {
    const response = await api.put<Food>(`/foods/${foodId}`, foodData);
    return response.data;
  } catch (error) {
    console.error('Error updating food:', error);
    throw error;
  }
};

/**
 * Deletes a food item.
 * @param foodId - The ID of the food to delete.
 * @returns Promise containing a success message.
 * @throws Error if the API call fails.
 */
export const deleteFood = async (foodId: number): Promise<{ message: string }> => {
  try {
    const response = await api.delete<{ message: string }>(`/foods/${foodId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting food:', error);
    throw error;
  }
};
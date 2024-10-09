/**
 * Food service module for handling food-related API operations.
 */

import api from "../api";

/**
 * Represents a food item.
 */
export interface Food {
  id: number;
  name: string;
  calories: number;
  categoryId: number;
}

/**
 * Represents input data for creating a food item.
 */
export interface FoodInput {
  name: string;
  calories: number;
  categoryId: number;
}

/**
 * Represents input data for creating multiple food items.
 */
export interface MultipleFoodInput {
  foods: FoodInput[];
}

/**
 * Represents an API error.
 */
export interface APIError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Fetches all foods from the API.
 * @returns A promise that resolves to an array of Food objects.
 * @throws {APIError} If the API request fails.
 */
export const getFoods = async (): Promise<Food[]> => {
  try {
    const response = await api.get<Food[]>('/foods');
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch foods');
  }
};

/**
 * Creates a new food item.
 * @param food - The food item to create.
 * @returns A promise that resolves to the created Food object.
 * @throws {APIError} If the API request fails.
 */
export const createFood = async (food: FoodInput): Promise<Food> => {
  try {
    const response = await api.post<Food>('/foods', food);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to create food');
  }
};

/**
 * Updates an existing food item.
 * @param id - The ID of the food item to update.
 * @param food - The updated food data.
 * @returns A promise that resolves to the updated Food object.
 * @throws {APIError} If the API request fails.
 */
export const updateFood = async (id: number, food: Partial<FoodInput>): Promise<Food> => {
  try {
    const response = await api.put<Food>(`/foods/${id}`, food);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to update food');
  }
};

/**
 * Deletes a food item.
 * @param id - The ID of the food item to delete.
 * @throws {APIError} If the API request fails.
 */
export const deleteFood = async (id: number): Promise<void> => {
  try {
    await api.delete(`/foods/${id}`);
  } catch (error) {
    throw handleApiError(error, 'Failed to delete food');
  }
};

/**
 * Adds multiple food items for a user.
 * @param foods - An array of food items to add.
 * @returns A promise that resolves to an array of created Food objects.
 * @throws {APIError} If the API request fails.
 */
export const addMultipleUserFoods = async (foods: FoodInput[]): Promise<Food[]> => {
  try {
    const response = await api.post<Food[]>('/foods/multiple', { foods });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to add multiple user foods');
  }
};

/**
 * Handles API errors and formats them into APIError objects.
 * @param error - The error caught from the API request.
 * @param defaultMessage - A default error message to use if no specific message is available.
 * @returns An APIError object.
 */
const handleApiError = (error: unknown, defaultMessage: string): APIError => {
  if (error instanceof Error) {
    const apiError: APIError = {
      message: error.message || defaultMessage,
    };

    if ('response' in error && error.response) {
      const response = error.response as { data?: { message?: string; code?: string }; status?: number };
      apiError.message = response.data?.message || apiError.message;
      apiError.code = response.data?.code;
      apiError.status = response.status;
    }

    return apiError;
  }

  return {
    message: defaultMessage,
  };
};

/**
 * Fetches foods for a specific date.
 * @param date - The date for which to fetch foods.
 * @returns A promise that resolves to an array of Food objects.
 * @throws {APIError} If the API request fails.
 */
export const getFoodsByDate = async (date: string): Promise<Food[]> => {
  try {
    const response = await api.get<Food[]>(`/foods/date/${date}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch foods by date');
  }
};

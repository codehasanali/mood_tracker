import api from "../api";

/**
 * Represents a food item.
 */
export interface Food {
  id: number; // Unique identifier for the food item
  name: string; // Name of the food item
  calories: number; // Caloric content of the food item
  categoryId: number; // Identifier for the category the food belongs to
}

/**
 * Represents the input data required to create or update a food item.
 */
export interface FoodInput {
  name: string; // Name of the food item
  calories: number; // Caloric content of the food item
  categoryId: number; // Identifier for the category the food belongs to
}

/**
 * Represents input data for adding multiple food items.
 */
export interface MultipleFoodInput {
  foods: FoodInput[]; // Array of food input data
}

/**
 * Handles API errors by returning a formatted error message.
 * @param error - The error object caught during the API call.
 * @param message - A custom message to include in the error.
 * @returns A new Error object with a formatted message.
 */
const handleApiError = (error: unknown, message: string): Error => {
  return new Error(`Error: ${error instanceof Error ? error.message : 'Unknown error'} - ${message}`);
};

/**
 * Retrieves all food items from the API.
 * @returns A Promise containing an array of Food objects.
 * @throws Throws an error if the API call fails.
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
 * Creates a new food item in the API.
 * @param food - The food data to be created.
 * @returns A Promise containing the created Food object.
 * @throws Throws an error if the API call fails.
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
 * Updates an existing food item in the API.
 * @param id - The ID of the food item to update.
 * @param food - The updated food data.
 * @returns A Promise containing the updated Food object.
 * @throws Throws an error if the API call fails.
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
 * Deletes a food item from the API.
 * @param id - The ID of the food item to delete.
 * @throws Throws an error if the API call fails.
 */
export const deleteFood = async (id: number): Promise<void> => {
  try {
    await api.delete(`/foods/${id}`);
  } catch (error) {
    throw handleApiError(error, 'Failed to delete food');
  }
};

/**
 * Adds multiple food items for the user in the API.
 * @param foods - An array of food input data to be added.
 * @returns A Promise containing an array of created Food objects.
 * @throws Throws an error if the API call fails.
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
 * Retrieves food items by date from the API.
 * @param date - The date to filter food items.
 * @returns A Promise containing an array of Food objects.
 * @throws Throws an error if the API call fails.
 */
export const getFoodsByDate = async (date: string): Promise<Food[]> => {
  try {
    const response = await api.get<Food[]>(`/foods/date/${date}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch foods by date');
  }
};

export interface UserFoodInput {
  foodId: number;
  quantity: number;
  eatenAt: string;
}

export const addUserFoods = async (userFoods: UserFoodInput[]): Promise<Food[]> => {
  try {
    const response = await api.post<Food[]>('/foods/multiple', userFoods);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to add user foods');
  }
};

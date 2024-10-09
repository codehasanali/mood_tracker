/**
 * Category service module for handling category-related API operations.
 */

import api from "../api";
import { Category } from "../types/Category";

/**
 * Represents input data for creating or updating a category.
 */
interface CategoryInput {
  name: string;
}

/**
 * Creates a new category.
 * @param categoryData - The category data to be created.
 * @returns A Promise containing the created Category object.
 * @throws Throws an error if the API call fails.
 */
export const createCategory = async (categoryData: CategoryInput): Promise<Category> => {
  try {
    const response = await api.post<Category>('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Retrieves all categories.
 * @returns A Promise containing an array of Category objects.
 * @throws Throws an error if the API call fails.
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Retrieves a specific category by its ID.
 * @param id - The ID of the category to fetch.
 * @returns A Promise containing the Category object.
 * @throws Throws an error if the API call fails.
 */
export const getCategoryById = async (id: number): Promise<Category> => {
  try {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

/**
 * Updates an existing category.
 * @param id - The ID of the category to update.
 * @param categoryData - The updated category data.
 * @returns A Promise containing the updated Category object.
 * @throws Throws an error if the API call fails.
 */
export const updateCategory = async (id: number, categoryData: CategoryInput): Promise<Category> => {
  try {
    const response = await api.put<Category>(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Deletes a category.
 * @param id - The ID of the category to delete.
 * @throws Throws an error if the API call fails.
 */
export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await api.delete(`/categories/${id}`);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

/**
 * Assigns a category to a mood.
 * @param moodId - The ID of the mood.
 * @param categoryId - The ID of the category to assign.
 * @throws Throws an error if the API call fails.
 */
export const assignCategoryToMood = async (moodId: number, categoryId: number): Promise<void> => {
  try {
    await api.post(`/moods/${moodId}/categories/${categoryId}`);
  } catch (error) {
    console.error('Error assigning category to mood:', error);
    throw error;
  }
};

/**
 * Removes a category from a mood.
 * @param moodId - The ID of the mood.
 * @param categoryId - The ID of the category to remove.
 * @throws Throws an error if the API call fails.
 */
export const removeCategoryFromMood = async (moodId: number, categoryId: number): Promise<void> => {
  try {
    await api.delete(`/moods/${moodId}/categories/${categoryId}`);
  } catch (error) {
    console.error('Error removing category from mood:', error);
    throw error;
  }
};
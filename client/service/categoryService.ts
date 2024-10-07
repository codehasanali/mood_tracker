import api from "../api";
import { Category } from "../types/category";


interface CategoryInput {
  name: string;
}

export const createCategory = async (categoryData: CategoryInput): Promise<Category> => {
  try {
    const response = await api.post<Category>('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getCategoryById = async (id: number): Promise<Category> => {
  try {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

export const updateCategory = async (id: number, categoryData: CategoryInput): Promise<Category> => {
  try {
    const response = await api.put<Category>(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await api.delete(`/categories/${id}`);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

export const assignCategoryToMood = async (moodId: number, categoryId: number): Promise<void> => {
  try {
    await api.post(`/moods/${moodId}/categories/${categoryId}`);
  } catch (error) {
    console.error('Error assigning category to mood:', error);
    throw error;
  }
};

export const removeCategoryFromMood = async (moodId: number, categoryId: number): Promise<void> => {
  try {
    await api.delete(`/moods/${moodId}/categories/${categoryId}`);
  } catch (error) {
    console.error('Error removing category from mood:', error);
    throw error;
  }
};
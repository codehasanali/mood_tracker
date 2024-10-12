
import api from "../api";


export interface Category {
  id: number;
  name: string;
}

export interface CategoryInput {
  name: string;
}

const handleApiError = (error: unknown, message: string): Error => {
  return new Error(`Error: ${error instanceof Error ? error.message : 'Unknown error'} - ${message}`);
};



export const createCategory = async (categoryData: CategoryInput): Promise<Category> => {
  try {
    const response = await api.post<Category>('/categories', categoryData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to create category');
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch categories');
  }
};

export const getCategoryById = async (id: number): Promise<Category> => {
  try {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch category');
  }
};

export const updateCategory = async (id: number, categoryData: CategoryInput): Promise<Category> => {
  try {
    const response = await api.put<Category>(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to update category');
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await api.delete(`/categories/${id}`);
  } catch (error) {
    throw handleApiError(error, 'Failed to delete category');
  }
};

export const assignCategoryToMood = async (moodId: number, categoryId: number): Promise<void> => {
  try {
    await api.post(`/moods/${moodId}/categories/${categoryId}`);
  } catch (error) {
    throw handleApiError(error, 'Failed to assign category to mood');
  }
};

export const removeCategoryFromMood = async (moodId: number, categoryId: number): Promise<void> => {
  try {
    await api.delete(`/moods/${moodId}/categories/${categoryId}`);
  } catch (error) {
    throw handleApiError(error, 'Failed to remove category from mood');
  }
};
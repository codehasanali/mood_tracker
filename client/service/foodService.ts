import api from "../api";
import { Food, UserFood } from "../types/Food";

/**
 * Tüm yemekleri getirir.
 * @returns Food nesnelerinin bir dizisini içeren Promise.
 * @throws API çağrısı başarısız olursa hata fırlatır.
 */
export const getAllFoods = async (): Promise<Food[]> => {
  try {
    const response = await api.get<Food[]>('/foods');
    return response.data;
  } catch (error) {
    console.error('Error fetching all foods:', error);
    throw error;
  }
};

/**
 * Kullanıcıya ait yeni bir yemek ekler.
 * @param userFoodData - Eklenecek kullanıcı yemeği verisi.
 * @param userFoodData.food_id - Yemeğin ID'si.
 * @param userFoodData.quantity - Yemeğin miktarı.
 * @returns Oluşturulan UserFood nesnesini içeren bir Promise.
 * @throws API çağrısı başarısız olursa hata fırlatır.
 */
export const addUserFood = async (userFoodData: { user_id: number; food_id: number; quantity: number }): Promise<UserFood> => {
  try {
    const response = await api.post<UserFood>('/user-foods', userFoodData);
    return response.data;
  } catch (error) {
    console.error('Error adding user food:', error);
    throw error;
  }
};

/**
 * Giriş yapmış kullanıcıya ait tüm yemekleri getirir.
 * @returns UserFood nesnelerinin bir dizisini içeren Promise.
 * @throws API çağrısı başarısız olursa hata fırlatır.
 */
export const getUserFoods = async (): Promise<UserFood[]> => {
  try {
    const response = await api.get<UserFood[]>('/user-foods');
    return response.data;
  } catch (error) {
    console.error('Error fetching user foods:', error);
    throw error;
  }
};

/**
 * Yeni bir yemek oluşturur.
 * @param foodData - Oluşturulacak yemek verisi.
 * @returns Oluşturulan Food nesnesini içeren bir Promise.
 * @throws API çağrısı başarısız olursa hata fırlatır.
 */
export const createFood = async (foodData: Omit<Food, 'id'>): Promise<Food> => {
  try {
    const response = await api.post<Food>('/foods', foodData);
    return response.data;
  } catch (error) {
    console.error('Error creating food:', error);
    throw error;
  }
};

/**
 * Yemekleri arar.
 * @param query - Arama sorgusu.
 * @returns Food nesnelerinin bir dizisini içeren Promise.
 * @throws API çağrısı başarısız olursa hata fırlatır.
 */
export const searchFoods = async (query: string): Promise<Food[]> => {
  try {
    const response = await api.get<Food[]>(`/foods/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching foods:', error);
    throw error;
  }
};

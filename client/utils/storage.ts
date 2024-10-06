import * as SecureStore from 'expo-secure-store';

export const setToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync('userToken', token);
  } catch (error) {
    console.error('Error setting token:', error);
    throw new Error('Failed to set token');
  }
};

export const getToken = async () => {
  return await SecureStore.getItemAsync('userToken');
};

export const removeToken = async () => {
  await SecureStore.deleteItemAsync('userToken');
};

export const setUserId = async (userId: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync('userId', userId);
  } catch (error) {
    console.error('Error setting user ID:', error);
    throw new Error('Failed to set user ID');
  }
};

export const getUserId = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync('userId');
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

export const removeUserId = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync('userId');
  } catch (error) {
    console.error('Error removing user ID:', error);
    throw new Error('Failed to remove user ID');
  }
};
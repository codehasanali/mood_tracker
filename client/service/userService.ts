import api from "../api";
import { getToken } from "../utils/storage";
import { User } from "../types/Auth";


export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get<User>('/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};
export const updateUsername = async (newUsername: string): Promise<User> => {
  try {
    const token = await getToken();
    const response = await api.put<User>('/user/username', { username: newUsername }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error updating username:', error.message);
      throw new Error(`Failed to update username: ${error.message}`);
    } else {
      console.error('Unknown error updating username');
      throw new Error('Failed to update username due to an unknown error');
    }
  }
};


export const deleteUser = async (): Promise<void> => {
  try {
    const token = await getToken();
    await api.delete('/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error deleting user:', error.message);
      throw new Error(`Failed to delete user: ${error.message}`);
    } else {
      console.error('Unknown error deleting user');
      throw new Error('Failed to delete user due to an unknown error');
    }
  }
};

export const updateUser = async (userData: { username: string }): Promise<User> => {
  try {
    const token = await getToken();
    const response = await api.put<User>('/user', userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error updating user:', error.message);
      throw new Error(`Failed to update user: ${error.message}`);
    } else {
      console.error('Unknown error updating user');
      throw new Error('Failed to update user due to an unknown error');
    }
  }
};

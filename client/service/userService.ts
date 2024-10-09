import api from "../api";
import { getToken } from "../utils/storage";
import { User } from "../types/Auth";

/**
 * Fetches the user profile from the API.
 * @returns A Promise containing the User object.
 * @throws Throws an error if the API call fails.
 */
export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get<User>('/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Updates the username of the current user.
 * @param newUsername - The new username to set.
 * @returns A Promise containing the updated User object.
 * @throws Throws an error if the API call fails.
 */
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

/**
 * Deletes the current user's account.
 * @throws Throws an error if the API call fails.
 */
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

/**
 * Updates the user's profile information.
 * @param userData - An object containing the user data to update (currently only username).
 * @returns A Promise containing the updated User object.
 * @throws Throws an error if the API call fails.
 */
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

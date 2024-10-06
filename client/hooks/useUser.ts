import { useState, useEffect, useCallback } from 'react';
import { User } from '../types/User';
import { deleteUser, getUserProfile, updateUser } from '../service/userService';

const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userProfile = await getUserProfile();
      setUser(userProfile);
    } catch (err) {
      setError('Failed to fetch user profile');
      console.error('Error fetching user profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUserProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteUser();
      setUser(null);
    } catch (err) {
      setError('Failed to delete user profile');
      console.error('Error deleting user profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (userData: { username: string; appPassword?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedUser = await updateUser(userData);
      setUser(updatedUser);
    } catch (err) {
      setError('Failed to update user profile');
      console.error('Error updating user profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return {
    user,
    isLoading,
    error,
    fetchUserProfile,
    deleteUserProfile,
    updateUserProfile,
  };
};

export default useUser;

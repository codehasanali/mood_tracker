import { useState, useEffect, useCallback } from 'react';
import { Mood } from '../types/Mood';
import { getMoods, addMood as addMoodService, deleteMood as deleteMoodService, getMoodByDate } from '../service/moodService';
import { Tag } from '../types/Tag';
import { getTags, addTag as addTagService } from '../service/tagService';

const useMood = () => {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMoods = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedMoods = await getMoods();
      setMoods(fetchedMoods);
    } catch (err) {
      setError('Failed to fetch moods');
      console.error('Error fetching moods:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMoodsByDate = useCallback(async (date: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedMoods = await getMoodByDate(date);
      setMoods(fetchedMoods);
    } catch (err) {
      setError('Failed to fetch moods by date');
      console.error('Error fetching moods by date:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTags = await getTags();
      setTags(fetchedTags as any);
    } catch (err) {
      setError('Failed to fetch tags');
      console.error('Error fetching tags:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addMood = useCallback(async (moodData: { title: string; description: string; emoji: string; tags: number[] }) => {
    setIsLoading(true);
    setError(null);
    try {
      const newMood = await addMoodService(moodData);
      setMoods(prevMoods => [newMood, ...prevMoods]);
      return newMood;
    } catch (err) {
      setError('Failed to add mood');
      console.error('Error adding mood:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTag = useCallback(async (tagData: { name: string; isPublic: boolean }) => {
    setIsLoading(true);
    setError(null);
    try {
      const newTag = await addTagService(tagData);
      setTags(prevTags => [...prevTags, newTag as any]);
      return newTag;
    } catch (err) {
      setError('Failed to add tag');
      console.error('Error adding tag:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteMood = useCallback(async (moodId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteMoodService(moodId);
      setMoods(prevMoods => prevMoods.filter(mood => mood.id !== moodId));
    } catch (err) {
      setError('Failed to delete mood');
      console.error('Error deleting mood:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMoods();
    fetchTags();
  }, [fetchMoods, fetchTags]);

  return {
    moods,
    tags,
    isLoading,
    error,
    fetchMoods,
    fetchMoodsByDate,
    fetchTags,
    addMood,
    addTag,
    deleteMood,
  };
};

export default useMood;
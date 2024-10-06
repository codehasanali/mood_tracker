import { useState, useCallback } from 'react';
import api from "../api";
import { Tag } from "../types/Tag";

const useTag = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Tag[]>('/tags');
      setTags(response.data.map(tag => ({
        ...tag,
        id: tag.id.toString()
      })));
    } catch (err) {
      setError('Failed to fetch tags');
      console.error('Error fetching tags:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTag = useCallback(async (tagData: { name: string; isPublic: boolean }): Promise<Tag> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<Tag>('/tag', tagData);
      const newTag = { ...response.data, id: response.data.id.toString() };
      setTags(prevTags => [...prevTags, newTag]);
      return newTag;
    } catch (err) {
      setError('Failed to add tag');
      console.error('Error adding tag:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    tags,
    isLoading,
    error,
    fetchTags,
    addTag
  };
};

export default useTag;
import { useState, useCallback, useEffect } from 'react';
import { Tag, TagInput } from '../types/Tag';
import { getTags, addTag as addTagService } from '../service/tagService';

const useTag = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTags:any = await getTags();
      setTags(fetchedTags);
    } catch (err) {
      setError('Etiketleri getirme başarısız oldu');
      console.error('Etiketleri getirirken hata:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTag = useCallback(async (tagData: any): Promise<Tag> => {
    setIsLoading(true);
    setError(null);
    try {
      const newTag:any = await addTagService(tagData);
      setTags(prevTags => [...prevTags, newTag]);
      return newTag;
    } catch (err) {
      setError('Etiket ekleme başarısız oldu');
      console.error('Etiket eklerken hata:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    isLoading,
    error,
    fetchTags,
    addTag
  };
};

export default useTag;
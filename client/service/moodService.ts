import api from "../api";
import { Mood, Tag } from "../types/Mood";

interface MoodInput {
  title: string;
  description: string;
  emoji: string;
  tags: number[];
}

export const addMood = async (moodData: MoodInput): Promise<Mood> => {
  try {
    const response = await api.post<Mood>('/moods', moodData);
    return formatMood(response.data);
  } catch (error) {
    console.error('Error adding mood:', error);
    throw error;
  }
};

export const getMoods = async (): Promise<Mood[]> => {
  try {
    const response = await api.get<Mood[]>('/moods');
    if (!response.data) {
      throw new Error('No data received from the server');
    }
    return response.data.map(formatMood);
  } catch (error) {
    console.error('Error fetching moods:', error);
    throw error;
  }
};

export const getMoodById = async (id: string): Promise<Mood> => {
  try {
    const response = await api.get<Mood>(`/mood/${id}`);
    return formatMood(response.data);
  } catch (error) {
    console.error('Error fetching mood by ID:', error);
    throw error;
  }
};

export const deleteMood = async (id: string): Promise<void> => {
  try {
    await api.delete(`/mood/${id}`);
  } catch (error) {
    console.error('Error deleting mood:', error);
    throw error;
  }
};

export const getMoodByDate = async (date: string): Promise<Mood[]> => {
  try {
    const response = await api.get<Mood[]>(`/mood/date/${date}`);
    if (!response.data) {
      throw new Error('No data received from the server');
    }
    return response.data.map(formatMood);
  } catch (error) {
    console.error('Error fetching moods by date:', error);
    throw error;
  }
};

export const getTags = async (): Promise<Tag[]> => {
  try {
    const response = await api.get<Tag[]>('/tags');
    if (!response.data) {
      throw new Error('No data received from the server');
    }
    return response.data.map(formatTag);
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};

export const createTag = async (tagName: string, isPublic: boolean): Promise<Tag> => {
  try {
    const response = await api.post<Tag>('/tags', { name: tagName, isPublic });
    return formatTag(response.data);
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
};

const formatMood = (mood: Mood): Mood => ({
  ...mood,
  id: mood.id.toString(),
  userId: mood.userId.toString(),
  createdAt: new Date(mood.createdAt).toISOString(),
  updatedAt: new Date(mood.updatedAt).toISOString(),
  tags: mood.tags?.map(formatTag) ?? [],
});

const formatTag = (tag: Tag): Tag => ({
  ...tag,
  id: tag.id.toString(),
  userId: tag.userId.toString(),
});
/**
 * Imports the API client and necessary types.
 */
import api from "../api";
import { Mood, Tag } from "../types/Mood";

/**
 * Defines the structure for mood input data.
 */
interface MoodInput {
  title: string;
  description: string;
  emoji: string;
  tags: number[];
}

/**
 * Adds a new mood entry.
 * @param moodData - The mood data to be added.
 * @returns A Promise containing the created Mood object.
 * @throws Throws an error if the API call fails.
 */
export const addMood = async (moodData: MoodInput): Promise<Mood> => {
  try {
    const response = await api.post<Mood>('/moods', moodData);
    return formatMood(response.data);
  } catch (error) {
    console.error('Error adding mood:', error);
    throw error;
  }
};

/**
 * Retrieves all mood entries.
 * @returns A Promise containing an array of Mood objects.
 * @throws Throws an error if the API call fails or no data is received.
 */
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

/**
 * Retrieves a specific mood entry by its ID.
 * @param id - The ID of the mood to fetch.
 * @returns A Promise containing the Mood object.
 * @throws Throws an error if the API call fails.
 */
export const getMoodById = async (id: string): Promise<Mood> => {
  try {
    const response = await api.get<Mood>(`/mood/${id}`);
    return formatMood(response.data);
  } catch (error) {
    console.error('Error fetching mood by ID:', error);
    throw error;
  }
};

/**
 * Deletes a specific mood entry.
 * @param id - The ID of the mood to delete.
 * @throws Throws an error if the API call fails.
 */
export const deleteMood = async (id: string): Promise<void> => {
  try {
    await api.delete(`/mood/${id}`);
  } catch (error) {
    console.error('Error deleting mood:', error);
    throw error;
  }
};

/**
 * Retrieves mood entries for a specific date.
 * @param date - The date to fetch moods for.
 * @returns A Promise containing an array of Mood objects.
 * @throws Throws an error if the API call fails or no data is received.
 */
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

/**
 * Retrieves all tags.
 * @returns A Promise containing an array of Tag objects.
 * @throws Throws an error if the API call fails or no data is received.
 */
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

/**
 * Creates a new tag.
 * @param tagName - The name of the tag to create.
 * @param isPublic - Whether the tag is public or not.
 * @returns A Promise containing the created Tag object.
 * @throws Throws an error if the API call fails.
 */
export const createTag = async (tagName: string, isPublic: boolean): Promise<Tag> => {
  try {
    const response = await api.post<Tag>('/tags', { name: tagName, isPublic });
    return formatTag(response.data);
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
};

/**
 * Formats a mood object, ensuring all properties are in the correct format.
 * @param mood - The mood object to format.
 * @returns The formatted Mood object.
 */
const formatMood = (mood: Mood): Mood => ({
  ...mood,
  id: mood.id.toString(),
  userId: mood.userId.toString(),
  createdAt: new Date(mood.createdAt).toISOString(),
  updatedAt: new Date(mood.updatedAt).toISOString(),
  tags: mood.tags?.map(formatTag) ?? [],
});

/**
 * Formats a tag object, ensuring all properties are in the correct format.
 * @param tag - The tag object to format.
 * @returns The formatted Tag object.
 */
const formatTag = (tag: Tag): Tag => ({
  ...tag,
  id: tag.id.toString(),
  userId: tag.userId.toString(),
});
import api from "../api";
import { Tag } from "../types/Mood";

/**
 * Adds a new tag for the user.
 * @param tagData - The tag data to be added.
 * @param tagData.name - The name of the tag.
 * @param tagData.isPublic - Whether the tag is public or not.
 * @returns A Promise containing the created Tag object.
 * @throws Throws an error if the API call fails.
 */
export const addTag = async (tagData: { name: string; isPublic: boolean }): Promise<Tag> => {
  try {
    const response = await api.post<Tag>('/tags', tagData);
    return formatTag(response.data);
  } catch (error) {
    console.error('Error adding tag:', error);
    throw error;
  }
};

/**
 * Retrieves all tags for the logged-in user.
 * @returns A Promise containing an array of Tag objects.
 * @throws Throws an error if the API call fails.
 */
export const getTags = async (): Promise<Tag[]> => {
  try {
    const response = await api.get<Tag[]>('/tags');
    return response.data.map(formatTag);
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};

/**
 * Adds an existing tag to the user.
 * @param tagId - The ID of the tag to be added.
 * @returns A Promise indicating success.
 * @throws Throws an error if the API call fails.
 */
export const addUserTag = async (tagId: number): Promise<void> => {
  try {
    await api.post('/user-tags', { tagId });
  } catch (error) {
    console.error('Error adding user tag:', error);
    throw error;
  }
};

const formatTag = (tag: Tag): Tag => ({
  ...tag,
  id: tag.id.toString(),
  userId: tag.userId?.toString() || '',
});
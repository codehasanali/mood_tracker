import api from "../api";const handleApiError = (error: unknown, message: string): Error => {
  return new Error(`Error: ${error instanceof Error ? error.message : 'Unknown error'} - ${message}`);
};


export interface Tag {
  id: string;
  name: string;
  isPublic: boolean;
  userId: string;
}

export interface TagInput {
  name: string;
  isPublic: boolean;
}

export const addTag = async (tagData: TagInput): Promise<Tag> => {
  try {
    const response = await api.post<Tag>('/tags', tagData);
    return formatTag(response.data);
  } catch (error) {
    throw handleApiError(error, 'Failed to add tag');
  }
};

export const getTags = async (): Promise<Tag[]> => {
  try {
    const response = await api.get<Tag[]>('/tags');
    return response.data.map(formatTag);
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch tags');
  }
};

export const addUserTag = async (tagId: number): Promise<void> => {
  try {
    await api.post('/user-tags', { tagId });
  } catch (error) {
    throw handleApiError(error, 'Failed to add user tag');
  }
};

const formatTag = (tag: Tag): Tag => ({
  ...tag,
  id: tag.id.toString(),
  userId: tag.userId?.toString() || '',
});
export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface TagInput {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface CreateTagDto {
  name: string;
  color?: string;
}

export interface UpdateTagDto {
  name?: string;
  color?: string;
}

export interface TagResponse {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}






export interface Mood {
  id: string;
  title: string;
  description: string;
  emoji: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Tag {
  id: string;
  name: string;
  isPublic: boolean;
  userId: string;
}

export interface GroupedMoods {
  date: string;
  moods: Mood[];
}
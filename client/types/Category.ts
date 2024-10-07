export interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  name: string;
}

export interface CategoryWithFoods extends Category {
  foods: Food[];
}

interface Food {
  id: number;
  name: string;
  calories: number;
  categoryId: number;
}

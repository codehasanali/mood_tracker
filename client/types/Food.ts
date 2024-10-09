export interface Food {
  id: number;
  tags:any
  name: string;
  calories: number;
  categoryId: number;
  tag:any;
  category: {
    id: number;
    name: string;
  };
  createdAt: string;
}

export interface UserFood {
  id: number;
  userId: number;
  foodId: number;
  food: Food;
  quantity: number;
  createdAt: string;
  tag:any;
}

export interface FoodInput {
  name: string;
  calories: number;
  categoryId: number;
  tag:any;
}

export interface UserFoodInput {
  foodId: number;
  quantity: number;
  tag:any;
}
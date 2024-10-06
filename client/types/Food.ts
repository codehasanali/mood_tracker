export interface Food {
    id: number;
    name: string;
    calories: number;
  }
  
  export interface UserFood {
    id: number;
    user_id: number;
    food_id: number;
    food: Food;
    quantity: number;
    created_at: string;
  }
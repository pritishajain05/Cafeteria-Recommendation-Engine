import { CuisineType, DietaryPreference, SpiceLevel } from "../enum/UserPreferences";

export interface IFoodItem {
  name: string;
  price: number;
  availabilityStatus: boolean;
  foodCategoryId: number;
  mealTypeId: number;
}

export interface IMenuItem {
  id: number;
  name: string;
  price: number;
  availabilityStatus: string;
  categoryName: string;
  mealType: string;
}

export interface IFoodItemPreference {
  foodItemId?: number
  dietaryPreference: DietaryPreference
  spiceLevel: SpiceLevel
  cuisineType: CuisineType;
  sweetTooth: boolean
}
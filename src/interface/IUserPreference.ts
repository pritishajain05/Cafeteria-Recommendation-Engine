import { CuisinePreference, DietaryPreference, SpiceLevel } from "../enum/UserPreferences";

export interface IUserPreference {
    dietaryPreference: DietaryPreference;
    spiceLevel: SpiceLevel;
    cuisineType: CuisinePreference;
    sweetTooth: boolean;
  }

  export interface IFoodItemPreference {
    foodItemId: number
    dietaryPreference: DietaryPreference
    spiceLevel: SpiceLevel
    cuisineType: CuisinePreference
    sweetTooth: boolean
  }
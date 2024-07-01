import { CuisinePreference, DietaryPreference, SpiceLevel } from "../enum/UserPreferences";

export interface IUserPreferences {
    dietaryPreference: DietaryPreference;
    spiceLevel: SpiceLevel;
    cuisinePreference: CuisinePreference;
    sweetTooth: boolean;
  }
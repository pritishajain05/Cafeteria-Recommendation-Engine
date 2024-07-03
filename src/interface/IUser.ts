import { Role } from "../enum/Role";
import { CuisineType, DietaryPreference, SpiceLevel } from "../enum/UserPreferences";

export interface IUser {
    employeeId: number;
    name: string;
    role: Role;
}

export interface IUserPreference {
    dietaryPreference: DietaryPreference;
    spiceLevel: SpiceLevel;
    cuisineType: CuisineType;
    sweetTooth: boolean;
  }
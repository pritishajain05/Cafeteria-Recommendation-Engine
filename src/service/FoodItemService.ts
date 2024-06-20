import { MealType } from "../enums/MealType";
import { IFoodCategory } from "../interfaces/IFoodCategory";
import { IFoodItem } from "../interfaces/IFoodItem";
import { FoodItemRepository } from "../repository/FoodItemRepository";
import { deleteFoodItem } from '../client/AdminActions';

const categoryToMealTypeMapping: { [key: number]: MealType[] } = {
    8: [MealType.Lunch, MealType.Dinner], 
    9: [MealType.Lunch, MealType.Dinner], 
    10: [MealType.Breakfast ], 
    11: [MealType.Breakfast], 
    12: [MealType.Breakfast], 
  
  };

export class FoodItemService {
  private foodItemRepository = new FoodItemRepository();

  async getAllCategories(): Promise<IFoodCategory[] | null> {
    return await this.foodItemRepository.getAllCategories();
  }

  async addFoodItem(item: IFoodItem): Promise<{ message: string , success:boolean}> {
    try {
        const foodItemId =  await this.foodItemRepository.addFoodItem(item);
  
        const mealTypes = categoryToMealTypeMapping[item.foodCategoryId];
        if (mealTypes) {
          for (const mealTypeId of mealTypes) {
            await this.foodItemRepository.addFoodItemMealType(foodItemId, mealTypeId);
          }
        }
        return { message: "Food item added successfully" , success: true};
      } catch (error) {
        return { message: "Error in adding food item" , success: false};
      }
  }

  async deleteFoodItem(itemName: string): Promise<{message: string, success: boolean}> {
    return await this.foodItemRepository.deleteFoodItem(itemName);
  }
}

import { updateFoodItem } from "../client/AdminActions";
import { MealType } from "../enum/MealType";
import { IFoodCategory } from "../interface/IFoodCategory";
import { IFoodItem, IMenuItem } from "../interface/IFoodItem";
import { FoodItemRepository } from "../repository/FoodItemRepository";


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
    const exists = await this.foodItemRepository.checkFoodItemExistence(item.name);
      if(exists) {
        return { message:"Food Item already Exists! Try to Add another Food Item" , success: false ,}
      }
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
    const exists = await this.foodItemRepository.checkFoodItemExistence(itemName);
      if (!exists) {
        return { success: false, message: "Food item not found." };
      }

      try {
        const result = await this.foodItemRepository.deleteFoodItem(itemName);
        return { success: result.success, message: result.message };
        
      } catch (error) {
        return { success: false, message: `Failed to delete food item: ${error}` };
      }
    
}

async updateFoodItem(itemName: string, updatedFoodItem: IFoodItem): Promise<{ message: string, success: boolean }> {
  try {
    const result = await this.foodItemRepository.updateFoodItem(itemName, updatedFoodItem);
    return { success: result.success, message: result.message };
  } catch (error) {
    console.error("Error updating food item:", error);
    return { success: false, message: `Failed to update food item: ${error}` };
  }
}

async viewAllFoodItems(): Promise<IMenuItem[]| null>{
  return await this.foodItemRepository.getAllFoodItems();
}

}



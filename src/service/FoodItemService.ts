import { updateFoodItem } from "../client/AdminActions";
import { MealType } from "../enum/MealType";
import { IFoodCategory } from "../interface/IFoodCategory";
import { IFinalMenu, IFoodItem, IMenuItem, IRolledOutmenu } from "../interface/IFoodItem";
import { FoodItemRepository } from "../repository/FoodItemRepository";
import { ADD_ROLLED_OUT_ITEMS } from './../utils/constant';

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
        const result = await this.foodItemRepository.addFoodItem(item);
        return { success: result.success, message: result.message };
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

async updateFoodItem(oldItemName: string, updatedFoodItem: IFoodItem): Promise<{ message: string, success: boolean }> {
  try {
    const result = await this.foodItemRepository.updateFoodItem(oldItemName, updatedFoodItem);
    return { success: result.success, message: result.message };
  } catch (error) {
    console.error("Error updating food item:", error);
    return { success: false, message: `Failed to update food item: ${error}` };
  }
}

async viewAllFoodItems(): Promise<IMenuItem[]| null>{
  return await this.foodItemRepository.getAllFoodItems();
}

async checkRolledOutMenu(): Promise<boolean> {
  return await this.foodItemRepository.checkRolledOutMenu();
}

async addRolledOutItems(selectedIds: number[]): Promise<{ message: string }> {
return await this.foodItemRepository.addRolledOutItems(selectedIds);
}

async getRolledOutItems(): Promise<IRolledOutmenu[]>  {
  return await this.foodItemRepository.getRolledOutItems();
  }

async voteForRolledOutItems(votedIds: number[]) : Promise<{ message: string }>{
  return await this.foodItemRepository.addVoteForRolledOutItems(votedIds);
}

async addFinalFoodItem(items:IRolledOutmenu[]) :Promise<{ message: string, success: boolean }> {
  return  await this.foodItemRepository.addFinalFoodItem(items);
}

async getFinalFoodItem():Promise<IFinalMenu[]>{
  return await this.foodItemRepository.getFinalFoodItem();
}

}




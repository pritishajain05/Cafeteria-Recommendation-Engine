import { IFoodCategory } from "../interface/IFoodCategory";
import { IFoodItem, IFoodItemPreference, IMenuItem } from "../interface/IFoodItem";

import { FoodItemRepository } from "../repository/FoodItemRepository";

export class FoodItemService {
  private foodItemRepository = new FoodItemRepository();

  async getAllCategories(): Promise<IFoodCategory[] | null> {
    return await this.foodItemRepository.getAllCategories();
  }

  async checkFoodItemExistence(name: string): Promise<boolean> {
    return await this.foodItemRepository.checkFoodItemExistence(name);
  }

  async addFoodItem(
    item: IFoodItem,
    foodItemPreference: IFoodItemPreference
  ): Promise<{ message: string; success: boolean }> {
    const exists = await this.foodItemRepository.checkFoodItemExistence(
      item.name
    );
    if (exists) {
      return {
        message: "Food Item already Exists! Try to Add another Food Item",
        success: false,
      };
    }
    const foodItemId = await this.foodItemRepository.addFoodItem(item);
    foodItemPreference.foodItemId = foodItemId;
    const result = await this.foodItemRepository.addFoodItemPreference(
      foodItemPreference
    );

    return { success: result.success, message: result.message };
  }

  async deleteFoodItem(
    itemName: string
  ): Promise<{ message: string; success: boolean }> {
    const exists = await this.foodItemRepository.checkFoodItemExistence(
      itemName
    );
    if (!exists) {
      return { success: false, message: "Food item not found." };
    }
    const result = await this.foodItemRepository.deleteFoodItem(itemName);
    return { success: result.success, message: result.message };
  }

  async updateFoodItem(
    oldItemName: string,
    newFoodItem: IFoodItem,
    newFoodItemPreference: IFoodItemPreference
  ): Promise<{ message: string; success: boolean }> {
    const foodItemId = await this.foodItemRepository.updateFoodItem(
      oldItemName,
      newFoodItem
    );
    const result = await this.foodItemRepository.updateFoodItemPreference(
      foodItemId,
      newFoodItemPreference
    );
    return { success: result.success, message: result.message };
  }

  async getAllFoodItem(): Promise<IMenuItem[]> {
    return await this.foodItemRepository.getAllFoodItem();
  }

  async getAllFoodItemPreferences(): Promise<IFoodItemPreference[]> {
    return await this.foodItemRepository.getAllFoodItemPreferences();
  }
}

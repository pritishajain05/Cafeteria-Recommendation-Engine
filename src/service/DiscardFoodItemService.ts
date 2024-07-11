import { IDiscardFoodItem } from "../interface/IDiscardFoodItem";
import { DiscardFoodItemRepository } from "../repository/DiscardFoodItemRepository";

export class DiscardFoodItemService {
  private discardFoodItemRepository = new DiscardFoodItemRepository();

  async addDiscardFoodItem(
    discardFoodItems: IDiscardFoodItem[]
  ): Promise<void> {
    try {
      await this.discardFoodItemRepository.addDiscardFoodItem(discardFoodItems);
    } catch (error) {
      throw error;
    }
  }

  async getDiscardFoodItem(): Promise<IDiscardFoodItem[]> {
    try {
      return await this.discardFoodItemRepository.getDiscardFoodItem();
    } catch (error) {
      throw error;
    }
  }

  async checkDiscardFoodItemsGenerated(): Promise<boolean> {
    try {
      return await this.discardFoodItemRepository.checkDiscardFoodItemsGenerated();
    } catch (error) {
      throw error;
    }
  }

  async deleteDiscardFoodItem(itemName: string): Promise<{ message: string; success: boolean }> {
    try {
      return await this.discardFoodItemRepository.deleteDiscardFoodItem(itemName);
    } catch (error) {
      throw error;
    }
  }
}

import { IDiscardFoodItem } from "../interface/IDiscardFoodItem";
import { DiscardFoodItemRepository } from "../repository/DiscardFoodItemRepository";

export class DiscardFoodItemService {
  private discardFoodItemRepository = new DiscardFoodItemRepository();

  async addDiscardFoodItem(
    discardFoodItems: IDiscardFoodItem[]
  ): Promise<void> {
    await this.discardFoodItemRepository.addDiscardFoodItem(discardFoodItems);
  }
  async getDiscardFoodItem(): Promise<IDiscardFoodItem[]> {
    return await this.discardFoodItemRepository.getDiscardFoodItem();
  }

  async checkDiscardFoodItemsGenerated() : Promise<boolean> {
    return await this.discardFoodItemRepository.checkDiscardFoodItemsGenerated();
  }
}

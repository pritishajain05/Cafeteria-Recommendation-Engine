import { IFinalFoodItem } from "../interface/IFinalFoodItem";
import { IRolledOutFoodItem } from "../interface/IRolledOutFoodItem";
import { FinalFooditemRepository } from "../repository/FinalFoodItemRepository";

export class FinalFoodItemService {
  private finalFoodItemRepository = new FinalFooditemRepository();

  async addFinalFoodItem(
    items: IRolledOutFoodItem[][]
  ): Promise<{ message: string; success: boolean }> {
    return await this.finalFoodItemRepository.addFinalFoodItem(items);
  }

  async getFinalFoodItem(): Promise<IFinalFoodItem[]> {
    return await this.finalFoodItemRepository.getFinalFoodItem();
  }
}

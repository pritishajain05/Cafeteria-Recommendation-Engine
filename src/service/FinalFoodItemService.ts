import { IFinalFoodItem } from "../interface/IFinalFoodItem";
import { FinalFooditemRepository } from "../repository/FinalFoodItemRepository";

export class FinalFoodItemService {
  private finalFoodItemRepository = new FinalFooditemRepository();

  async addFinalFoodItem(
    selectedIds:number[]
  ): Promise<{ message: string; success: boolean }> {
    return await this.finalFoodItemRepository.addFinalFoodItem(selectedIds);
  }

  async getFinalFoodItem(): Promise<IFinalFoodItem[]> {
    return await this.finalFoodItemRepository.getFinalFoodItem();
  }

  async checkFinalMenu():Promise<boolean> {
    return await this.finalFoodItemRepository.checkFinalMenu();
  }
}

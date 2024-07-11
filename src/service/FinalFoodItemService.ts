import { IFinalFoodItem } from "../interface/IFinalFoodItem";
import { FinalFooditemRepository } from "../repository/FinalFoodItemRepository";

export class FinalFoodItemService {
  private finalFoodItemRepository = new FinalFooditemRepository();

  async addFinalFoodItem(
    selectedIds: number[]
  ): Promise<{ message: string; success: boolean }> {
    try {
      return await this.finalFoodItemRepository.addFinalFoodItem(selectedIds);
    } catch (error) {
      throw error;
    }
  }

  async getFinalFoodItem(): Promise<IFinalFoodItem[]> {
    try {
      return await this.finalFoodItemRepository.getFinalFoodItem();
    } catch (error) {
      throw error;
    }
  }

  async checkFinalMenu(): Promise<boolean> {
    try {
      return await this.finalFoodItemRepository.checkFinalMenu();
    } catch (error) {
      throw error;
    }
  }
}

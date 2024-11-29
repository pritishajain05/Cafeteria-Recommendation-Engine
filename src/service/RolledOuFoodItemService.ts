import { IRolledOutFoodItem } from "../interface/IRolledOutFoodItem";
import { RolledOutFoodItemRepository } from "../repository/RolledOutFoodItemReposiotry";

export class RolledOutFoodItemService {
  private rolledOutFoodItemRepository = new RolledOutFoodItemRepository();

  async checkRolledOutMenu(): Promise<boolean> {
    try {
      return await this.rolledOutFoodItemRepository.checkRolledOutMenu();
    } catch (error) {
      throw error;
    }
  }

  async addRolledOutItem(selectedIds: number[]): Promise<{ message: string }> {
    try {
      return await this.rolledOutFoodItemRepository.addRolledOutItem(selectedIds);
    } catch (error) {
      throw error;
    }
  }

  async getRolledOutItem(): Promise<IRolledOutFoodItem[]> {
    try {
      return await this.rolledOutFoodItemRepository.getRolledOutItem();
    } catch (error) {
      throw error;
    }
  }

  async voteForRolledOutItem(votedIds: number[]): Promise<{ message: string }> {
    try {
      return await this.rolledOutFoodItemRepository.addVoteForRolledOutItem(votedIds);
    } catch (error) {
      throw error;
    }
  }
}

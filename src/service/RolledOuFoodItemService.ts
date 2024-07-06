import { IRolledOutFoodItem } from "../interface/IRolledOutFoodItem";
import { RolledOutFoodItemRepository } from "../repository/RolledOutFoodItemReposiotry";

export class RolledOutFoodItemService {
  private rolledOutFoodItemRepository = new RolledOutFoodItemRepository();

  async checkRolledOutMenu(): Promise<boolean> {
    return await this.rolledOutFoodItemRepository.checkRolledOutMenu();
  }

  async addRolledOutItem(selectedIds: number[]): Promise<{ message: string }> {
    return await this.rolledOutFoodItemRepository.addRolledOutItem(
      selectedIds
    );
  }

  async getRolledOutItem(): Promise<IRolledOutFoodItem[]> {
    return await this.rolledOutFoodItemRepository.getRolledOutItem();
  }

  async voteForRolledOutItem(
    votedIds: number[]
  ): Promise<{ message: string }> {
    return await this.rolledOutFoodItemRepository.addVoteForRolledOutItem(
      votedIds
    );
  }
}

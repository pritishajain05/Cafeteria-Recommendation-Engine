import { RowDataPacket } from "mysql2";
import { pool } from "../db";
import {
  ADD_DISCARD_FOOD_ITEM,
  CHECK_DISCARD_FOOD_ITEMS_GENERATED,
  DELETE_DISCARD_FOOD_ITEM,
  GET_DISCARD_FOODITEM_BY_DATE,
} from "../utils/constant";
import { IDiscardFoodItem } from "../interface/IDiscardFoodItem";

export class DiscardFoodItemRepository {
  private currentDate: string;

  constructor() {
    this.currentDate = new Date().toISOString().split("T")[0];
  }

  async addDiscardFoodItem(
    discardFoodItems: IDiscardFoodItem[]
  ): Promise<void> {
    try {
      await Promise.all(
        discardFoodItems.map(async (item) => {
          await pool.execute<RowDataPacket[]>(ADD_DISCARD_FOOD_ITEM, [
            item.foodItemId,
            item.foodItemName,
            item.averageRating,
            item.averageSentiment,
            this.currentDate,
          ]);
        })
      );
    } catch (error) {
      throw error;
    }
  }

  async getDiscardFoodItem(): Promise<IDiscardFoodItem[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(GET_DISCARD_FOODITEM_BY_DATE);
      return rows as IDiscardFoodItem[];
    } catch (error) {
      throw error;
    }
  }

  async checkDiscardFoodItemsGenerated(): Promise<boolean> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(CHECK_DISCARD_FOOD_ITEMS_GENERATED);
      return rows[0].count > 0;
    } catch (error) {
      throw error;
    }
  }

  async deleteDiscardFoodItem(itemName: string): Promise<{ message: string; success: boolean }> {
    try {
      await pool.execute<RowDataPacket[]>(DELETE_DISCARD_FOOD_ITEM, [itemName]);
      return {message:"Deleted discard Food item successfully" , success:true}
    } catch (error) {
      throw error;
    }
  }
}

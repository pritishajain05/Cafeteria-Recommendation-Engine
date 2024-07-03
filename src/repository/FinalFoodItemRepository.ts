import { RowDataPacket } from "mysql2";
import { pool } from "../db";
import { ADD_FINAL_FOOD_ITEM, GET_FINAL_FOOD_ITEM } from "../utils/constant";
import { IRolledOutFoodItem } from "../interface/IRolledOutFoodItem";
import { IFinalFoodItem } from "../interface/IFinalFoodItem";

export class FinalFooditemRepository {
  private currentDate: string;

  constructor() {
    this.currentDate = new Date().toISOString().split("T")[0];
  }

  async addFinalFoodItem(
    items: IRolledOutFoodItem[][]
  ): Promise<{ message: string; success: boolean }> {
    try {
      const promises = items.map(async (itemArray) => {
        await Promise.all(
          itemArray.map(async (item) => {
            await pool.execute<RowDataPacket[]>(ADD_FINAL_FOOD_ITEM, [item.id, this.currentDate]);
          })
        );
      });
  
      await Promise.all(promises);
  
      return { message: "Finalized items stored successfully.", success: true };
    } catch (error) {
      console.error("Error in adding final food items:", error);
      throw error;
    }
  }

  async getFinalFoodItem(): Promise<IFinalFoodItem[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(GET_FINAL_FOOD_ITEM, [
        this.currentDate,
      ]);

      return rows as IFinalFoodItem[];
    } catch (error) {
      console.error("Error fetching finalized menu:", error);
      throw error;
    }
  }

}

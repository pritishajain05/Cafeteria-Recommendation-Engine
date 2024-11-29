import { RowDataPacket } from "mysql2";
import { pool } from "../db";
import { ADD_FINAL_FOOD_ITEM, CHECK_FINAL_MENU_EXISTENCE, GET_FINAL_FOOD_ITEM } from "../utils/constant";
import { IRolledOutFoodItem } from "../interface/IRolledOutFoodItem";
import { IFinalFoodItem } from "../interface/IFinalFoodItem";

export class FinalFooditemRepository {
  private currentDate: string;

  constructor() {
    this.currentDate = new Date().toISOString().split("T")[0];
  }

  async addFinalFoodItem(
    selectedIds:number[]
  ): Promise<{ message: string; success: boolean }> {
    try {
      await Promise.all(selectedIds.map(async (id) => {
            await pool.execute<RowDataPacket[]>(ADD_FINAL_FOOD_ITEM, [id, this.currentDate]);
          })
        );
      return { message: "Finalized items stored successfully.", success: true };
    } catch (error) {
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
      throw error;
    }
  }

  async checkFinalMenu(): Promise<boolean> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(CHECK_FINAL_MENU_EXISTENCE, [
        this.currentDate,
      ]);
      const count = (rows as any)[0].count;
      return count > 0;
    } catch (error) {
      throw error;
    }
  }

}

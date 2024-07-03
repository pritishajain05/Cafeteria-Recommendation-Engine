import { RowDataPacket } from "mysql2";
import { pool } from "../db";
import {
  ADD_ROLLED_OUT_ITEMS,
  ADD_VOTE_FOR_ROLLED_OUT_ITEMS,
  CHECK_ROLLED_OUT_MENU_EXISTENCE,
  GET_ROLLED_OUT_ITEMS,
} from "../utils/constant";
import { IRolledOutFoodItem } from "../interface/IRolledOutFoodItem";

export class RolledOutFoodItemRepository {
  private currentDate: string;

  constructor() {
    this.currentDate = new Date().toISOString().split("T")[0];
  }

  async addRolledOutItem(selectedIds: number[]): Promise<{ message: string }> {
    try {
      await Promise.all(
        selectedIds.map(async (id) => {
          await pool.execute<RowDataPacket[]>(ADD_ROLLED_OUT_ITEMS, [id, this.currentDate]);
        })
      );
      return { message: "Selected items successfully rolled out." };
    } catch (error) {
      console.error("Error adding rolled out items:", error);
      throw error;
    }
  }

  async getRolledOutItem(): Promise<IRolledOutFoodItem[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(GET_ROLLED_OUT_ITEMS, [this.currentDate]);

      return rows as IRolledOutFoodItem[];
    } catch (error) {
      console.error("Error fetching recommended food items:", error);
      throw error;
    }
  }

  async checkRolledOutMenu(): Promise<boolean> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(CHECK_ROLLED_OUT_MENU_EXISTENCE, [
        this.currentDate,
      ]);
      const count = (rows as any)[0].count;
      return count > 0;
    } catch (error) {
      console.error("Error checking rolled out menu existence:", error);
      throw error;
    }
  }

  async addVoteForRolledOutItem(
    votedIds: number[]
  ): Promise<{ message: string }> {
    try {
      await Promise.all(
        votedIds.map(async (id) => {
          await pool.execute<RowDataPacket[]>(ADD_VOTE_FOR_ROLLED_OUT_ITEMS, [
            id,
            this.currentDate,
          ]);
        })
      );
      return { message: "Voted Successfully" };
    } catch (error) {
      console.error("Error in voting:", error);
      throw error;
    }
  }
}

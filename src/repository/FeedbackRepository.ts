import { pool } from "../db";
import { IFeedback } from "../interface/IFeedback";
import { RowDataPacket } from "mysql2";

export class FeedbackRepository {

    private currentDate: string;

    constructor() {
      this.currentDate = new Date().toISOString().split('T')[0]; 
    }

  async getAllFeedback(): Promise<IFeedback[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT * FROM feedback"
      );
      return rows as IFeedback[];
    } catch (error) {
      console.error("Error fetching all feedbacks:", error);
      throw error;
    }
  }

  async getFeedbackByFoodItemId(id: number): Promise<IFeedback[]> {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
          "SELECT * FROM feedback WHERE foodItemId = ?", [id]
        );
        return rows as IFeedback[];
      } catch (error) {
        console.error("Error fetching feedback by food item ID:", error);
        throw error;
      }
  }

  async hasFeedbackForToday(data:IFeedback): Promise<boolean> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT * FROM feedback WHERE employeeId = ? AND foodItemId = ? AND date= ?",
        [data.employeeId, data.foodItemId, this.currentDate]
      );
      return rows.length > 0;
    } catch (error) {
      console.error("Error checking feedback existence for today:", error);
      throw error;
    }
  }

  async findRolloutFoodItemId(foodItemId: number): Promise<number | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT id FROM rolloutFoodItem WHERE foodItemId = ? AND DATE(rolloutDate) = DATE(?)",
        [foodItemId, this.currentDate]
      );
      if (rows.length > 0) {
        return rows[0].id;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error finding rollout food item ID:", error);
      throw error;
    }
  }

  async isItemInFinalMenu(data:IFeedback): Promise<boolean> {
    try {
      const rolloutFoodItemId = await this.findRolloutFoodItemId(data.foodItemId);
      if (rolloutFoodItemId === null) {
        return false; 
      }

      const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT * FROM finalFoodItem WHERE rolloutFoodItemId = ? AND date = ? ",
        [rolloutFoodItemId, this.currentDate]
      );
      return rows.length > 0;
    } catch (error) {
      console.error("Error checking if item is in final menu:", error);
      throw error;
    }
  }

  async addFeedbackOnItem ( data:IFeedback) : Promise<{ message: string, success: boolean }>{
    try {
        await pool.execute(`
            INSERT INTO feedback (employeeId, foodItemId, rating, comment, date)
            VALUES (?, ?, ?, ?, ?)
          `, [data.employeeId, data.foodItemId, data.rating, data.comment, this.currentDate]);

          return { message: "Feedback added successfully!",success:true };
    } catch (error) {
        console.error("Error adding the feedback", error);
        throw error;
    }
  }
}

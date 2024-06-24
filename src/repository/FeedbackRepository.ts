import { pool } from "../db";
import { IFeedback } from "../interface/IFeedback";
import { RowDataPacket } from "mysql2";

export class FeedbackRepository {
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
}

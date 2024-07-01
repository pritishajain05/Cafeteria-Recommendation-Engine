import { pool } from "../db";
import { IDetailedFeedbackAnswer, IDetailedFeedbackQuestion, IFeedback } from "../interface/IFeedback";
import { RowDataPacket } from "mysql2";
import {
  ADD_DETAILED_FEEDBACK_QUESTION,
  ADD_FEEDBACK_ON_ITEM,
  CHECK_FEEDBACK_FOR_TODAY,
  GET_ALL_DETAILED_FEEDBACK_QUESTIONS,
  GET_ALL_FEEDBACK,
  GET_EMPLOYEE_FEEDBACK_ANSWERS,
  GET_FEEDBACK_BY_FOODITEM_ID,
  STORE_FEEDBACK_ANSWERS,
} from "../utils/constant";

export class FeedbackRepository {
  private currentDate: string;

  constructor() {
    this.currentDate = new Date().toISOString().split('T')[0];
  }

  async getAllFeedback(): Promise<IFeedback[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(GET_ALL_FEEDBACK);
      return rows as IFeedback[];
    } catch (error) {
      console.error("Error fetching all feedbacks:", error);
      throw error;
    }
  }

  async getFeedbackByFoodItemId(id: number): Promise<IFeedback[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        GET_FEEDBACK_BY_FOODITEM_ID,
        [id]
      );
      return rows as IFeedback[];
    } catch (error) {
      console.error("Error fetching feedback by food item ID:", error);
      throw error;
    }
  }

  async hasFeedbackForToday(data: IFeedback): Promise<boolean> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        CHECK_FEEDBACK_FOR_TODAY,
        [data.employeeId, data.foodItemId, this.currentDate]
      );
      return rows.length > 0;
    } catch (error) {
      console.error("Error checking feedback existence for today:", error);
      throw error;
    }
  }

  async addFeedbackOnItem(data: IFeedback): Promise<{ message: string, success: boolean }> {
    try {
      await pool.execute(ADD_FEEDBACK_ON_ITEM, [
        data.employeeId,
        data.foodItemId,
        data.rating,
        data.comment,
        this.currentDate
      ]);
      return { message: "Feedback added successfully!", success: true };
    } catch (error) {
      console.error("Error adding the feedback:", error);
      throw error;
    }
  }

  async storeDetailedFeedbackQuestions(itemName: string, questions: string[]): Promise<{ message: string, success: boolean }> {
    try {
      await Promise.all(
        questions.map(async (question) => {
          await pool.execute(ADD_DETAILED_FEEDBACK_QUESTION, [itemName, question, this.currentDate]);
        })
      );

      return { success: true, message: `Questions stored successfully for ${itemName}.` };
    } catch (error) {
      console.error(`Failed to store questions: ${error}`);
      throw error;
    }
  }

  async getFeedbackQuestions(): Promise<IDetailedFeedbackQuestion[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(GET_ALL_DETAILED_FEEDBACK_QUESTIONS);
      return rows as IDetailedFeedbackQuestion[];
    } catch (error) {
      console.error("Error fetching feedback questions:", error);
      throw error;
    }
  }

  async getEmployeeFeedbackAnswers(employeeId: number): Promise<IDetailedFeedbackAnswer[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(GET_EMPLOYEE_FEEDBACK_ANSWERS, [employeeId]);
      return rows as IDetailedFeedbackAnswer[];
    } catch (error) {
      console.error("Error fetching employee feedback answers:", error);
      throw error;
    }
  }

  async storeFeedbackAnswers(answers: IDetailedFeedbackAnswer[]): Promise<void> {
    try {
      const query = STORE_FEEDBACK_ANSWERS;
      const values = answers.map(answer => [answer.questionId, answer.employeeId, answer.answer, this.currentDate]);
      await pool.query(query, [values]);
    } catch (error) {
      console.error("Error storing feedback answers:", error);
      throw error;
    }
  }
}

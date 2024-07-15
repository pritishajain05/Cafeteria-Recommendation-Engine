import { pool } from "../db";
import { IDetailedFeedbackAnswer, IDetailedFeedbackQuestion, IFeedback } from "../interface/IFeedback";
import { RowDataPacket } from "mysql2";
import {
  ADD_DETAILED_FEEDBACK_QUESTION,
  ADD_FEEDBACK_ON_ITEM,
  CHECK_EXISTING_QUESTIONS,
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
      throw error;
    }
  }

  async hasFeedbackForToday(employeeId :number , foodItemId: number): Promise<boolean> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        CHECK_FEEDBACK_FOR_TODAY,
        [employeeId, foodItemId, this.currentDate]
      );
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  async addFeedbackOnItem(employeeId:number, foodItemId: number, rating: number, comment:string ): Promise<{ message: string, success: boolean }> {
    try {
      await pool.execute<RowDataPacket[]>(ADD_FEEDBACK_ON_ITEM, [
        employeeId,
        foodItemId,
        rating,
        comment,
        this.currentDate
      ]);
      return { message: "Feedback added successfully!", success: true };
    } catch (error) {
      throw error;
    }
  }

  async checkExistingQuestions(discardFoodItemId: number): Promise<number> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(CHECK_EXISTING_QUESTIONS, [discardFoodItemId]);
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  async addDetailedFeedbackQuestions(itemName: string, questions: string[] , discardFoodItemId:number): Promise<{ message: string, success: boolean }> {
    try {
      await Promise.all(
        questions.map(async (question) => {
          await pool.execute<RowDataPacket[]>(ADD_DETAILED_FEEDBACK_QUESTION, [itemName, question, this.currentDate , discardFoodItemId]);
        })
      );

      return { success: true, message: `Questions stored successfully for ${itemName}.` };
    } catch (error) {
      throw error;
    }
  }

  async getFeedbackQuestions(): Promise<IDetailedFeedbackQuestion[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(GET_ALL_DETAILED_FEEDBACK_QUESTIONS);
      return rows as IDetailedFeedbackQuestion[];
    } catch (error) {
      throw error;
    }
  }

  async getFeedbackAnswersByEmployeeId(employeeId: number): Promise<IDetailedFeedbackAnswer[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(GET_EMPLOYEE_FEEDBACK_ANSWERS, [employeeId]);
      return rows as IDetailedFeedbackAnswer[];
    } catch (error) {
      throw error;
    }
  }

  async addFeedbackAnswers(answers: IDetailedFeedbackAnswer[]): Promise<void> {
    try {
      await Promise.all(
      answers.map(async (answer) => 
        await pool.execute<RowDataPacket[]>(STORE_FEEDBACK_ANSWERS, [answer.questionId, answer.employeeId, answer.answer, this.currentDate])
      )
    )
      
    } catch (error) {
      throw error;
    }
  }
}

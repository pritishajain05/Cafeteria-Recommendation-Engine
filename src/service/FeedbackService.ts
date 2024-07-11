import {
  IDetailedFeedbackAnswer,
  IDetailedFeedbackQuestion,
  IFeedback,
} from "../interface/IFeedback";
import { FeedbackRepository } from "../repository/FeedbackRepository";

export class FeedbackService {
  private feedbackRepository = new FeedbackRepository();

  async getAllFeedback(): Promise<IFeedback[]> {
    try {
      return await this.feedbackRepository.getAllFeedback();
    } catch (error) {
      throw error;
    }
  }

  async getFeedbackByFoodItemId(id: number): Promise<IFeedback[]> {
    try {
      return await this.feedbackRepository.getFeedbackByFoodItemId(id);
    } catch (error) {
      throw error;
    }
  }

  async addFeedbackOnItem( employeeId:number, foodItemId: number, rating: number, comment:string ): Promise<{ message: string; success: boolean }> {
    try {
      const hasFeedbackForToday =
        await this.feedbackRepository.hasFeedbackForToday(employeeId,foodItemId);
      if (hasFeedbackForToday) {
        return {
          message: "You have already given feedback on this item today!",
          success: false,
        };
      }
      return await this.feedbackRepository.addFeedbackOnItem(employeeId,foodItemId,rating,comment);
    } catch (error) {
      throw error;
    }
  }

  async storeDetailedFeedbackQuestions(
    itemName: string,
    questions: string[],
    discardFoodItemId: number
  ): Promise<{ message: string; success: boolean }> {
    try {
      return await this.feedbackRepository.storeDetailedFeedbackQuestions(
        itemName,
        questions,
        discardFoodItemId
      );
    } catch (error) {
      throw error;
    }
  }

  async getFeedbackQuestions(): Promise<IDetailedFeedbackQuestion[]> {
    try {
      return await this.feedbackRepository.getFeedbackQuestions();
    } catch (error) {
      throw error;
    }
  }

  async getEmployeeFeedbackAnswers(
    employeeId: number
  ): Promise<IDetailedFeedbackAnswer[]> {
    try {
      return await this.feedbackRepository.getEmployeeFeedbackAnswers(
        employeeId
      );
    } catch (error) {
      throw error;
    }
  }

  async storeFeedbackAnswers(
    answers: IDetailedFeedbackAnswer[]
  ): Promise<void> {
    try {
      return await this.feedbackRepository.storeFeedbackAnswers(answers);
    } catch (error) {
      throw error;
    }
  }
}

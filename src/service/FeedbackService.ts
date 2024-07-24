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
      const hasFeedbackForToday =await this.feedbackRepository.hasFeedbackForToday(employeeId,foodItemId);
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

  async addDetailedFeedbackQuestions(
    itemName: string,
    questions: string[],
    discardFoodItemId: number
  ): Promise<{ message: string; success: boolean }> {
    try {

      const isExistingQuestions = await this.feedbackRepository.checkExistingQuestions(discardFoodItemId);

      if (isExistingQuestions > 0) {
        return { message: `Questions for discard food item ID ${discardFoodItemId} already exist.` , success: false};
      }
      
      return await this.feedbackRepository.addDetailedFeedbackQuestions(
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
      return await this.feedbackRepository.getFeedbackAnswersByEmployeeId(
        employeeId
      );
    } catch (error) {
      throw error;
    }
  }

  async addFeedbackAnswers(
    answers: IDetailedFeedbackAnswer[]
  ): Promise<void> {
    try {
      return await this.feedbackRepository.addFeedbackAnswers(answers);
    } catch (error) {
      throw error;
    }
  }
}

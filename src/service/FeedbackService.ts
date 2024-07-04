import {
  IDetailedFeedbackAnswer,
  IDetailedFeedbackQuestion,
  IFeedback,
} from "../interface/IFeedback";
import { FeedbackRepository } from "../repository/FeedbackRepository";
import { FoodItemRepository } from "./../repository/FoodItemRepository";

export class FeedbackService {
  private feedbackRepository = new FeedbackRepository();
 
  async getAllFeedback(): Promise<IFeedback[]> {
    return await this.feedbackRepository.getAllFeedback();
  }

  async getFeedbackByFoodItemId(id: number): Promise<IFeedback[]> {
    return await this.feedbackRepository.getFeedbackByFoodItemId(id);
  }


  async addFeedbackOnItem(
    data: IFeedback
  ): Promise<{ message: string; success: boolean }> {
    const hasFeedbackForToday =
      await this.feedbackRepository.hasFeedbackForToday(data);
    if (hasFeedbackForToday) {
      return {
        message: "You have already given feedback on this item today!",
        success: false,
      };
    }
    return await this.feedbackRepository.addFeedbackOnItem(data);
  }

  async storeDetailedFeedbackQuestions(
    itemName: string,
    questions: string[],
    discardFoodItemId:number
  ): Promise<{ message: string; success: boolean }> {
    return await this.feedbackRepository.storeDetailedFeedbackQuestions(
      itemName,
      questions,
      discardFoodItemId
    );
  }

  async getFeedbackQuestions(): Promise<IDetailedFeedbackQuestion[]> {
    return await this.feedbackRepository.getFeedbackQuestions();
  }

  async getEmployeeFeedbackAnswers(
    employeeId: number
  ): Promise<IDetailedFeedbackAnswer[]> {
    return await this.feedbackRepository.getEmployeeFeedbackAnswers(employeeId);
  }

  async storeFeedbackAnswers(
    answers: IDetailedFeedbackAnswer[]
  ): Promise<void> {
    return await this.feedbackRepository.storeFeedbackAnswers(answers);
  }
}

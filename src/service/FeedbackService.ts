import { IFeedback } from "../interface/IFeedback";
import { FeedbackRepository } from "../repository/FeedbackRepository";

export class FeedbackService {
  private feedbackRepository = new FeedbackRepository();

  async getFeedbackByFoodItemId(id: number): Promise<IFeedback[]> {
    return await this.feedbackRepository.getFeedbackByFoodItemId(id);
  }

  async addFeedbackOnItem(data:IFeedback) : Promise<{ message: string, success: boolean }> {
    const hasFeedbackForToday = await this.feedbackRepository.hasFeedbackForToday(data);
    if (hasFeedbackForToday) {
      return { message: "You have already given feedback on this item today!", success: false };
    }

    const isItemInFinalMenu = await this.feedbackRepository.isItemInFinalMenu(data);
    if (!isItemInFinalMenu ) {
        return { message: "Please give the feedback only for the item eaten today !", success: false };
      }

    return await this.feedbackRepository.addFeedbackOnItem(data);
  }
}

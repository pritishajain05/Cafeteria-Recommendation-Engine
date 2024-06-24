import { IFeedback } from "../interface/IFeedback";
import { FeedbackRepository } from "../repository/FeedbackRepository";

export class FeedbackService {
  private feedbackRepository = new FeedbackRepository();

  async getFeedbackByFoodItemId(id: number): Promise<IFeedback[]> {
    return await this.feedbackRepository.getFeedbackByFoodItemId(id);
  }
}

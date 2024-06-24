import { positiveWords, negativeWords } from '../utils/constant';
import { FoodItemRepository } from '../repository/FoodItemRepository';
import { FeedbackRepository } from '../repository/FeedbackRepository';
import { IFeedback } from '../interface/IFeedback';
import { IMenuItem } from '../interface/IFoodItem';

export class RecommendationService {

  private foodItemRepository = new FoodItemRepository();
  private feedbackRepository = new FeedbackRepository();

  async getTopItemsForMealType(mealType: string, topN: number): Promise<IMenuItem[]> {
    try {
      const foodItems: IMenuItem[] = await this.foodItemRepository.getAllFoodItems(); 
      const feedbacks: IFeedback[] = await this.feedbackRepository.getAllFeedback(); 

      const feedbackMap: Map<number, { totalRating: number; totalSentiment: number; count: number }> = new Map();

      feedbacks.forEach(feedback => {
        const sentimentScore = this.analyzeSentiment(feedback.comment);
        const item = feedbackMap.get(feedback.foodItemId) || { totalRating: 0, totalSentiment: 0, count: 0 };
        item.totalRating += feedback.rating;
        item.totalSentiment += sentimentScore;
        item.count += 1;
        feedbackMap.set(feedback.foodItemId, item);
      });

      const filteredItems = foodItems.filter(item => item.mealType.includes(mealType) && item.availabilityStatus);

      const scoredItems = filteredItems.map(item => {
        const feedback = feedbackMap.get(item.id) || { totalRating: 0, totalSentiment: 0, count: 0 };
        const averageRating = feedback.count ? feedback.totalRating / feedback.count : 0;
        const averageSentiment = feedback.count ? feedback.totalSentiment / feedback.count : 0;

        const rankingScore = this.calculateScore(averageRating, averageSentiment);

        return {
          ...item,
          rankingScore:parseFloat(rankingScore.toFixed(2)),
        };
      });

      scoredItems.sort((a, b) => b.rankingScore - a.rankingScore);
      return scoredItems.slice(0, topN);
    } catch (error) {
      console.error(`Error getting top items for ${mealType}:`, error);
      throw error;
    }
  }

  analyzeSentiment(comment: string): number {
    let sentimentScore = 0;
    let wordCount = 0;

    const words = comment.toLowerCase().split(/\W+/);

    words.forEach(word => {
      if (positiveWords.includes(word)) {
        sentimentScore += 1;
      } else if (negativeWords.includes(word)) {
        sentimentScore -= 1;
      }
      wordCount++;
    });

    const normalizedSentimentScore = wordCount ? sentimentScore / wordCount : 0;
    return normalizedSentimentScore;
  }

  calculateScore(averageRating: number, averageSentiment: number): number {
    const weightAverageRating = 0.5;
    const weightSentiment = 0.5;

    return (weightAverageRating * averageRating) + (weightSentiment * averageSentiment);
  }

  async recommendationEngine(): Promise<{ topBreakfastItems: IMenuItem[], topLunchItems: IMenuItem[], topDinnerItems: IMenuItem[] }> {
    try {
      const topBreakfastItems = await this.getTopItemsForMealType("Breakfast", 2);
      const topLunchItems = await this.getTopItemsForMealType("Lunch", 2);
      const topDinnerItems = await this.getTopItemsForMealType("Dinner", 2);

      return {topBreakfastItems , topLunchItems , topDinnerItems}

    } catch (error) {
      console.error("Error generating recommendations:", error);
      throw error;
    } 
  }
}



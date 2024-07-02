import { positiveWords, negativeWords, positiveSentences, negativeSentences } from '../utils/constant';
import { FoodItemRepository } from '../repository/FoodItemRepository';
import { FeedbackRepository } from '../repository/FeedbackRepository';
import { IFeedback } from '../interface/IFeedback';
import { IDiscardFoodItem, IMenuItem, IRolledOutmenu } from '../interface/IFoodItem';

export class RecommendationService {

  private foodItemRepository = new FoodItemRepository();
  private feedbackRepository = new FeedbackRepository();
  private foodItems: IMenuItem[] = [];
  private feedbacks: IFeedback[] = [];

  constructor() {
    this.initializeData(); 
  }

  private async initializeData(): Promise<void> {
    try {
      this.foodItems = await this.foodItemRepository.getAllFoodItems();
      this.feedbacks = await this.feedbackRepository.getAllFeedback();
    } catch (error) {
      console.error('Error initializing data:', error);
      throw error;
    }
  }

  async getRolledOutItemsWithFeedback(): Promise<IRolledOutmenu[]> {
    try {
      const feedbackMap = this.calculateFeedbackMap();
      const rolledOutMenu = await this.foodItemRepository.getRolledOutItems();

      return rolledOutMenu.map(item => {
        const feedback = feedbackMap.get(item.foodItemId) || { totalRating: 0, totalSentiment: 0, count: 0, comments: [] };
        const averageRating = feedback.count ? feedback.totalRating / feedback.count : 0;
        const averageSentiment = feedback.count ? feedback.totalSentiment / feedback.count : 0;
        const summary = this.generateCommentSummary(feedback.comments);

        return {
          ...item,
          averageRating: parseFloat(averageRating.toFixed(2)),
          averageSentiment: parseFloat(averageSentiment.toFixed(2)),
          summary: summary
        };
      });

    } catch (error) {
      console.error('Error fetching rolled out menu with feedback:', error);
      throw error;
    }
  }


  async getTopItemsForMealType(mealType: string, topN: number): Promise<IMenuItem[]> {
    try {
      const feedbackMap = this.calculateFeedbackMap();
      const filteredItems = this.foodItems.filter(item => item.mealType.includes(mealType) && item.availabilityStatus);

      const scoredItems = filteredItems.map(item => {
        const feedback = feedbackMap.get(item.id) || { totalRating: 0, totalSentiment: 0, count: 0, comments: [] };
        const averageRating = feedback.count ? feedback.totalRating / feedback.count : 0;
        const averageSentiment = feedback.count ? feedback.totalSentiment / feedback.count : 0;

        const rankingScore = this.calculateScore(averageRating, averageSentiment);

        return {
          ...item,
          rankingScore: parseFloat(rankingScore.toFixed(2)),
        };
      });

      scoredItems.sort((a, b) => b.rankingScore - a.rankingScore);
      return scoredItems.slice(0, topN);
    } catch (error) {
      console.error(`Error getting top items for ${mealType}:`, error);
      throw error;
    }
  }

  private calculateFeedbackMap(): Map<number, { totalRating: number; totalSentiment: number; count: number; comments: string[] }> {
    const feedbackMap: Map<number, { totalRating: number; totalSentiment: number; count: number; comments: string[] }> = new Map();

    this.feedbacks.forEach(feedback => {
      const sentimentScore = this.analyzeSentiment(feedback.comment);
      const item = feedbackMap.get(feedback.foodItemId) || { totalRating: 0, totalSentiment: 0, count: 0, comments: [] };
      item.totalRating += feedback.rating;
      item.totalSentiment += sentimentScore;
      item.count += 1;
      item.comments.push(feedback.comment);
      feedbackMap.set(feedback.foodItemId, item);
    });

    return feedbackMap;
  }

  private analyzeSentiment(comment: string): number {
    let sentimentScore = 0;
    let wordCount = 0;

    const words = comment.toLowerCase().split(/\W+/);
    const sentences = comment.toLowerCase().split(/[.!?]/);

    words.forEach(word => {
      if (positiveWords.includes(word)) {
        sentimentScore += 1;
      } else if (negativeWords.includes(word)) {
        sentimentScore -= 1;
      }
      wordCount++;
    });

    sentences.forEach(sentence => {
      if (positiveSentences.some(positive => sentence.includes(positive))) {
        sentimentScore += 5;
      } else if (negativeSentences.some(negative => sentence.includes(negative))) {
        sentimentScore -= 5;
      }
    });

    const normalizedSentimentScore = wordCount ? sentimentScore / wordCount : 0;
    return normalizedSentimentScore;
  }

  private calculateScore(averageRating: number, averageSentiment: number): number {
    const weightAverageRating = 0.5;
    const weightSentiment = 0.5;
    return (weightAverageRating * averageRating) + (weightSentiment * averageSentiment);
  }

  private generateCommentSummary(comments: string[]): string {
    if (comments.length === 0) {
      return 'No comments on this item';
    }
  
    const positiveComments = comments.filter(comment => this.analyzeSentiment(comment) > 0);
    const negativeComments = comments.filter(comment => this.analyzeSentiment(comment) < 0);
  
    const positiveSummary = positiveComments.length ? positiveComments.slice(0, 3).join(', ') : '';
    const negativeSummary = negativeComments.length ? negativeComments.slice(0, 3).join(', ') : '';
 
    if (!positiveSummary && !negativeSummary) {
      return comments.slice(0, 3).join(', ');
    }
  
    return `${positiveSummary}${positiveSummary && negativeSummary ? ', ' : ''}${negativeSummary}`;
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

  async getDiscardFoodItems(): Promise<void> {
    try {
      const discardFoodItems: IDiscardFoodItem[] = [];

      this.foodItems.forEach(item => {
        const feedback = this.calculateFeedbackMap().get(item.id) || { totalRating: 0, totalSentiment: 0, count: 0, comments: [] };
        const averageRating = feedback.count ? feedback.totalRating / feedback.count : 0;
        const averageSentiment = feedback.count ? feedback.totalSentiment / feedback.count : 0;

        if (averageRating < 2 && averageSentiment < 0) {
          discardFoodItems.push({
            foodItemId: item.id,
            foodItemName: item.name,
            averageRating: parseFloat(averageRating.toFixed(2)),
            averageSentiment: parseFloat(averageSentiment.toFixed(2)),
          });
        }
      });

      console.table(discardFoodItems);
      await this.foodItemRepository.addDiscardFoodItems(discardFoodItems);
    } catch (error) {
      console.error("Error fetching discard food items:", error);
      throw error;
    }
  }
}

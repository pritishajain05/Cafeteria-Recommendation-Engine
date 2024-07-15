import { positiveWords, negativeWords, positiveSentences, negativeSentences } from '../utils/constant';
import { IFeedback } from '../interface/IFeedback';
import { IMenuItem } from '../interface/IFoodItem';
import { DiscardFoodItemService } from './DiscardFoodItemService';
import { FoodItemService } from './FoodItemService';
import { FeedbackService } from './FeedbackService';
import { RolledOutFoodItemService } from './RolledOuFoodItemService';
import { IRolledOutFoodItem } from '../interface/IRolledOutFoodItem';
import { IDiscardFoodItem } from '../interface/IDiscardFoodItem';

export class RecommendationService {

  private foodItemService = new FoodItemService();
  private discardFoodItemService = new DiscardFoodItemService();
  private feedbackService = new FeedbackService();
  private rolledOutFoodItemService = new RolledOutFoodItemService();
  private foodItems: IMenuItem[] = [];
  private feedbacks: IFeedback[] = [];

  constructor() {
    this.initializeData(); 
  }

  private async initializeData(): Promise<void> {
    try {
      this.foodItems = await this.foodItemService.getAllFoodItem();
      this.feedbacks = await this.feedbackService.getAllFeedback();
    } catch (error) {
      throw error;
    }
  }

  async getRolledOutItemsWithFeedback(): Promise<IRolledOutFoodItem[]> {
    try {
      const feedbackMap = this.calculateFeedbackMap();
      const rolledOutMenu = await this.rolledOutFoodItemService.getRolledOutItem();

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
      throw error;
    }
  }


  async getTopItemsForMealType(mealType: string, topN: number): Promise<IMenuItem[]> {
    try {
      const feedbackMap = this.calculateFeedbackMap();
      const filteredItems = this.foodItems.filter(item => item.mealType.includes(mealType) && item.availabilityStatus === 'available');
      
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
      throw error;
    } 
  }

  async getDiscardFoodItem(): Promise<void> {
    try {
      const discardFoodItems: IDiscardFoodItem[] = [];
  
      this.foodItems.forEach(item => {
        if (!item.availabilityStatus) {
          return;
        }
  
        const feedback = this.calculateFeedbackMap().get(item.id) || { totalRating: 0, totalSentiment: 0, count: 0, comments: [] };
        const averageRating = feedback.count ? feedback.totalRating / feedback.count : 0;
        const averageSentiment = feedback.count ? feedback.totalSentiment / feedback.count : 0;
  
        if (averageRating > 0.0 && averageRating < 2.0) {
          discardFoodItems.push({
            foodItemId: item.id,
            foodItemName: item.name,
            averageRating: parseFloat(averageRating.toFixed(2)),
            averageSentiment: parseFloat(averageSentiment.toFixed(2)),
          });
        }
      });
  
      await this.discardFoodItemService.addDiscardFoodItem(discardFoodItems);
    } catch (error) {
      throw error;
    }
  }

}

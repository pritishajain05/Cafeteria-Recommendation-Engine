export interface IDiscardFoodItem {
    id?:number,
    foodItemId: number,
    foodItemName: string,
    averageRating: number,
    averageSentiment: number,
    date?: Date
  }
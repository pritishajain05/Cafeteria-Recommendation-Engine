export interface IFoodItem {
    name: string;
    price: number;
    availabilityStatus: boolean;
    foodCategoryId: number;
}

export interface IMenuItem {
    id:number,
    name: string;
    price: number;
    availabilityStatus: boolean;
    categoryName: string;
    mealTypeNames: string[];
  }

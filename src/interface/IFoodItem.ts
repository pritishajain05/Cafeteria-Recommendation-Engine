export interface IFoodItem {
  name: string;
  price: number;
  availabilityStatus: boolean;
  foodCategoryId: number;
  mealTypeId: number;
}

export interface IMenuItem {
  id: number;
  name: string;
  price: number;
  availabilityStatus: string;
  categoryName: string;
  mealType: string;
}

export interface IRolledOutmenu {
  id: number;
  foodItemId: number;
  foodItemName: string;
  foodItemPrice: number;
  votes: number;
  mealType: string;
}

export interface IFinalMenu{
    foodItemId: number,
    foodItemName: string;
    mealType: string
}
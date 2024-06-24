export interface IFoodItem {
    name: string;
    price: number;
    availabilityStatus: boolean;
    foodCategoryId: number;
    mealTypeId: number;
}


export interface IMenuItem {
    id:number,
    name: string;
    price: number;
    availabilityStatus: string;
    categoryName: string;
    mealType: string;
  }

  

  export interface IRolledOutmenu {
        foodItemId: number;
        foodItemName: string;
        foodItemPrice: number;
        mealType: string;
  }


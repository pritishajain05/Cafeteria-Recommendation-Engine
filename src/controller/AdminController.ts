import { IFoodItem } from "../interfaces/IFoodItem";
import { FoodItemService } from "../service/FoodItemService";

export class AdminController {
    private foodItemService = new FoodItemService();

    async addFoodItem (item:IFoodItem): Promise<{message:string , success: boolean}> {
       return await this.foodItemService.addFoodItem(item);
    }

    async deleteFoodItem (itemName: string): Promise<{message:string , success:boolean}> {
       return await this.foodItemService.deleteFoodItem(itemName);
    }



}

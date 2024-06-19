import { IFoodItem } from "../interfaces/IFoodItem";
import { FoodItemService } from "../services/FoodItemService";
import { addFoodItem } from '../client/AdminActions';

export class AdminController {
    private foodItemService = new FoodItemService();

    async addFoodItem (item:IFoodItem): Promise<{message:string}> {
       return await this.foodItemService.addFoodItem(item);
    }

    // async updateFoodItem (item:IFoodItem): Promise<{message:string}> {
    //     try {
          
            
    //     } catch (error) {
            
    //     }
    // }

    // async deleteFoodItem (item:IFoodItem): Promise<{message:string}> {
    //     try {
          
            
    //     } catch (error) {
            
    //     }
    // }



}

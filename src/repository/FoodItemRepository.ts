import { RowDataPacket } from "mysql2";
import { pool } from "../db";
import { IFoodCategory } from "../interfaces/IFoodCategory";
import { ADD_FOOD_ITEM, ADD_FOOD_ITEM_MEAL_TYPE, CHECK_FOOD_ITEM_EXISTENCE, DELETE_FOOD_ITEM, GET_ALL_FOOD_CATEGORIES, LAST_INSERTED_ID } from "../utils/constant";
import { IFoodItem } from "../interfaces/IFoodItem";
import { MealType } from "../enums/MealType";

export class FoodItemRepository {
  async getAllCategories(): Promise<IFoodCategory[] | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(GET_ALL_FOOD_CATEGORIES);

      if (rows.length > 0) {
        const categories: IFoodCategory[] = rows.map((row) => ({
          id: row.id,
          name: row.name,
        }));
        return categories;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      return null;
    }
  }

  async addFoodItem(item: IFoodItem): Promise<number> {
    try {
      await pool.execute<RowDataPacket[]>(ADD_FOOD_ITEM, [
        item.name,
        item.price,
        item.availabilityStatus,
        item.foodCategoryId,
      ]);
      const [result] = await pool.execute<RowDataPacket[]>(LAST_INSERTED_ID);
      const id = result[0].id;
      return id;
    } catch (error) {
      console.error("failed to add new item:", error);
      throw error;
    }
  }

  async addFoodItemMealType( foodItemId: number, mealTypeId: MealType): Promise<void> {
    try {
      await pool.execute(ADD_FOOD_ITEM_MEAL_TYPE, [foodItemId, mealTypeId]);
    } catch (error) {
      console.error("Error inserting food item meal type:", error);
    }
  }

  async deleteFoodItem(itemName: string): Promise<{ message: string , success:boolean}> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>( CHECK_FOOD_ITEM_EXISTENCE,[itemName] );

      if (rows.length === 0) {
        return { message: "Food item not found." ,success: false};
      }

      await pool.execute( DELETE_FOOD_ITEM,[itemName] );

      return { message: "Item deleted successfully.",success:true };
    } catch (error) {
      return { message: `Error in deleting food item: ${error}`,success:false };
    }
  }
}

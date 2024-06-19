import { RowDataPacket } from "mysql2";
import { pool } from "../db";
import { IFoodCategory } from "../interfaces/IFoodCategory";
import {
  ADD_FOOD_ITEM,
  ADD_FOOD_ITEM_MEAL_TYPE,
  GET_ALL_FOOD_CATEGORIES,
} from "../utils/constant";
import { IFoodItem } from "../interfaces/IFoodItem";
import { MealType } from "../enums/MealType";

export class FoodItemRepository {
  async getAllCategories(): Promise<IFoodCategory[] | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        GET_ALL_FOOD_CATEGORIES
      );

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
      const [result] = await pool.execute<RowDataPacket[]>(`select id from foodItem where id=(SELECT LAST_INSERT_ID())`);
      const id = result[0].id
      return id;
      
    } catch (error) {
      console.error("failed to add new item:", error);
      throw error;
    }
  }

  async addFoodItemMealType(
    foodItemId: number,
    mealTypeId: MealType
  ): Promise<void> {
    try {
      await pool.execute(ADD_FOOD_ITEM_MEAL_TYPE, [foodItemId, mealTypeId]);
    } catch (error) {
      console.error("Error inserting food item meal type:", error);
    }
  }
}

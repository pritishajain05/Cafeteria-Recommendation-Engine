import { RowDataPacket } from "mysql2";
import { pool } from "../db";
import { IFoodCategory } from "../interface/IFoodCategory";
import { ADD_FOOD_ITEM, ADD_FOOD_ITEM_MEAL_TYPE, CHECK_FOOD_ITEM_EXISTENCE, DELETE_FOOD_ITEM, GET_ALL_FOOD_CATEGORIES, LAST_INSERTED_ID, UPDATE_FOOD_ITEM } from "../utils/constant";
import { IFoodItem, IMenuItem } from "../interface/IFoodItem";
import { MealType } from "../enum/MealType";

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

  async checkFoodItemExistence(name: string): Promise<boolean> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(CHECK_FOOD_ITEM_EXISTENCE, [name]);
      return rows.length > 0;
    } catch (error) {
      console.error("Error checking food item existence:", error);
      throw error;
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
      await pool.execute( DELETE_FOOD_ITEM,[itemName] );
      return { message: "Item deleted successfully.",success:true };
    } catch (error) {
      return { message: `Error in deleting food item: ${error}`,success:false };
    }
  }

  async updateFoodItem(itemName: string, updatedFoodItem: IFoodItem): Promise<{ message: string, success: boolean }> {
    try {
      await pool.execute(UPDATE_FOOD_ITEM, [
        updatedFoodItem.name,
        updatedFoodItem.price,
        updatedFoodItem.availabilityStatus,
        updatedFoodItem.foodCategoryId,
        itemName 
      ]);
      return { message: "Item updated successfully.", success: true };
    } catch (error) {
      console.error("Error updating food item:", error);
      return { message: `Error in updating food item: ${error}`, success: false };
    }
  }

  async getAllFoodItems(): Promise<IMenuItem[] | null> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT fi.id AS foodItemId, fi.name AS foodItemName, fi.price AS foodItemPrice, fi.availabilityStatus AS availabilityStatus,
               fc.name AS categoryName,
               GROUP_CONCAT(mt.type ORDER BY mt.id SEPARATOR ', ') AS mealTypeNames
        FROM foodItem fi
        JOIN foodCategory fc ON fi.foodCategoryId = fc.id
        LEFT JOIN foodItemMealType fmt ON fi.id = fmt.foodItemId
        LEFT JOIN mealType mt ON fmt.mealTypeId = mt.id
        GROUP BY fi.id
      `);

      if (rows.length === 0) {
        return null; 
      }

      const foodItems: IMenuItem[] = rows.map((row) => ({
        id: row.foodItemId,
        name: row.foodItemName,
        price: row.foodItemPrice,
        availabilityStatus: row.availabilityStatus === 1,
        foodCategoryId: row.foodCategoryId, 
        categoryName: row.categoryName,
        mealTypeNames: row.mealTypeNames ? row.mealTypeNames.split(', ') : [],
      }));

      return foodItems;
    } catch (error) {
      console.error("Error fetching food items with details:", error);
      return null;
    }
  }
}

import { pool } from "../db";
import { RowDataPacket } from "mysql2";
import { IFoodCategory } from "../interface/IFoodCategory";
import {
  ADD_FOOD_ITEM,
  ADD_FOOD_ITEM_PREFERENCE,
  CHECK_FOOD_ITEM_EXISTENCE,
  DELETE_FOOD_ITEM,
  GET_ALL_FOOD_CATEGORIES,
  GET_ALL_FOOD_ITEMS,
  LAST_INSERTED_ID,
  SELECT_ALL_FOOD_ITEM_PREFERENCES,
  UPDATE_FOOD_ITEM,
  UPDATE_FOOD_ITEM_PREFERENCE,
} from "../utils/constant";
import {
  IFoodItem,
  IFoodItemPreference,
  IMenuItem,
} from "../interface/IFoodItem";


export class FoodItemRepository {
  private currentDate: string;

  constructor() {
    this.currentDate = new Date().toISOString().split("T")[0];
  }

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
      throw error;
    }
  }

  async checkFoodItemExistence(name: string): Promise<boolean> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        CHECK_FOOD_ITEM_EXISTENCE,
        [name]
      );
      return rows.length > 0;
    } catch (error) {
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
        item.mealTypeId,
      ]);
      const [rows] = await pool.execute<RowDataPacket[]>(LAST_INSERTED_ID);
      return rows[0].id;
    } catch (error) {
      throw error;
    }
  }

  async addFoodItemPreference (foodItemPreference: IFoodItemPreference): Promise<{ message: string; success: boolean }> {
    try {
      await pool.execute<RowDataPacket[]>(ADD_FOOD_ITEM_PREFERENCE, [
        foodItemPreference.foodItemId,
        foodItemPreference.dietaryPreference,
        foodItemPreference.spiceLevel,
        foodItemPreference.cuisineType,
        foodItemPreference.sweetTooth 
      ]);
      return { message: "Item and preferences added successfully.", success: true };
    } catch (error) {
      throw error;
    }
  };

  async deleteFoodItem(
    itemName: string
  ): Promise<{ message: string; success: boolean }> {
    try {
      await pool.execute<RowDataPacket[]>(DELETE_FOOD_ITEM, [itemName]);
      return { message: "Item deleted successfully.", success: true };
    } catch (error) {
      throw error;
    }
  }

  async updateFoodItem(
    oldItemName: string,
    newFoodItem: IFoodItem
  ): Promise<number> {
    try {
      await pool.execute<RowDataPacket[]>(UPDATE_FOOD_ITEM, [
        newFoodItem.name,
        newFoodItem.price,
        newFoodItem.availabilityStatus,
        newFoodItem.foodCategoryId,
        newFoodItem.mealTypeId,
        oldItemName,
      ]);

      const [rows] = await pool.execute<RowDataPacket[]>("SELECT id FROM foodItem WHERE name = ?",[newFoodItem.name]);
      return rows[0].id;
    } catch (error) {
      throw error;
    }
  }

  async updateFoodItemPreference(
    foodItemId: number,
    newFoodItemPreference: IFoodItemPreference
  ): Promise<{ message: string; success: boolean }> {
    try {
      await pool.execute<RowDataPacket[]>(UPDATE_FOOD_ITEM_PREFERENCE, [
        newFoodItemPreference.dietaryPreference,
        newFoodItemPreference.spiceLevel,
        newFoodItemPreference.cuisineType,
        newFoodItemPreference.sweetTooth,
        foodItemId,
      ]);
      return { message: "Item and preferences updated successfully.", success: true };
    } catch (error) {
      throw error;
    }
  }

  async getAllFoodItem(): Promise<IMenuItem[]> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(GET_ALL_FOOD_ITEMS);

      if (rows.length === 0) {
        return [];
      }

      const foodItems: IMenuItem[] = rows.map((row) => ({
        id: row.foodItemId,
        name: row.foodItemName,
        price: row.foodItemPrice,
        availabilityStatus: row.availabilityStatus
          ? "available"
          : "unavailable",
        categoryName: row.categoryName,
        mealType: row.mealType ? row.mealType : "NULL",
      }));

      return foodItems;
    } catch (error) {
      throw error;
    }
  }

  async getAllFoodItemPreferences(): Promise<IFoodItemPreference[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        SELECT_ALL_FOOD_ITEM_PREFERENCES
      );
      return rows as IFoodItemPreference[];
    } catch (error) {
      throw error;
    }
  }
}

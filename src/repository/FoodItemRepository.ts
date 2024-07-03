import { pool } from "../db";
import { RowDataPacket } from "mysql2";
import { IFoodCategory } from "../interface/IFoodCategory";
import {
  ADD_DISCARD_FOOD_ITEM,
  ADD_FINAL_FOOD_ITEM,
  ADD_FOOD_ITEM,
  ADD_FOOD_ITEM_PREFERENCE,
  ADD_ROLLED_OUT_ITEMS,
  ADD_VOTE_FOR_ROLLED_OUT_ITEMS,
  CHECK_FOOD_ITEM_EXISTENCE,
  CHECK_ROLLED_OUT_MENU_EXISTENCE,
  DELETE_FOOD_ITEM,
  FIND_ROLLED_OUT_FOOD_ITEM_ID,
  GET_ALL_FOOD_CATEGORIES,
  GET_ALL_FOOD_ITEMS,
  GET_DISCARD_FOODITEM_BY_DATE,
  GET_FINAL_FOOD_ITEM,
  GET_ROLLED_OUT_ITEMS,
  IS_ITEM_IN_FINAL_MENU,
  LAST_INSERTED_ID,
  SELECT_ALL_FOOD_ITEM_PREFERENCES,
  UPDATE_FOOD_ITEM,
  UPDATE_FOOD_ITEM_PREFERENCE,
} from "../utils/constant";
import {
  IDiscardFoodItem,
  IFinalMenu,
  IFoodItem,
  IMenuItem,
  IRolledOutmenu,
} from "../interface/IFoodItem";
import { IFeedback } from "../interface/IFeedback";
import { IFoodItemPreference } from "../interface/IUserPreference";

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
      console.error("Error fetching categories:", error);
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
        item.mealTypeId,
      ]);
      const [rows] = await pool.execute<RowDataPacket[]>(LAST_INSERTED_ID);
      return rows[0].id;
    } catch (error) {
      console.error("Error in adding food item:", error);
      throw error;
    }
  }

  async addFoodItemPreference (foodItemPreference: IFoodItemPreference): Promise<{ message: string; success: boolean }> {
    try {
      await pool.execute(ADD_FOOD_ITEM_PREFERENCE, [
        foodItemPreference.foodItemId,
        foodItemPreference.dietaryPreference,
        foodItemPreference.spiceLevel,
        foodItemPreference.cuisineType,
        foodItemPreference.sweetTooth 
      ]);
      return { message: "Item and preferences added successfully.", success: true };
    } catch (error) {
      console.error("Error in adding food item preference:", error);
      throw error;
    }
  };

  async deleteFoodItem(
    itemName: string
  ): Promise<{ message: string; success: boolean }> {
    try {
      await pool.execute(DELETE_FOOD_ITEM, [itemName]);
      return { message: "Item deleted successfully.", success: true };
    } catch (error) {
      console.error("Error in deleting food item:", error);
      throw error;
    }
  }

  async updateFoodItem(
    oldItemName: string,
    newFoodItem: IFoodItem
  ): Promise<number> {
    try {
      await pool.execute(UPDATE_FOOD_ITEM, [
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
      console.error("Error in updating food item:", error);
      throw error;
    }
  }

  async updateFoodItemPreference(
    foodItemId: number,
    newFoodItemPreference: IFoodItemPreference
  ): Promise<{ message: string; success: boolean }> {
    try {
      await pool.execute(UPDATE_FOOD_ITEM_PREFERENCE, [
        newFoodItemPreference.dietaryPreference,
        newFoodItemPreference.spiceLevel,
        newFoodItemPreference.cuisineType,
        newFoodItemPreference.sweetTooth,
        foodItemId,
      ]);
      return { message: "Item and preferences updated successfully.", success: true };
    } catch (error) {
      console.error("Error in updating food item preferences:", error);
      throw error;
    }
  }

  async getAllFoodItems(): Promise<IMenuItem[]> {
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
      console.error("Error fetching food items with details:", error);
      throw error;
    }
  }

  async addRolledOutItems(selectedIds: number[]): Promise<{ message: string }> {
    try {
      await Promise.all(
        selectedIds.map(async (id) => {
          await pool.execute(ADD_ROLLED_OUT_ITEMS, [id, this.currentDate]);
        })
      );
      return { message: "Selected items successfully rolled out." };
    } catch (error) {
      console.error("Error adding rolled out items:", error);
      throw error;
    }
  }

  async getRolledOutItems(): Promise<IRolledOutmenu[]> {
    try {
      const [rows] = await pool.query(GET_ROLLED_OUT_ITEMS, [this.currentDate]);

      return rows as IRolledOutmenu[];
    } catch (error) {
      console.error("Error fetching recommended food items:", error);
      throw error;
    }
  }

  async checkRolledOutMenu(): Promise<boolean> {
    try {
      const [rows] = await pool.execute(CHECK_ROLLED_OUT_MENU_EXISTENCE, [
        this.currentDate,
      ]);
      const count = (rows as any)[0].count;
      return count > 0;
    } catch (error) {
      console.error("Error checking rolled out menu existence:", error);
      throw error;
    }
  }

  async addVoteForRolledOutItems(
    votedIds: number[]
  ): Promise<{ message: string }> {
    try {
      await Promise.all(
        votedIds.map(async (id) => {
          await pool.execute(ADD_VOTE_FOR_ROLLED_OUT_ITEMS, [
            id,
            this.currentDate,
          ]);
        })
      );
      return { message: "Voted Successfully" };
    } catch (error) {
      console.error("Error in voting:", error);
      throw error;
    }
  }

  async addFinalFoodItem(
    items: IRolledOutmenu[]
  ): Promise<{ message: string; success: boolean }> {
    try {
      await Promise.all(
        items.map(async (item) => {
          await pool.execute(ADD_FINAL_FOOD_ITEM, [item.id, this.currentDate]);
        })
      );

      return { message: "Finalized items stored successfully.", success: true };
    } catch (error) {
      console.error("Error in adding final food items:", error);
      throw error;
    }
  }

  async getFinalFoodItem(): Promise<IFinalMenu[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(GET_FINAL_FOOD_ITEM, [
        this.currentDate,
      ]);

      return rows as IFinalMenu[];
    } catch (error) {
      console.error("Error fetching finalized menu:", error);
      throw error;
    }
  }

  async addDiscardFoodItems(
    discardFoodItems: IDiscardFoodItem[]
  ): Promise<void> {
    try {
      await Promise.all(
        discardFoodItems.map(async (item) => {
          await pool.execute(ADD_DISCARD_FOOD_ITEM, [
            item.foodItemId,
            item.foodItemName,
            item.averageRating,
            item.averageSentiment,
            this.currentDate,
          ]);
        })
      );
    } catch (error) {
      console.error("Error adding discard food items:", error);
      throw error;
    }
  }

  async getDiscardFoodItems(): Promise<IDiscardFoodItem[]> {
    try {
      const [rows] = await pool.execute(GET_DISCARD_FOODITEM_BY_DATE, [
        this.currentDate,
      ]);
      return rows as IDiscardFoodItem[];
    } catch (error) {
      console.error("Error adding discard food items:", error);
      throw error;
    }
  }

  async findRolloutFoodItemId(foodItemId: number): Promise<number | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        FIND_ROLLED_OUT_FOOD_ITEM_ID,
        [foodItemId, this.currentDate]
      );
      if (rows.length > 0) {
        return rows[0].id;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error finding rollout food item ID:", error);
      throw error;
    }
  }

  async isItemInFinalMenu(data: IFeedback): Promise<boolean> {
    try {
      const rolloutFoodItemId = await this.findRolloutFoodItemId(
        data.foodItemId
      );
      if (rolloutFoodItemId === null) {
        return false;
      }
      const [rows] = await pool.execute<RowDataPacket[]>(
        IS_ITEM_IN_FINAL_MENU,
        [rolloutFoodItemId, this.currentDate]
      );
      return rows.length > 0;
    } catch (error) {
      console.error("Error checking if item is in final menu:", error);
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
      console.error("Error fetching all food item preferences:", error);
      throw error;
    }
  }
}

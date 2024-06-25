import { RowDataPacket } from "mysql2";
import { pool } from "../db";
import { IFoodCategory } from "../interface/IFoodCategory";
import { ADD_FOOD_ITEM, CHECK_FOOD_ITEM_EXISTENCE, DELETE_FOOD_ITEM, GET_ALL_FOOD_CATEGORIES, LAST_INSERTED_ID, UPDATE_FOOD_ITEM } from "../utils/constant";
import { IFoodItem, IMenuItem, IRolledOutmenu } from "../interface/IFoodItem";

export class FoodItemRepository {

  private currentDate: string;

  constructor() {
    this.currentDate = new Date().toISOString().split('T')[0]; 
  }

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

  async addFoodItem(item: IFoodItem): Promise<{ message: string , success:boolean}> {
    try {
      await pool.execute<RowDataPacket[]>(ADD_FOOD_ITEM, [
        item.name,
        item.price,
        item.availabilityStatus,
        item.foodCategoryId,
        item.mealTypeId
      ]);
      return { message: "Item added successfully.",success:true };
    } catch (error) {
      return { message: `Error in adding food item: ${error}`,success:false };
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

  async updateFoodItem(oldItemName: string, updatedFoodItem: IFoodItem): Promise<{ message: string, success: boolean }> {
    try {
      await pool.execute(UPDATE_FOOD_ITEM, [
        updatedFoodItem.name,
        updatedFoodItem.price,
        updatedFoodItem.availabilityStatus,
        updatedFoodItem.foodCategoryId,
        updatedFoodItem.mealTypeId,
        oldItemName 
      ]);
      return { message: "Item updated successfully.", success: true };
    } catch (error) {
      console.error("Error updating food item:", error);
      return { message: `Error in updating food item: ${error}`, success: false };
    }
  }

  async getAllFoodItems(): Promise<IMenuItem[]> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT fi.id AS foodItemId, fi.name AS foodItemName, fi.price AS foodItemPrice, fi.availabilityStatus AS availabilityStatus,
             fc.name AS categoryName, mt.type AS mealType
      FROM foodItem fi
      JOIN foodCategory fc ON fi.foodCategoryId = fc.id
      LEFT JOIN mealType mt ON fi.mealTypeId = mt.id
      `);

      if (rows.length === 0) {
        return [];
      }

      const foodItems: IMenuItem[] = rows.map((row) => ({
        id: row.foodItemId,
        name: row.foodItemName,
        price: row.foodItemPrice,
        availabilityStatus: row.availabilityStatus ? 'available' : ' unavailable',
        categoryName: row.categoryName,
        mealType: row.mealType ? row.mealType : "NULL"
      }));

      return foodItems;
    } catch (error) {
      console.error("Error fetching food items with details:", error);
      return [];
    }
  };

  async addRolledOutItems(selectedIds: number[]): Promise<{ message: string }> {
    try {
      await Promise.all(selectedIds.map(async (id) => {
        await pool.execute(`INSERT INTO rolloutFoodItem (foodItemId, votes, rolloutDate) VALUES (?, 0,?)`, [id,this.currentDate]);
      }));
      return { message: "Selected items successfully rolled out." };
    } catch (error) {
      console.error("Error adding rolled out items:", error);
      throw error;
    }
  }
 
  

  async getRolledOutItems(): Promise<IRolledOutmenu[]> {
    try {
      const [rows] = await pool.query(`
        SELECT rfi.id AS id , rfi.votes , fi.id AS foodItemId, fi.name AS foodItemName, fi.price AS foodItemPrice,
             mt.type AS mealType
      FROM  rolloutFoodItem  rfi
      JOIN foodItem fi ON rfi.foodItemId = fi.id
      LEFT JOIN mealType mt ON fi.mealTypeId = mt.id
      WHERE DATE(rfi.rolloutDate) = ?
      `,[this.currentDate]);

      return rows as IRolledOutmenu[];
    } catch (error) {
      console.error("Error fetching recommended food items:", error);
      throw error;
    }
  }

  async checkRolledOutMenu(): Promise<boolean> {
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM rolloutFoodItem WHERE rolloutDate=?',[this.currentDate]);
    const count = (rows as any)[0].count;
    return count > 0;
  }

  async addVoteForRolledOutItems(votedIds: number[]): Promise<{ message: string }> {
    try {
      await Promise.all(votedIds.map(async (id) => {
        await pool.execute(`UPDATE rolloutFoodItem SET votes = votes + 1 WHERE foodItemId = ?`, [id]);
      }));
      return { message: "Voted Successfully" };
    } catch (error) {
      console.error("Error in voting:", error);
      throw error;
    }
  }

  async addFinalFoodItem(items:IRolledOutmenu[]) : Promise<{ message: string , success:boolean}> {
    try {
      await Promise.all(items.map(async (item) => {
        await pool.execute(`
          INSERT INTO finalFoodItem (rolloutFoodItemId, date)
          VALUES (?, ?)
        `, [item.id, this.currentDate]);
      }));

      return { message:"Finalized items stored successfully." , success:true}
      
    } catch (error) {
      console.log("Error in adding final food items");
      throw error;
    }

  }
}

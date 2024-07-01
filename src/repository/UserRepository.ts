import { pool } from "../db";
import { IUser } from "../interface/IUser";
import { Role } from "../enum/Role";
import { RowDataPacket } from "mysql2";
import { GET_USER_BY_ID, GET_USER_BY_ROLE, UPDATE_USER_PREFERENCES } from "../utils/constant";
import { IUserPreferences } from "../interface/IUserPreferences";

export class UserRepository {

  async getUserById(id: number , name: string): Promise<IUser | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(GET_USER_BY_ID, [id , name]);

      if (rows.length > 0) {
        const userData = rows[0];
        const user: IUser = {
          employeeId: userData.employeeId,
          name: userData.name,
          role: userData.role as Role,
        };
        return user;
      } else {
        return null;
      }

    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  async getUsersByRole(roleName: string): Promise<number[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(GET_USER_BY_ROLE, [roleName]);
    return rows.map(row => row.employeeId);
  }

  async updateUserPreferences(employeeId: number, preferences: IUserPreferences): Promise<{success:boolean , message:string}> {
    const { dietaryPreference, spiceLevel, cuisinePreference, sweetTooth } = preferences;
    try {
      const [result] = await pool.execute<RowDataPacket[]>(UPDATE_USER_PREFERENCES, [
        employeeId,
        dietaryPreference,
        spiceLevel,
        cuisinePreference,
        sweetTooth
      ]);
      return {success: true, message:"Updated user profile successfully"};
    } catch (error) {
      console.error("Error updating user preferences:", error);
      throw error;
    }
  }
}

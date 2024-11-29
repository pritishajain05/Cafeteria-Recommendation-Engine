import { pool } from "../db";
import { IUser, IUserPreference } from "../interface/IUser";
import { Role } from "../enum/Role";
import { RowDataPacket } from "mysql2";
import { GET_USER_BY_ID, GET_USER_BY_ROLE, SELECT_USER_PREFERENCES, UPDATE_USER_PREFERENCES } from "../utils/constant";

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
      throw error;
    }
  }

  async getUsersByRole(roleName: string): Promise<number[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(GET_USER_BY_ROLE, [roleName]);
    return rows.map(row => row.employeeId);
  }

  async updateUserPreferences(employeeId: number, preferences: IUserPreference): Promise<{success:boolean , message:string}> {
    const { dietaryPreference, spiceLevel, cuisineType, sweetTooth } = preferences;
    try {
      await pool.execute<RowDataPacket[]>(UPDATE_USER_PREFERENCES, [
        employeeId,
        dietaryPreference,
        spiceLevel,
        cuisineType,
        sweetTooth
      ]);
      return {success: true, message:"Updated user profile successfully"};
    } catch (error) {
      throw error;
    }
  }

  async getUserPreference(employeeId: number): Promise<IUserPreference> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(SELECT_USER_PREFERENCES, [employeeId]);
      return rows[0] as IUserPreference; 
    } catch (error) {
      throw error; 
    }
  }
}

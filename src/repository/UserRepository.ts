import { pool } from "../db";
import { IUser } from "../interface/IUser";
import { Role } from "../enum/Role";
import { RowDataPacket } from "mysql2";
import { GET_USER_BY_ID } from "../utils/constant";

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

}

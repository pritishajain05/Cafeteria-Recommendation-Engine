import { UserAction } from "../enum/UserAction";
import { RowDataPacket } from 'mysql2';
import { RECORD_USER_ACTIVITY } from "../utils/constant";
import { pool } from "../db";

export class UserActivityRepository {

    async recordUserAction(employeeId:number , action:UserAction):Promise<void> {
        try {
            await pool.execute<RowDataPacket[]>(RECORD_USER_ACTIVITY,[employeeId,action]);
        } catch (error) {
            console.log("error in recording user action",error);
            throw error;
        }

    }
}
import { UserAction } from "../enum/UserAction";
import { RowDataPacket } from 'mysql2';
import { CHECK_USER_VOTED_TODAY, RECORD_USER_ACTIVITY } from "../utils/constant";
import { pool } from "../db";

export class UserActivityRepository {

    async recordUserAction(employeeId:number , action:UserAction):Promise<void> {
        try {
            await pool.execute<RowDataPacket[]>(RECORD_USER_ACTIVITY,[employeeId,action]);
        } catch (error) {
            throw error;
        }
    }

    async hasUserVotedToday(employeeId: number): Promise<boolean> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0); 

            const [rows] = await pool.execute<RowDataPacket[]>(CHECK_USER_VOTED_TODAY, [employeeId, UserAction.VOTE_FOR_FOOD_ITEM, today]);

            return rows.length > 0;
        } catch (error) {
            throw error;
        }
    }
}
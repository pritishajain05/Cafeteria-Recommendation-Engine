import { pool } from "../db";
import { RowDataPacket } from "mysql2";
import { INotification } from "../interface/INotification";
import { ADD_NOTIFICATION, GET_NOTIFICATION_BY_EMPLOYEE_ID, MARK_NOTIFICATION_AS_SEEN } from "../utils/constant";

export class NotificationRepository {
  private currentDate: string;

  constructor() {
    this.currentDate = new Date().toISOString().split('T')[0];
  }

  async addNotification(employeeId: number, message: string, isSeen: boolean): Promise<void> {
    try {
      await pool.execute<RowDataPacket[]>(ADD_NOTIFICATION, [employeeId, message, this.currentDate, isSeen]);
    } catch (error) {
      throw error;
    }
  }

  async getNotificationsByEmployeeId(employeeId: number): Promise<INotification[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(GET_NOTIFICATION_BY_EMPLOYEE_ID, [employeeId]);
      return rows as INotification[];
    } catch (error) {
      throw error;
    }
  }

  async markNotificationAsSeen(notificationId: number, employeeId: number): Promise<{ success: boolean }> {
    try {
      const [result] = await pool.execute<RowDataPacket[]>(MARK_NOTIFICATION_AS_SEEN, [notificationId, employeeId]);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}

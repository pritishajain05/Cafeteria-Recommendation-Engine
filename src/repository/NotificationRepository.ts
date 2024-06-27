import { pool } from "../db";
import { RowDataPacket } from "mysql2";
import { INotification } from "../interface/INotification";



export class NotificationRepository {
    private currentDate: string;

    constructor() {
      this.currentDate = new Date().toISOString().split('T')[0]; 
    }

  async addNotification(employeeId: number, message: string ,isSeen: boolean): Promise<void> {
    const query = `
      INSERT INTO notification (employeeId, message, date, isSeen)
      VALUES (?, ?, ?, ?)
    `;
    await pool.execute(query, [employeeId, message, this.currentDate, isSeen]);
  }

  async getNotificationsByEmployeeId(employeeId: number): Promise<INotification[]> {
    const query = `
      SELECT * FROM notification WHERE employeeId = ? AND isSeen = false
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [employeeId]);
    return rows as INotification[];
  }

  async getUsersByRole(roleName: string): Promise<number[]> {
    const query = `
      SELECT u.employeeId FROM user u
      JOIN role r ON u.roleId = r.id
      WHERE r.roleName = ?
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [roleName]);
    return rows.map(row => row.employeeId);
  }

  async markNotificationAsSeen(employeeId: number, notificationId: number): Promise<{success:boolean}> {
    const query = `
        UPDATE notification
        SET isSeen = TRUE
        WHERE employeeId = ? AND id = ?
    `;
    await pool.execute(query, [employeeId, notificationId]);
    return { success:true}
}
}

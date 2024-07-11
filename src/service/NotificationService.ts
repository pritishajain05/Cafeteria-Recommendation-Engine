import { NotificationRepository } from "../repository/NotificationRepository";
import { INotification } from "../interface/INotification";
import { UserRepository } from "../repository/UserRepository";

export class NotificationService {
  private notificationRepository = new NotificationRepository();
  private userRepository = new UserRepository();

  async sendNotificationToChefAndEmployee(message: string, isSeen: boolean): Promise<void> {
    try {
      const employeeIds = await this.userRepository.getUsersByRole('Employee');
      const chefIds = await this.userRepository.getUsersByRole('Chef');
      const allUserIds = [...employeeIds, ...chefIds];

      for (const userId of allUserIds) {
        await this.notificationRepository.addNotification(userId, message, isSeen);
      }
    } catch (error) {
      throw error;
    }
  }

  async sendNotificationToEmployees(message: string, isSeen: boolean): Promise<void> {
    try {
      const employeeIds = await this.userRepository.getUsersByRole('Employee');

      for (const userId of employeeIds) {
        await this.notificationRepository.addNotification(userId, message, isSeen);
      }
    } catch (error) {
      throw error;
    }
  }

  async getNotifications(employeeId: number): Promise<INotification[]> {
    try {
      return await this.notificationRepository.getNotificationsByEmployeeId(employeeId);
    } catch (error) {
      throw error;
    }
  }

  async markNotificationAsSeen(notificationId: number, employeeId: number): Promise<{ success: boolean }> {
    try {
      return await this.notificationRepository.markNotificationAsSeen(notificationId, employeeId);
    } catch (error) {
      throw error;
    }
  }
}

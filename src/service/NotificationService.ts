import { NotificationRepository } from "../repository/NotificationRepository";
import { INotification } from "../interface/INotification";

export class NotificationService {
  private notificationRepository = new NotificationRepository();

  async sendNotificationToChefAndEmployee(message: string, isSeen: boolean): Promise<void> {
    const employeeIds = await this.notificationRepository.getUsersByRole('Employee');
    const chefIds = await this.notificationRepository.getUsersByRole('Chef');
    const allUserIds = [...employeeIds, ...chefIds];

    for (const userId of allUserIds) {
      await this.notificationRepository.addNotification(userId, message, isSeen);
    }
  }

  async sendNotificationToEmployees(message: string, isSeen: boolean): Promise<void> {
    const employeeIds = await this.notificationRepository.getUsersByRole('Employee');

    for (const userId of employeeIds) {
      await this.notificationRepository.addNotification(userId, message, isSeen);
    }
  }

  async getNotifications(employeeId: number): Promise<INotification[]> {
    return await this.notificationRepository.getNotificationsByEmployeeId(employeeId);
  }

  async markNotificationAsSeen(notificationId:number , employeeId:number): Promise<{ success: boolean }> {
    return await this.notificationRepository.markNotificationAsSeen(notificationId, employeeId)

  }
}

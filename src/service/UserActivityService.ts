import { UserAction } from "../enum/UserAction";
import { UserActivityRepository } from "../repository/UserActivityRepository";

export class UserActivityService {
    private userActivityRepository = new UserActivityRepository();

    async recordUserAction(employeeId: number, action: UserAction): Promise<void> {
        try {
            await this.userActivityRepository.recordUserAction(employeeId, action);
        } catch (error) {
            throw error;
        }
    }

    async hasUserVotedToday(employeeId: number): Promise<boolean> {
        try {
            return await this.userActivityRepository.hasUserVotedToday(employeeId);
        } catch (error) {
            throw error;
        }
    }
}

import { UserAction } from "../enum/UserAction";
import { UserActivityRepository } from "../repository/UserActivityRepository";

export class UserActivityService {
    private userActivityRepository = new UserActivityRepository();

    async recordUserAction(employeeId:number , action:UserAction):Promise<void>{
        await this.userActivityRepository.recordUserAction(employeeId,action);
    }

    async hasUserVotedToday(employeeId:number): Promise<boolean> {
        return await this.userActivityRepository.hasUserVotedToday(employeeId);
    }
}
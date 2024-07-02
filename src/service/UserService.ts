import { UserRepository } from "../repository/UserRepository";
import { IUser } from "../interface/IUser";
import { IUserPreference } from "../interface/IUserPreference";

export class UserService {
    private userRepository = new UserRepository();

    async login(id: number, name: string ): Promise<IUser | null> {

        return await this.userRepository.getUserById(id, name);
    }

    async updateUserPreferences(employeeId:number, preferences:IUserPreference):Promise<{success:boolean , message:string}>{
        return await this.userRepository.updateUserPreferences(employeeId,preferences);
    }

    async getUserPreferences(employeeId:number):Promise<IUserPreference> {
        return await this.userRepository.getUserPreferences(employeeId)
    }
}

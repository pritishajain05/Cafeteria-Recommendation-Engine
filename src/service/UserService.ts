import { UserRepository } from "../repository/UserRepository";
import { IUser } from "../interface/IUser";
import { IUserPreferences } from "../interface/IUserPreferences";

export class UserService {
    private userRepository = new UserRepository();

    async login(id: number, name: string ): Promise<IUser | null> {

        return await this.userRepository.getUserById(id, name);
    }

    async updateUserPreferences(employeeId:number, preferences:IUserPreferences){
        return await this.userRepository.updateUserPreferences(employeeId,preferences);
    }
}

import { UserRepository } from "../repository/UserRepository";
import { IUser } from "../interface/IUser";

export class UserService {
    private userRepository = new UserRepository();

    async login(id: number, name: string ): Promise<IUser | null> {

        return await this.userRepository.getUserById(id, name);
    }

}

import { UserRepository } from "../repositories/UserRepository";
import { IUser } from "../interfaces/IUser";
import { Role } from "../enums/Role";

export class UserService {
    private userRepository = new UserRepository();

    async login(id: number, name: string ): Promise<IUser | null> {

        return await this.userRepository.getUserById(id, name);
    }

}

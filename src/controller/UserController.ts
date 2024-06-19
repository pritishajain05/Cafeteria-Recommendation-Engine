import { UserService } from "../services/UserService";
import { IUser } from "../interfaces/IUser";

export class UserController {
    private userService = new UserService();

    async login(id: number, name: string): Promise<IUser | null> {
        return await this.userService.login(id, name );
    }

}

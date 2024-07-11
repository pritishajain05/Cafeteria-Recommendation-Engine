import { Server, Socket } from "socket.io";
import { Role } from "../enum/Role";
import { UserService } from "../service/UserService";
import { showMenu } from "../server/MenuBasedOnRole";
import { UserActivityService } from './../service/UserActivityService';
import { UserAction } from "../enum/UserAction";

interface LoginData {
  id: number;
  name: string;
}

interface MenuRequest {
  role: Role;
  employeeId: number;
}

export class UserController {
  private userService: UserService;
  private userActivityService: UserActivityService;

  constructor(io: Server) {
    this.userService = new UserService();
    this.userActivityService = new UserActivityService();
  }

  public initializeUserHandlers(socket: Socket): void {
    socket.on("login", (request: LoginData) => this.handleLogin(socket, request));
    socket.on("getRoleBasedMenu", (request: MenuRequest) => this.handleGetRoleBasedMenu(socket, request));
    socket.on("logout", (request:{employeeId: number}) => this.handleLogout(socket, request));
  }

  private async handleLogin(socket: Socket, request: LoginData):Promise<void> {
    try {
      const user = await this.userService.login(request.id, request.name);
      if (user) {
        socket.emit("loginResponse", { user });
        await this.userActivityService.recordUserAction(user.employeeId, UserAction.LOGIN);
      } else {
        socket.emit("loginResponse", { error: "Invalid credentials" });
      }
    } catch (error) {
      socket.emit("loginResponse", { error: "An error occurred during login." });
    }
  }

  private handleGetRoleBasedMenu(socket: Socket, menuRequest: MenuRequest) :void {
    try {
      const menu = showMenu(menuRequest.role);
      socket.emit("menuResponse", { menu, role: menuRequest.role, employeeId: menuRequest.employeeId });
    } catch (error) {
      socket.emit("menuResponse", { error: "An error occurred while fetching the menu." });
    }
  }

  private async handleLogout(socket: Socket, request:{employeeId: number}):Promise<void> {
    try {
      await this.userActivityService.recordUserAction(request.employeeId, UserAction.LOGOUT);
      socket.emit("logoutResponse", { success: true, message: "Logged out successfully." });
      socket.disconnect(true);
    } catch (error) {
      socket.emit("logoutResponse", { success: false, message: "Failed to logout." });
    }
  }
}

import { Server, Socket } from "socket.io";
import { Role } from "../enum/Role";
import { UserService } from "../service/UserService";
import { showMenu } from "../server/MenuBasedOnRole";
import { UserActivityService } from './../service/UserActivityService';
import { UserAction } from "../enum/UserAction";

export class UserController {
  private userService: UserService;
  private userActivityService: UserActivityService;

  constructor(io: Server) {
    this.userService = new UserService();
    this.userActivityService = new UserActivityService();
  }

  public initializeUserHandlers(socket: Socket): void {
    socket.on("login", (request: {id: number , name: string}) => this.handleLogin(socket, request));
    socket.on("getRoleBasedMenu", (request: { role: Role , employeeId: number}) => this.handleGetRoleBasedMenu(socket, request));
    socket.on("logout", (request:{employeeId: number}) => this.handleLogout(socket, request));
  }

  private async handleLogin(socket: Socket, request: {id: number , name: string}):Promise<void> {
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

  private handleGetRoleBasedMenu(socket: Socket, request: { role: Role , employeeId: number}) :void {
    try {
      const menu = showMenu(request.role);
      socket.emit("menuResponse", { menu, role: request.role, employeeId: request.employeeId });
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

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
    socket.on("login", (data) => this.handleLogin(socket, data));
    socket.on("getRoleBasedMenu", (data) => this.handleGetRoleBasedMenu(socket, data));
    socket.on("logout",(employeeId:number) => this.handleLogout(socket,employeeId))
  }

  private async handleLogin(socket: Socket, data: { id: number; name: string }) {
    try {
      const user = await this.userService.login(data.id, data.name);
      if (user) {
        socket.emit("loginResponse", user);
        this.userActivityService.recordUserAction(user.employeeId,UserAction.LOGIN)
      } else {
        socket.emit("loginResponse", { error: "Invalid credentials" });
      }
    } catch (error) {
      socket.emit("loginResponse", { error: "An error occurred during login." });
    }
  }

  private handleGetRoleBasedMenu(socket: Socket, data: { role: Role; employeeId: number }) {
    try {
      const menu = showMenu(data.role);
      socket.emit("menuResponse", { menu, role: data.role, employeeId: data.employeeId });
    } catch (error) {
      socket.emit("menuResponse", { error: "Invalid role." });
    }
  }

  private handleLogout(socket:Socket,employeeId:number) {
    try {
      this.userActivityService.recordUserAction(employeeId, UserAction.LOGOUT);
      socket.emit("logoutResponse", { success: true, message: "Logged out successfully." });
      socket.disconnect(true); 
    } catch (error) {
      socket.emit("logoutResponse", { success: false, message: "Failed to logout." });
    }
  }
}

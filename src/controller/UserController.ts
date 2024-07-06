import { Server, Socket } from "socket.io";
import { Role } from "../enum/Role";
import { UserService } from "../service/UserService";
import { showMenu } from "../server/MenuBasedOnRole";
 
export class UserController {
  private userService: UserService;

  constructor(io: Server) {
    this.userService = new UserService();
  }

  public initializeUserHandlers(socket: Socket): void {
    socket.on("login", (data) => this.handleLogin(socket, data));
    socket.on("getRoleBasedMenu", (data) => this.handleGetRoleBasedMenu(socket, data));
  }

  private async handleLogin(socket: Socket, data: { id: number; name: string }) {
    try {
      const user = await this.userService.login(data.id, data.name);
      if (user) {
        socket.emit("loginResponse", user);
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
}

import { io, Socket } from "socket.io-client";
import { Role } from "../enum/Role";
import { handleMenuOptionSelection, getLoginInput } from "./promptFunctions";
import { IUser } from "../interface/IUser";

interface MenuResponse {
  menu: string[];
  role: Role;
  employeeId: number;
  error?: string;
}

interface LoginResponse {
  user: IUser;
  error?: string;
}

export class Client {
  private socket: Socket;

  constructor(url: string) {
    this.socket = io(url);
    this.initialize();
  }

  private initialize(): void {
    this.socket.on("connect", () => this.onConnect());
    this.socket.on("loginResponse", (response: LoginResponse) => this.onLoginResponse(response));
    this.socket.on("menuResponse", (response: MenuResponse) => this.onMenuResponse(response));
    this.socket.on("disconnect", () => this.onDisconnect());
  }

  private async onConnect():Promise<void> {
    console.log("Connected to server");
    const { employeeId, name } = await getLoginInput();
    this.socket.emit("login", { id: parseInt(employeeId), name });
  }

  private onLoginResponse(response: LoginResponse): void {
    if (response.error) {
      console.log(response.error);
      this.onConnect(); 
    } else {
      console.log(`Logged in as ${response.user.role}`);
      this.socket.emit("setEmployeeId", { employeeId: response.user.employeeId });
      this.requestMenu(response.user.role, response.user.employeeId)
    }
  }

  private onMenuResponse(response: MenuResponse) : void {
    if (response.error) {
      console.log(response.error);
    } else {
      console.log("Menu:");
      response.menu.forEach((item: string) => {
        console.log(item);
      });
      handleMenuOptionSelection(response.role, response.employeeId);
    }
  }

  private onDisconnect(): void  {
    console.log("Connection closed");
    process.exit(0);
  }

  public requestMenu(role: Role, employeeId: number) : void {
    this.socket.emit("getRoleBasedMenu", { role, employeeId });
  }

  public getSocket(): Socket {
    return this.socket;
  }
}

const client = new Client("http://localhost:3000");
export const socket = client.getSocket();
export const requestMenu = client.requestMenu.bind(client);

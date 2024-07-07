import { io, Socket } from "socket.io-client";
import readline from "readline";
import { Role } from "../enum/Role";
import {
  handleMenuOptionSelection,
  getLoginInput,
} from "./promptFunctions";


export class Client {
  private socket: Socket;

  constructor(url: string) {
    this.socket = io(url);
    this.initialize();
  }

  private initialize(): void {
    this.socket.on("connect", this.onConnect.bind(this));
    this.socket.on("loginResponse", this.onLoginResponse.bind(this));
    this.socket.on("menuResponse", this.onMenuResponse.bind(this));
    this.socket.on("disconnect", this.onDisconnect.bind(this));
  }

  private async onConnect(): Promise<void> {
    console.log("Connected to server");
    const { employeeId, name } = await getLoginInput();
    this.socket.emit("login", { id: parseInt(employeeId), name });
  }

  private onLoginResponse(data: any): void {
    if (data.error) {
      console.log(data.error);
      this.onConnect(); 
    } else {
      console.log(`Logged in as ${data.role}`);
      this.requestMenu(data.role, data.employeeId);
    }
  }

 
  private onMenuResponse(data: any): void {
    if (data.error) {
      console.log(data.error);
    } else {
      console.log("Menu:");
      data.menu.forEach((item: string) => {
        console.log(item);
      });
      handleMenuOptionSelection(data.role, data.employeeId);
    }
  }

  
  private onDisconnect(): void {
    console.log("Connection closed");
  }

  public requestMenu(role: Role, employeeId: number): void {
    this.socket.emit("getRoleBasedMenu", { role, employeeId });
  }

  public getSocket(): Socket {
    return this.socket;
  }
}

const client = new Client("http://localhost:3000");
export const socket = client.getSocket();
export const requestMenu = client.requestMenu.bind(client);

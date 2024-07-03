import { io, Socket } from "socket.io-client";
import {
  handleMenuOptionSelection,
  promptLogin,
  requestMenu,
} from "./clientOperation";

class Client {
  private socket: Socket;
  
  constructor(url: string) {
    this.socket = io(url);
    this.initialize();
  }

  private initialize(): void {
    this.socket.on("connect", this.onConnect);
    this.socket.on("loginResponse", this.onLoginResponse);
    this.socket.on("menuResponse", this.onMenuResponse);
    this.socket.on("disconnect", this.onDisconnect);
  }

  private onConnect(): void {
    console.log("Connected to server");
    promptLogin();
  }

  private onLoginResponse(data: any): void {
    if (data.error) {
      console.log(data.error);
      promptLogin();
    } else {
      console.log(`Logged in as ${data.role}`);
      requestMenu(data.role , data.employeeId);
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
      handleMenuOptionSelection(data.role , data.employeeId);
    }
  }

  private onDisconnect(): void {
    console.log("Connection closed");
  }

  public getSocket(): Socket {
    return this.socket;
  }

}

const client = new Client("http://localhost:3000");
export const socket = client.getSocket();



import { io } from "socket.io-client";
import {
  handleMenuOptionSelection,
  promptLogin,
  requestMenu,
} from "./clientOperation";

export const socket = io("http://localhost:3000");

export let employeeId: number;

socket.on("connect", () => {
  console.log("Connected to server");
  promptLogin();
});

socket.on("loginResponse", (data) => {
  if (data.error) {
    console.log(data.error);
    promptLogin();
  } else {
    employeeId = data.employeeId;
    console.log(`Logged in as ${data.role}`);
    requestMenu(data.role);
  }
});

socket.on("menuResponse", (data) => {
  if (data.error) {
    console.log(data.error);
  } else {
    console.log("Menu:");
    data.menu.forEach((item: string) => {
      console.log(item);
    });
    handleMenuOptionSelection(data.role);
  }
});

socket.on("disconnect", () => {
  console.log("Connection closed");
});

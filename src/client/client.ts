// src/client.ts

import { io } from "socket.io-client";
import { handleMenuOptionSelection, promptLogin, requestMenu } from "./clientOperation";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to server");
  promptLogin(socket);
});

socket.on("loginResponse", (data) => {
  if (data.error) {
    console.log(data.error);
    promptLogin(socket);
  } else {
    console.log(`Logged in as ${data.role}`);
    requestMenu(data.role , socket);
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
    handleMenuOptionSelection(data.role , socket);
  }
});

socket.on("selectedOptionResponse", (data) => {
    if (data.error) {
      console.log("Error:", data.error);
    } else {
      console.log("Message:", data.message);
    }
  
    if (data.option.toLowerCase() !== "exit" && data.option.toLowerCase() !== "logout") {
      requestMenu(data.role , socket);
    } else {
      socket.disconnect();
    }
  });


socket.on("disconnect", () => {
  console.log("Connection closed");
});

import readline from "readline";
import { Role } from "../enums/Role";
import {
  handleAdminOption,
  handleChefOption,
  handleEmployeeOption,
} from "./RoleBasedActions";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Socket } from "socket.io-client";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const promptLogin = (socket: Socket<DefaultEventsMap, DefaultEventsMap>) => {
  rl.question("Enter your employee ID: ", (employeeId) => {
    rl.question("Enter your name: ", (name) => {
      socket.emit("login", { id: parseInt(employeeId), name });
    });
  });
};

export const requestMenu = (role: Role , socket: Socket<DefaultEventsMap, DefaultEventsMap>) => {
  socket.emit("getRoleBasedMenu", { role });
};

export const handleMenuOptionSelection = async (role: Role , socket: Socket<DefaultEventsMap, DefaultEventsMap>) => {
  rl.question("Choose an option: ", async (option: string) => {
      let response;
      switch (role) {
        case Role.Admin:
          await handleAdminOption(option , rl , socket , role );      
          break;
        case Role.Chef:
          response = await handleChefOption(option , rl , socket);       
          break;
        case Role.Employee:
          response = await handleEmployeeOption(option , rl , socket );
          break;
        default:
          console.log("Invalid Role");
      }
    } 
  );
};

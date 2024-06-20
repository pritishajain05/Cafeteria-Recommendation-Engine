import readline from "readline";
import { Role } from "../enum/Role";
import {
  handleAdminOption,
  handleChefOption,
  handleEmployeeOption,
} from "./RoleBasedActions";
import { socket } from "./client";


export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const promptLogin = () => {
  rl.question("Enter your employee ID: ", (employeeId) => {
    rl.question("Enter your name: ", (name) => {
      socket.emit("login", { id: parseInt(employeeId), name });
    });
  });
};

export const requestMenu = (role: Role) => {
  socket.emit("getRoleBasedMenu", { role });
};

export const handleMenuOptionSelection = async (role: Role) => {
  rl.question("Choose an option: ", async (option: string) => {
      switch (role) {
        case Role.Admin:
          await handleAdminOption(option,role);      
          break;
        case Role.Chef:
          await handleChefOption(option , role );       
          break;
        case Role.Employee:
          await handleEmployeeOption(option ,role );
          break;
        default:
          console.log("Invalid Role");
      }
    } 
  );
};

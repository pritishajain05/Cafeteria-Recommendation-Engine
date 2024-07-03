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
}

export const requestMenu = (role: Role ,employeeId:number) => {
  socket.emit("getRoleBasedMenu", { role,employeeId });
};

export const handleMenuOptionSelection = async (role:Role , employeeId:number) => {
  rl.question("Choose an option: ", async (option: string) => {
      switch (role) {
        case Role.Admin:
          await handleAdminOption(option,role ,employeeId);      
          break;
        case Role.Chef:
          await handleChefOption(option , role ,employeeId);       
          break;
        case Role.Employee:
          await handleEmployeeOption(option ,role ,employeeId);
          break;
        default:
          console.log("Invalid Role");
      }
    } 
  );
};

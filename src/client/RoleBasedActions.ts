import { DefaultEventsMap } from '@socket.io/component-emitter';
import { Socket } from 'socket.io-client';
import { addFoodItem, deleteFoodItem, updateFoodItem, viewFeedbackOnItem, viewMenu, viewMonthlyFeedback } from './AdminActions';
import readline from "readline";
import { Role } from '../enums/Role';

export const handleAdminOption = async (option: string , rl: readline.Interface , socket: Socket<DefaultEventsMap, DefaultEventsMap> , role:Role) => {
    switch (option) {
      case "1":
        await addFoodItem(rl , socket , role);
        break;
      case "2":
        await updateFoodItem(rl);
        break;
      case "3":
        await deleteFoodItem(rl , socket , role);
        break;
      case "4":
        await viewMonthlyFeedback();
        break;
      case "5":
        await viewMenu();
        break;
      case "6":
        await viewFeedbackOnItem();
        break;
      case "logout":
        rl.close();
        socket.close();
        console.log("Logged out successfully."); 
        break;  
      default:
        console.log('Invalid option.');
    }
  }

export async function handleChefOption(option: string, rl: readline.Interface , socket: Socket<DefaultEventsMap, DefaultEventsMap>) {
    switch (option) {
      
      case "logout":
        rl.close();
        socket.close();
        console.log("Logged out successfully."); 
        break; 
      default:
          console.log('Invalid option.');
    }
}

export async function handleEmployeeOption(option: string , rl :readline.Interface , socket: Socket<DefaultEventsMap, DefaultEventsMap>) {
    switch (option) {

      case "logout":
        rl.close();
        socket.close();
        console.log("Logged out successfully."); 
        break; 
      default:
          console.log('Invalid option.');
    }
}

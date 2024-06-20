import { addFoodItem, deleteFoodItem, updateFoodItem, viewFeedbackOnItem, viewMenu, viewMonthlyFeedback } from './AdminActions';
import { Role } from '../enum/Role';
import { socket } from './client';
import { rl } from './clientOperation';

export const handleAdminOption = async (option: string , role:Role) => {
    switch (option) {
      case "1":
        await addFoodItem(role);
        break;
      case "2":
        await updateFoodItem(role);
        break;
      case "3":
        await deleteFoodItem(role);
        break;
      case "4":
        await viewMonthlyFeedback();
        break;
      case "5":
        await viewMenu(role);
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

export async function handleChefOption(option: string, role:Role) {
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

export async function handleEmployeeOption(option: string , role:Role) {
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

import { Console } from 'console';
import { addFoodItem, deleteFoodItem, updateFoodItem, viewFeedbackOnItem, viewMenu, viewMonthlyFeedback } from './AdminActions';
import readline from "readline";

export const handleAdminOption = async (option: string , rl: readline.Interface) => {
    switch (option) {
      case "1":
        return await addFoodItem(rl);
      case "2":
        return await updateFoodItem(rl);
      case "3":
        return await deleteFoodItem(rl);
      case "4":
        return await viewMonthlyFeedback();
      case "5":
        return await viewMenu();
      case "6":
        return await viewFeedbackOnItem();
      case "logout":
        rl.close();
        console.log("Logged out successfully."); 
        break;  
      default:
        console.log('Invalid option.');
    }
  }

export async function handleChefOption(option: string, rl: readline.Interface) {
    switch (option) {
      
        default:
          console.log('Invalid option.');
    }
}

export async function handleEmployeeOption(option: string , rl :readline.Interface) {
    switch (option) {
        
        default:
          console.log('Invalid option.');
    }
}

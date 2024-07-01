import {
  addFoodItem,
  deleteFoodItem,
  updateFoodItem,
  viewMenu,
} from "./AdminActions";
import { Role } from "../enum/Role";
import { socket } from "./client";
import { rl } from "./clientOperation";
import {
  finalizeFoodItems,
  rollOutMenuForNextDay,
  viewDiscardFoodItems,
  viewRecommendedFoodItems,
} from "./ChefActions";
import {
  giveDetailedFeedback,
  giveFeedbackOnItem,
  selectFoodItemsForNextDay,
  updateProfile,
  viewFeedbackOnItem,
  viewFinalMenu,
  viewNotification,
} from "./EmployeeActions";

export const handleAdminOption = async (option: string, role: Role) => {
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
      await viewMenu(role);
      break;
    case "5":
      await viewFeedbackOnItem(role);
      break;
    case "6":
      await viewDiscardFoodItems(role);
      break;
    case "logout":
      rl.close();
      socket.close();
      console.log("Logged out successfully.");
      break;
    default:
      console.log("Invalid option.");
  }
};

export const handleChefOption = async (option: string, role: Role) => {
  switch (option) {
    case "1":
      await viewMenu(role);
      break;
    case "2":
      await viewRecommendedFoodItems(role);
      break;
    case "3":
      await rollOutMenuForNextDay(role);
      break;
    case "4":
      await finalizeFoodItems(role);
      break;
    case "6":
      await viewNotification(role);
      break;
    case "7":
      await viewDiscardFoodItems(role);
      break;
    case "logout":
      rl.close();
      socket.close();
      console.log("Logged out successfully.");
      break;
    default:
      console.log("Invalid option.");
  }
};

export const handleEmployeeOption = async (option: string, role: Role) => {
  switch (option) {
    case "1":
      await viewMenu(role);
      break;
    case "2":
      await selectFoodItemsForNextDay(role);
      break;
    case "3":
      await viewFeedbackOnItem(role);
      break;
    case "4":
      await giveFeedbackOnItem(role);
      break;
    case "5":
      await viewNotification(role);
      break;
    case "6":
      await updateProfile(role);
      break;
    case "7":
      await viewFinalMenu(role);
      break;
    case "8":
      await giveDetailedFeedback(role);
      break;
    case "logout":
      rl.close();
      socket.close();
      console.log("Logged out successfully.");
      break;
    default:
      console.log("Invalid option.");
  }
};



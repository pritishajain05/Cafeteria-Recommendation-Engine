import {
  addFoodItem,
  deleteFoodItem,
  updateFoodItem,
} from "./AdminActions";
import { Role } from "../enum/Role";
import { requestMenu } from "./client";
import {
  finalizeFoodItemsForNextDay,
  rollOutMenuForNextDay,
  viewRecommendedFoodItems,
} from "./ChefActions";
import {
  giveDetailedFeedback,
  giveFeedbackOnItem,
  updateProfile,
  viewFinalMenu,
  voteForFoodItemsForNextDay,
} from "./EmployeeActions";
import { handleLogout, viewDiscardFoodItems, viewFeedbackOnItem, viewMenu, viewNotification } from "./CommonActions";

export const handleAdminOption = async (option: string, role: Role , employeeId:number) => {
  switch (option) {
    case "1":
      await viewMenu(role ,employeeId);
      break;
    case "2":
      await addFoodItem(role,employeeId);
      break;
    case "3":
      await updateFoodItem(role,employeeId);
      break;
    case "4":
      await deleteFoodItem(role,employeeId);
      break;
    case "5":
      await viewFeedbackOnItem(role,employeeId);
      break;
    case "6":
      await viewDiscardFoodItems(role,employeeId);
      break;
    case "logout":
      await handleLogout(role,employeeId);
      break;
    default:
      console.log("Invalid option.");
      requestMenu(role,employeeId);
  }
};

export const handleChefOption = async (option: string, role: Role , employeeId:number) => {
  switch (option) {
    case "1":
      await viewMenu(role,employeeId);
      break;
    case "2":
      await viewRecommendedFoodItems(role,employeeId);
      break;
    case "3":
      await rollOutMenuForNextDay(role,employeeId);
      break;
    case "4":
      await finalizeFoodItemsForNextDay(role,employeeId);
      break;
    case "5":
      await viewFinalMenu(role,employeeId,false);
      break;
    case "6":
      await viewFeedbackOnItem(role,employeeId);
      break;
    case "7":
      await viewNotification(role,employeeId);
      break;
    case "8":
      await viewDiscardFoodItems(role,employeeId);
      break;
    case "logout":
      await handleLogout(role,employeeId);
      break;
    default:
      console.log("Invalid option.");
      requestMenu(role,employeeId);
  }
};

export const handleEmployeeOption = async (option: string, role: Role , employeeId:number) => {
  switch (option) {
    case "1":
      await viewMenu(role,employeeId);
      break;
    case "2":
      await voteForFoodItemsForNextDay(role,employeeId,false);
      break;
    case "3":
      await viewFeedbackOnItem(role,employeeId);
      break;
    case "4":
      await giveFeedbackOnItem(role,employeeId);
      break;
    case "5":
      await viewNotification(role,employeeId);
      break;
    case "6":
      await viewFinalMenu(role,employeeId,false);
      break;
    case "7":
      await giveDetailedFeedback(role,employeeId,false);
      break;
    case "8":
      await updateProfile(role,employeeId);
      break;
    case "logout":
      await handleLogout(role,employeeId);
      break;
    default:
      console.log("Invalid option.");
      requestMenu(role , employeeId);
  }
};

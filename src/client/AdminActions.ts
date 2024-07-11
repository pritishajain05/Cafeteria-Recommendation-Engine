import { IFoodItem, IFoodItemPreference } from "../interface/IFoodItem";
import { Role } from "../enum/Role";
import { requestMenu, socket } from "./client";
import { promptFoodItemDetails, promptFoodItemNameToDelete, promptFoodItemNameToUpdate, promptFoodItemPreferences } from "./promptFunctions";
import { IFoodCategory } from "../interface/IFoodCategory";

interface MessageResponse {
  success: boolean;
  message: string;
}

export const getFoodCategories = async (): Promise<IFoodCategory[]> => {
  return new Promise((resolve, reject) => {
    socket.emit("getFoodCategories");
    socket.once("foodCategoryResponse", (response: { foodCategories: IFoodCategory[]; error?: string }) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response.foodCategories);
      }
    });
  });
};

export const addFoodItem = async (role: Role, employeeId: number): Promise<void> => {
  const foodItem: IFoodItem = await promptFoodItemDetails();
  const foodItemPreference: IFoodItemPreference = await promptFoodItemPreferences();

  socket.emit("addFoodItem", { foodItem, foodItemPreference });
  socket.once("addFoodItemResponse", (response: MessageResponse) => {
    if (response.success) {
      console.log(`*${response.message}*`);
      socket.emit("sendNotificationToChefAndEmployee", {
        message: `A New Item has been added ! \n Name : ${foodItem.name} \n Price : ${foodItem.price}`,
        isSeen: false
      });

      socket.once("chefAndEmployeeNotificationResponse", (notificationResponse :MessageResponse) => {
        if (notificationResponse.success) {
          console.log(notificationResponse.message);
        } else {
          console.error(notificationResponse.message);
        }
        requestMenu(role, employeeId);
      });
    } else {
      console.log(response.message);
      addFoodItem(role, employeeId);
    }
  });
};

export const updateFoodItem = async (role: Role, employeeId: number): Promise<void> => {
  const itemName = await promptFoodItemNameToUpdate();

  socket.emit("checkFoodItemExistence",{ itemName });
  socket.once("checkFoodItemExistenceResponse", async (response: { exists: boolean }) => {
    if (!response.exists) {
      console.log("Food item does not exist. Please enter some other Food Item");
      updateFoodItem(role, employeeId);
      return;
    }

    console.log("New Food Item Details:");
    const newFoodItem: IFoodItem = await promptFoodItemDetails();
    const newFoodItemPreference: IFoodItemPreference = await promptFoodItemPreferences();

    socket.emit("updateFoodItem", { itemName, newFoodItem, newFoodItemPreference });

    socket.once("updateFoodItemResponse", (response: MessageResponse) => {
      if (response.success) {
        console.log(`*${response.message}*`);
        requestMenu(role, employeeId);
      } else {
        console.log(response.message);
        updateFoodItem(role, employeeId);
      }
    });
  });
};

export const deleteFoodItem = async (role: Role, employeeId: number): Promise<void> => {
  try {
    const itemName = await promptFoodItemNameToDelete();

    socket.emit("deleteFoodItem", { itemName });

    socket.once("deleteFoodItemResponse", (response: MessageResponse) => {
      if (response.success) {
        console.log(`*${response.message}*`);
        socket.emit("sendNotificationToChefAndEmployee", {
          message: `${itemName} would not be available !`,
          isSeen: false
        });

        socket.once("chefAndEmployeeNotificationResponse", (notificationResponse: MessageResponse) => {
          if (notificationResponse.success) {
            console.log(notificationResponse.message);
          } else {
            console.error(notificationResponse.message);
          }
          requestMenu(role, employeeId);
        });
      } else {
        console.log(response.message);
        deleteFoodItem(role, employeeId);
      }
    });
  } catch (error) {
    console.error("Error in deleting food item:", error);
    console.log("Please try again.");
    deleteFoodItem(role, employeeId);
  }
};

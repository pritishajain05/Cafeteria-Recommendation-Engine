import { IFoodItem, IFoodItemPreference, IMenuItem } from "../interface/IFoodItem";
import { IFoodCategory } from "../interface/IFoodCategory";
import { Role } from "../enum/Role";
import { requestMenu, socket } from "./client";
import { promptFoodItemDetails, promptFoodItemNameToDelete, promptFoodItemNameToUpdate, promptFoodItemPreferences } from "./promptFunctions";

export const getFoodCategories = async (): Promise<IFoodCategory[]> => {
  return new Promise((resolve, reject) => {
    socket.emit("getFoodCategories");
    socket.once("foodCategoryResponse", (response) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response.foodCategories);
      }
    });
  });
};

export const addFoodItem = async (role: Role , employeeId:number) => {
  const foodItem: IFoodItem = await promptFoodItemDetails();
  const foodItemPreference: IFoodItemPreference =
    await promptFoodItemPreferences();

  socket.emit("addFoodItem", foodItem, foodItemPreference);
  socket.once(
    "addFoodItemResponse",
    (response: { success: boolean; message: string }) => {
      if (response.success) {
        console.log(`*${response.message}*`);
        
        socket.emit(
          "sendNotificationToChefAndEmployee",
          `A New Item has been added ! \n Name : ${foodItem.name} \n Price : ${foodItem.price}`,
          false
        );
      
        socket.once("chefAndEmployeeNotificationResponse", (response) => {
          if (response.success) {
            console.log(response.message);
          } else {
            console.error(response.message);
          }
          requestMenu(role,employeeId);
        });
      } else {
        console.log(response.message);
        addFoodItem(role,employeeId);
      }
    }
  );
};


export const updateFoodItem = async (role: Role , employeeId:number) => {
  const itemName = await promptFoodItemNameToUpdate()

  socket.emit("checkFoodItemExistence", itemName);
  socket.once(
    "checkFoodItemExistenceResponse",
    async (response) => {
      if (!response.exists) {
        console.log(
          "Food item does not exist.Please enter some other Food Item"
        );
        updateFoodItem(role ,employeeId);
        return;
      }

      console.log("New Food Item Details:");
      const newFoodItem: IFoodItem = await promptFoodItemDetails();
      const newFoodItemPreference: IFoodItemPreference = await promptFoodItemPreferences();

      socket.emit("updateFoodItem", 
        itemName,
        newFoodItem,
        newFoodItemPreference
      );

      socket.once(
        "updateFoodItemResponse",
        (response: { success: boolean; message: string }) => {
          if (response.success) {
            console.log(`*${response.message}*`);
            requestMenu(role ,employeeId);
          } else {
            console.log(response.message);
            updateFoodItem(role,employeeId);
          }
        }
      );
    }
  );
};

export const deleteFoodItem = async (role: Role,employeeId:number) => {
  try {
    const itemName = await promptFoodItemNameToDelete();

    socket.emit("deleteFoodItem", itemName);

    socket.once(
      "deleteFoodItemResponse",
      (response: { success: boolean; message: string }) => {
        if (response.success) {
          console.log(`*${response.message}*`);
          socket.emit(
            "sendNotificationToChefAndEmployee",
            `${itemName} would not be available !`,
            false
          );
      
          socket.once("chefAndEmployeeNotificationResponse", (response) => {
            if (response.success) {
              console.log(response.message);
            } else {
              console.error(response.message);
            }
            requestMenu(role,employeeId);
          });
        } else {
          console.log(response.message);
          deleteFoodItem(role,employeeId);
        }
      }
    );
  } catch (error) {
    console.error("Error in deleting food item:", error);
    console.log("Please try again.");
    deleteFoodItem(role,employeeId);
  }
};



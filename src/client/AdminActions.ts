import { IFoodItem } from "../interfaces/IFoodItem";
import readline from "readline";
import { IFoodCategory } from "../interfaces/IFoodCategory";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Socket } from "socket.io-client";
import { Role } from "../enums/Role";
import { requestMenu } from "./clientOperation";

const getFoodCategories = async (socket: Socket<DefaultEventsMap, DefaultEventsMap>): Promise<IFoodCategory[]> => {
    return new Promise((resolve, reject) => {
      socket.emit("getFoodCategories");
      socket.on("foodCategoryResponse", (data) => {
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data.foodCategories);
        }
      });
    });
  };

  export const addFoodItem = async (rl: readline.Interface , socket: Socket<DefaultEventsMap, DefaultEventsMap> , role:Role) => {
    rl.question("Enter Food Item Name: ", (name) => {
      rl.question("Enter Food Item Price: ", (price) => {
        const itemPrice = parseFloat(price);
        if (isNaN(itemPrice)) {
          console.error("Invalid price. Please enter a valid number.");
          addFoodItem(rl , socket,role); 
          return;
        }
  
        getFoodCategories(socket)
          .then((categories: IFoodCategory[]) => {
            console.log("Available Categories:");
            categories.forEach((category: IFoodCategory) => {
              console.log(`${category.id}. ${category.name}`);
            });
  
            rl.question("Enter the number corresponding to the Food Category: ", (categoryId) => {
              const category = categories.find((cat) => cat.id.toString() === categoryId);
              if (!category) {
                console.error("Invalid category. Please choose a valid category.");
                addFoodItem(rl,socket,role); 
                return;
              }
  
              const foodItem: IFoodItem = {
                name,
                price: itemPrice,
                availabilityStatus: true,
                foodCategoryId: category.id,
              };
  
              socket.emit("addFoodItem", foodItem);
  
              socket.on("addFoodItemResponse", (response: { success: boolean; message: string }) => {
                if (response.success) {
                  console.log(`*${response.message}*`);
                  requestMenu(role,socket);
                } else {
                  console.log(response.message);
                  addFoodItem(rl,socket,role); 
                }
              });
            });
          })
          .catch((error) => {
            console.error("Error fetching categories:", error);
            console.log("Please try again.");
            addFoodItem(rl ,socket,role); 
          });
      });
    });
  };


export const updateFoodItem = async (rl :  readline.Interface) => {

  return { message: "Updated Food Item" };
};

export const deleteFoodItem = async (rl :  readline.Interface , socket: Socket<DefaultEventsMap, DefaultEventsMap>, role:Role) => {
  try {
    const itemName = await new Promise<string>((resolve) => {
      rl.question("Enter Food Item Name to delete: ", (itemName) => {
        resolve(itemName);
      });
    });

    socket.emit("deleteFoodItem", itemName);

    socket.on("deleteFoodItemResponse", (response: { success: boolean; message: string }) => {
      if (response.success) {
        console.log(`*${response.message}*`);
        requestMenu(role,socket);
      } else {
        console.log(response.message);
        deleteFoodItem(rl,socket,role); 
      }
    });

  } catch (error) {
    console.error("Error in deleting food item:", error);
    console.log("Please try again.");
    deleteFoodItem(rl,socket,role); 
  }
};

export const viewMonthlyFeedback = async () => {
 
  return { message: "Viewed Monthly Feedback" };
};

export const viewMenu = async () => {

  return { message: "Viewed Menu" };
};

export const viewFeedbackOnItem = async () => {

  return { message: "Viewed Feedback on Item" };
};

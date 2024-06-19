import { IFoodItem } from "../interfaces/IFoodItem";
import { io } from "socket.io-client";
import readline from "readline";
import { IFoodCategory } from "../interfaces/IFoodCategory";

const socket = io("http://localhost:3000");

const getFoodCategories = async (): Promise<IFoodCategory[]> => {
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

export const addFoodItem = async (rl :  readline.Interface) => {
    return new Promise<IFoodItem>(async (resolve, reject) => {
      rl.question("Enter Food Item Name: ", (name) => {
        rl.question("Enter Food Item Price: ", (price) => {
          const itemPrice = parseFloat(price);
          if (isNaN(itemPrice)) {
            reject(new Error("Invalid price. Please enter a valid number."));
            return;
          }
  
          getFoodCategories().then((categories:IFoodCategory[]) => {
            console.log("Available Categories:");
            categories.forEach((category: IFoodCategory) => {
              console.log(`${category.id}. ${category.name}`);
            });
  
            rl.question("Enter the number corresponding to the Food Category: ", (categoryId) => {
              const category = categories.find((cat: any) => cat.id.toString() === categoryId);
              if (!category) {
                reject(new Error("Invalid category. Please choose a valid category."));
                return;
              }
  
              const foodItem: IFoodItem = {
                name,
                price: itemPrice,
                availabilityStatus: true,
                foodCategoryId: category.id,
              };
              resolve(foodItem);
            });
          }).catch((error) => {
            console.error("Error fetching categories:", error);
            reject(new Error("Error fetching categories."));
          });
        });
      });
    });
  };
export const updateFoodItem = async (rl :  readline.Interface) => {

  return { message: "Updated Food Item" };
};

export const deleteFoodItem = async (rl :  readline.Interface) => {
 
  return { message: "Deleted Food Item" };
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

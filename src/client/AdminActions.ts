import { IFoodItem, IMenuItem } from "../interface/IFoodItem";
import { IFoodCategory } from "../interface/IFoodCategory";
import { Role } from "../enum/Role";
import { requestMenu, rl } from "./clientOperation";
import { socket } from "./client";

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

  export const addFoodItem = async (role:Role) => {
    rl.question("Enter Food Item Name: ", (name) => {
      rl.question("Enter Food Item Price: ", (price) => {
        const itemPrice = parseFloat(price);
        if (isNaN(itemPrice)) {
          console.error("Invalid price. Please enter a valid number.");
          addFoodItem(role); 
          return;
        }
  
        getFoodCategories()
          .then((categories: IFoodCategory[]) => {
            console.log("Available Categories:");
            categories.forEach((category: IFoodCategory) => {
              console.log(`${category.id}. ${category.name}`);
            });
  
            rl.question("Enter the number corresponding to the Food Category: ", (categoryId) => {
              const category = categories.find((cat) => cat.id.toString() === categoryId);
              if (!category) {
                console.error("Invalid category. Please choose a valid category.");
                addFoodItem(role); 
                return;
              }
  
              const foodItem: IFoodItem = {
                name,
                price: itemPrice,
                availabilityStatus: true,
                foodCategoryId: category.id,
              };
  
              socket.emit("addFoodItem", foodItem);
  
              socket.off("addFoodItemResponse");
              socket.on("addFoodItemResponse", (response: { success: boolean; message: string }) => {
                if (response.success) {
                  console.log(`*${response.message}*`);
                  requestMenu(role);
                } else {
                  console.log(response.message);
                  addFoodItem(role); 
                }
              });
            });
          })
          .catch((error) => {
            console.error("Error fetching categories:", error);
            console.log("Please try again.");
            addFoodItem(role); 
          });
      });
    });
  };


  export const updateFoodItem = async (role: Role) => {
    try {
      const itemName = await new Promise<string>((resolve) => {
        rl.question("Enter Food Item Name to update: ", (itemName) => {
          resolve(itemName);
        });
      });
  
      socket.emit("checkFoodItemExistence", itemName);
  
      socket.off("checkFoodItemExistenceResponse");
      socket.on("checkFoodItemExistenceResponse", async (response: { exists: boolean }) => {
        if (!response.exists) {
          console.log("Food item does not exist.Please enter some other Food Item");
          updateFoodItem(role);
          return;
        }
  
        rl.question("Enter new Food Item Name: ", (newName) => {
          rl.question("Enter new Food Item Price: ", (newPrice) => {
            const itemPrice = parseFloat(newPrice);
            if (isNaN(itemPrice)) {
              console.error("Invalid price. Please enter a valid number.");
              updateFoodItem(role);
              return;
            }
  
            getFoodCategories()
              .then((categories: IFoodCategory[]) => {
                console.log("Available Categories:");
                categories.forEach((category: IFoodCategory) => {
                  console.log(`${category.id}. ${category.name}`);
                });
  
                rl.question("Enter the number corresponding to the new Food Category: ", (categoryId) => {
                  const category = categories.find((cat) => cat.id.toString() === categoryId);
                  if (!category) {
                    console.error("Invalid category. Please choose a valid category.");
                    updateFoodItem(role);
                    return;
                  }
  
                  const updatedFoodItem: IFoodItem = {
                    name: newName,
                    price: itemPrice,
                    availabilityStatus: true,
                    foodCategoryId: category.id,
                  };
  
                  socket.emit("updateFoodItem", { itemName, updatedFoodItem });
  
                  socket.off("updateFoodItemResponse");
                  socket.on("updateFoodItemResponse", (response: { success: boolean; message: string }) => {
                    if (response.success) {
                      console.log(`*${response.message}*`);
                      requestMenu(role);
                    } else {
                      console.log(response.message);
                      updateFoodItem(role);
                    }
                  });
                });
              })
              .catch((error) => {
                console.error("Error fetching categories:", error);
                console.log("Please try again.");
                updateFoodItem(role);
              });
          });
        });
      });
    } catch (error) {
      console.error("Error in updating food item:", error);
      console.log("Please try again.");
      updateFoodItem(role);
    }
  };

export const deleteFoodItem = async (role:Role) => {
  try {
    const itemName = await new Promise<string>((resolve) => {
      rl.question("Enter Food Item Name to delete: ", (itemName) => {
        resolve(itemName);
      });
    });

    socket.emit("deleteFoodItem", itemName);

    socket.off("deleteFoodItemResponse");
    socket.on("deleteFoodItemResponse", (response: { success: boolean; message: string }) => {
      if (response.success) {
        console.log(`*${response.message}*`);
        requestMenu(role);
      } else {
        console.log(response.message);
        deleteFoodItem(role); 
      }
    });

  } catch (error) {
    console.error("Error in deleting food item:", error);
    console.log("Please try again.");
    deleteFoodItem(role); 
  }
};

export const viewMonthlyFeedback = async () => {
 
  return { message: "Viewed Monthly Feedback" };
};

export const viewMenu = async (role:Role) => {

  socket.emit("viewAllFoodItems");

  socket.on("viewAllFoodItemsResponse", (data) => {
    if (data.error) {
      console.error("Error fetching menu:", data.error);
      return;
    }

    if (data.foodItems && data.foodItems.length > 0) {
      console.log("Complete Menu:");
      const formattedFoodItems: IMenuItem[] = data.foodItems.map((foodItem: any) => ({
        id: foodItem.id,
        name: foodItem.name,
        price: foodItem.price,
        availabilityStatus: foodItem.availabilityStatus ? 'available' : 'not available',
        categoryName: foodItem.categoryName,
        mealTypeNames: foodItem.mealTypeNames.length > 0 ? foodItem.mealTypeNames.join(', ') : null,
      }));

      console.table(formattedFoodItems);
      requestMenu(role);
    } else {
      console.log("No menu items found.");
      requestMenu(role);
    }
  });

  
};

export const viewFeedbackOnItem = async () => {

  return { message: "Viewed Feedback on Item" };
};

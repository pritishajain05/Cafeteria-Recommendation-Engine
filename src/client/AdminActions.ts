import { IFoodItem, IMenuItem } from "../interface/IFoodItem";
import { IFoodCategory } from "../interface/IFoodCategory";
import { Role } from "../enum/Role";
import { requestMenu, rl } from "./clientOperation";
import { socket } from "./client";
import { IFoodItemPreference } from "../interface/IUserPreference";
import {
  CuisineType,
  DietaryPreference,
  SpiceLevel,
} from "../enum/UserPreferences";

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

export const addFoodItem = async (role: Role) => {
  const foodItem: IFoodItem = await askFoodItemDetails();
  const foodItemPreference: IFoodItemPreference =
    await askFoodItemPreferences();

  socket.emit("addFoodItem", foodItem, foodItemPreference);

  socket.off("addFoodItemResponse");
  socket.on(
    "addFoodItemResponse",
    (response: { success: boolean; message: string }) => {
      if (response.success) {
        console.log(`*${response.message}*`);
        socket.emit(
          "sendNotificationToChefAndEmployee",
          `A New Item has been added ! \n Name : ${foodItem.name} \n Price : ${foodItem.price}`,
          false
        );
        socket.off("chefAndEmployeeNotificationResponse");
        socket.on("chefAndEmployeeNotificationResponse", (response) => {
          if (response.success) {
            console.log(response.message);
          } else {
            console.error(response.message);
          }
          requestMenu(role);
        });
      } else {
        console.log(response.message);
        addFoodItem(role);
      }
    }
  );
};

const askFoodItemDetails = (): Promise<IFoodItem> => {
  return new Promise((resolve, reject) => {
    rl.question("Enter Food Item Name: ", (name) => {
      rl.question("Enter Food Item Price: ", (price) => {
        const itemPrice = parseFloat(price);
        if (isNaN(itemPrice)) {
          console.error("Invalid price. Please enter a valid number.");
          reject("Invalid price");
          return;
        }

        getFoodCategories()
          .then((categories: IFoodCategory[]) => {
            console.log("Available Categories:");
            categories.forEach((category: IFoodCategory) => {
              console.log(`${category.id}. ${category.name}`);
            });

            rl.question(
              "Enter the number corresponding to the Food Category: ",
              (categoryId) => {
                const category = categories.find(
                  (cat) => cat.id.toString() === categoryId
                );
                if (!category) {
                  console.error(
                    "Invalid category. Please choose a valid category."
                  );
                  reject("Invalid category");
                  return;
                }

                rl.question(
                  "Enter the meal type id: 1--> Breakfast , 2--> Lunch , 3--> Dinner",
                  (mealTypeId) => {
                    const foodItem: IFoodItem = {
                      name,
                      price: itemPrice,
                      availabilityStatus: true,
                      foodCategoryId: parseInt(categoryId),
                      mealTypeId: parseInt(mealTypeId),
                    };
                    resolve(foodItem);
                  }
                );
              }
            );
          })
          .catch((error) => {
            console.error("Error fetching categories:", error);
            console.log("Please try again.");
            reject("Error fetching categories");
          });
      });
    });
  });
};

const askFoodItemPreferences = (): Promise<IFoodItemPreference> => {
  return new Promise((resolve, reject) => {
    rl.question(
      `1) Please select one - ${Object.values(DietaryPreference).join(
        " / "
      )}: `,
      (preferenceTypeInput) => {
        const preferenceType = preferenceTypeInput
          .trim()
          .toLowerCase() as DietaryPreference;
        if (
          !Object.values(DietaryPreference)
            .map((p) => p.toLowerCase())
            .includes(preferenceType)
        ) {
          console.error("Invalid choice. Please select a valid option.");
          reject("Invalid dietary preference");
          return;
        }

        rl.question(
          "2) Please select your spice level - High / Medium / Low: ",
          (spiceLevelInput) => {
            const spiceLevel = spiceLevelInput
              .trim()
              .toLowerCase() as SpiceLevel;
            if (
              !Object.values(SpiceLevel)
                .map((s) => s.toLowerCase())
                .includes(spiceLevel)
            ) {
              console.error("Invalid choice. Please select a valid option.");
              reject("Invalid spice level");
              return;
            }

            rl.question(
              "3) What do you prefer most - North Indian / South Indian / Other: ",
              (cuisineTypeInput) => {
                const cuisineType = cuisineTypeInput
                  .trim()
                  .toLowerCase() as CuisineType;
                if (
                  !Object.values(CuisineType)
                    .map((c) => c.toLowerCase())
                    .includes(cuisineType)
                ) {
                  console.error(
                    "Invalid choice. Please select a valid option."
                  );
                  reject("Invalid cuisine type");
                  return;
                }

                rl.question(
                  "4) Do you have a sweet tooth? (Yes / No): ",
                  (sweetToothInput) => {
                    const sweetTooth = sweetToothInput.trim().toLowerCase();
                    if (!["yes", "no"].includes(sweetTooth)) {
                      console.error(
                        "Invalid choice. Please select a valid option."
                      );
                      reject("Invalid sweet tooth");
                      return;
                    }

                    const preferences: IFoodItemPreference = {
                      dietaryPreference: preferenceType,
                      spiceLevel,
                      cuisineType,
                      sweetTooth: sweetTooth === "yes",
                    };
                    resolve(preferences);
                  }
                );
              }
            );
          }
        );
      }
    );
  });
};

export const updateFoodItem = async (role: Role) => {
  const itemName = await new Promise<string>((resolve) => {
    rl.question("Enter Food Item Name to update: ", (itemName) => {
      resolve(itemName);
    });
  });

  socket.emit("checkFoodItemExistence", itemName);

  socket.off("checkFoodItemExistenceResponse");
  socket.on(
    "checkFoodItemExistenceResponse",
    async (response: { exists: boolean }) => {
      if (!response.exists) {
        console.log(
          "Food item does not exist.Please enter some other Food Item"
        );
        updateFoodItem(role);
        return;
      }

      console.log("New Food Item Details:");
      const newFoodItem: IFoodItem = await askFoodItemDetails();
      const newFoodItemPreference: IFoodItemPreference = await askFoodItemPreferences();

      socket.emit("updateFoodItem", 
        itemName,
        newFoodItem,
        newFoodItemPreference
      );

      socket.off("updateFoodItemResponse");
      socket.on(
        "updateFoodItemResponse",
        (response: { success: boolean; message: string }) => {
          if (response.success) {
            console.log(`*${response.message}*`);
            requestMenu(role);
          } else {
            console.log(response.message);
            updateFoodItem(role);
          }
        }
      );
    }
  );
};

export const deleteFoodItem = async (role: Role) => {
  try {
    const itemName = await new Promise<string>((resolve) => {
      rl.question("Enter Food Item Name to delete: ", (itemName) => {
        resolve(itemName);
      });
    });

    socket.emit("deleteFoodItem", itemName);

    socket.off("deleteFoodItemResponse");
    socket.on(
      "deleteFoodItemResponse",
      (response: { success: boolean; message: string }) => {
        if (response.success) {
          console.log(`*${response.message}*`);
          socket.emit(
            "sendNotificationToChefAndEmployee",
            `${itemName} would not be available !`,
            false
          );
          socket.off("chefAndEmployeeNotificationResponse");
          socket.on("chefAndEmployeeNotificationResponse", (response) => {
            if (response.success) {
              console.log(response.message);
            } else {
              console.error(response.message);
            }
            requestMenu(role);
          });
        } else {
          console.log(response.message);
          deleteFoodItem(role);
        }
      }
    );
  } catch (error) {
    console.error("Error in deleting food item:", error);
    console.log("Please try again.");
    deleteFoodItem(role);
  }
};

export const viewMenu = async (role: Role) => {
  socket.emit("viewAllFoodItems");

  socket.off("viewAllFoodItemsResponse");
  socket.on("viewAllFoodItemsResponse", (data) => {
    if (data.error) {
      console.error("Error fetching menu:", data.error);
      return;
    }

    if (data.foodItems && data.foodItems.length > 0) {
      console.log("Complete Menu:");
      const formattedFoodItems: IMenuItem[] = data.foodItems.map(
        (foodItem: IMenuItem) => ({
          id: foodItem.id,
          name: foodItem.name,
          price: foodItem.price,
          availabilityStatus: foodItem.availabilityStatus,
          categoryName: foodItem.categoryName,
          mealType: foodItem.mealType,
        })
      );

      console.table(formattedFoodItems);
      requestMenu(role);
    } else {
      console.log("No menu items found.");
      requestMenu(role);
    }
  });
};

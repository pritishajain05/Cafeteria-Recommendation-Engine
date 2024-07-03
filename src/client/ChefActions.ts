import { MealType } from "../enum/MealType";
import { Role } from "../enum/Role";
import { IDiscardFoodItem } from "../interface/IDiscardFoodItem";
import { IMenuItem } from "../interface/IFoodItem";
import { IRolledOutFoodItem } from "../interface/IRolledOutFoodItem";
import { socket } from "./client";
import { requestMenu, rl } from "./clientOperation";

export const viewRecommendedFoodItems = async (role: Role , employeeId:number) => {
  socket.emit("viewRecommendedFoodItems");

  let itemsFound = false;

  socket.off("recommendedFoodItemsResponse");
  socket.on("recommendedFoodItemsResponse", (data) => {
    if (data.error) {
      console.error("Error fetching recommended food items:", data.error);
      return;
    }

    if (data.topBreakfastItems && data.topBreakfastItems.length > 0) {
      console.log("Recommended Breakfast Items:");
      console.table(data.topBreakfastItems);
      itemsFound = true;
    }

    if (data.topLunchItems && data.topLunchItems.length > 0) {
      console.log("Recommended Lunch Items:");
      console.table(data.topLunchItems);
      itemsFound = true;
    }

    if (data.topDinnerItems && data.topDinnerItems.length > 0) {
      console.log("Recommended Dinner Items:");
      console.table(data.topDinnerItems);
      itemsFound = true;
    }

    if (!itemsFound) {
      console.log("No items for any meal found.");
    }
    requestMenu(role,employeeId);
  });
};

const promptUserForIds = (mealType: string) => {
  return new Promise<number[]>((resolve) => {
    rl.question(
      `Enter the IDs of ${mealType} items (comma-separated): `,
      (answer) => {
        const selectedItemIds = (answer as string)
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id));

        resolve(selectedItemIds);
      }
    );
  });
};

export const rollOutMenuForNextDay = async (role: Role , employeeId: number) => {
  socket.emit("checkRolledOutMenu");
  socket.once("checkRolledOutMenuResponse", (data) => {
    if (data.menuRolledOut) {
      console.log(
        "Menu has already been rolled out for today. You cannot roll out the menu again."
      );
      requestMenu(role,employeeId);
    } else {
      socket.emit("viewAllFoodItems");
      socket.on("viewAllFoodItemsResponse", (data) => {
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

        socket.emit("viewRecommendedFoodItems");
        socket.on("recommendedFoodItemsResponse", async (data) => {
          const breakfastItems = formattedFoodItems.filter((item) =>
            item.mealType.includes(MealType[MealType.Breakfast])
          );

          console.log("Breakfast Menu:");
          console.table(breakfastItems);
          console.log("\n \n Recommended Breakfast Items:");
          console.table(data.topBreakfastItems);
          const selectedBreakfastIds = await promptUserForIds("Breakfast");

          const lunchItems = formattedFoodItems.filter((item) =>
            item.mealType.includes(MealType[MealType.Lunch])
          );
          console.log("Lunch Menu:");
          console.table(lunchItems);
          console.log("\n \n Recommended Lunch Items:");
          console.table(data.topLunchItems);
          const selectedLunchIds = await promptUserForIds("Lunch");

          const dinnerItems = formattedFoodItems.filter((item) =>
            item.mealType.includes(MealType[MealType.Dinner])
          );
          console.log("Dinner Menu:");
          console.table(dinnerItems);
          console.log(" \n \n Recommended Dinner Items:");
          console.table(data.topDinnerItems);
          const selectedDinnerIds = await promptUserForIds("Dinner");

          const selectedIds = [
            ...selectedBreakfastIds,
            ...selectedLunchIds,
            ...selectedDinnerIds,
          ];

          socket.emit("storeSelectedIds", selectedIds);
          socket.off("storeSelectedIdsResponse");
          socket.on("storeSelectedIdsResponse", (response) => {
            if (response.success) {
              console.log(response.message);
              socket.emit(
                "sendNotificationToEmployees",
                "New menu has been rolled out for the next day.\n Press 1 --> Please vote for your preferred items.",
                false
              );
              socket.off("employeeNotificationResponse");
              socket.on("employeeNotificationResponse", (response) => {
                if (response.success) {
                  console.log(response.message);
                  requestMenu(role,employeeId);
                } else {
                  console.error(response.message);
                  requestMenu(role,employeeId);
                }
              });
            } else {
              console.error(response.message);
              requestMenu(role,employeeId);
            }
           
          });
        });
      });
    }
  });
};

export const finalizeFoodItemsForNextDay = async (role: Role ,employeeId:number) => {
  socket.emit("getRolledOutMenu");

  socket.off("rolledOutMenuResponse");
  socket.on("rolledOutMenuResponse", async (data) => {
    if (data.error) {
      console.error("Error fetching rolled out menu:", data.error);
      return;
    }

    const rolledOutMenu: IRolledOutFoodItem[] = data.rolledOutMenu;
    const topBreakfastItem = findTopVotedItem(rolledOutMenu, "Breakfast");
    const topLunchItem = findTopVotedItem(rolledOutMenu, "Lunch");
    const topDinnerItem = findTopVotedItem(rolledOutMenu, "Dinner");

    const finalizedItems = [
      topBreakfastItem,
      topLunchItem,
      topDinnerItem,
    ].filter((item) => item !== undefined);
    
    console.log("Tomorrow's Menu");
    console.log("Breakfast Item:");
    console.table(topBreakfastItem);

    console.log("Lunch Item:");
    console.table(topLunchItem);

    console.log("Dinner Item:");
    console.table(topDinnerItem);

    socket.emit("storeFinalizedItems", finalizedItems);

    socket.once("storefinalizedItemsResponse", (response) => {
      if (response.success) {
        console.log(response.message);
        socket.emit(
          "sendNotificationToEmployees",
          "Menu has been finalized for tomorrow ! \n Press 2 --> View final Menu",
          false
        );
        socket.off("employeeNotificationResponse");
        socket.on("employeeNotificationResponse", (response) => {
          if (response.success) {
            console.log(response.message);
            requestMenu(role,employeeId);
          } else {
            console.error(response.message);
            requestMenu(role,employeeId);
          }
        });
      } else {
        console.error(response.message);
      }
      
    });
  });
};

const findTopVotedItem = (
  menu: IRolledOutFoodItem[],
  mealType: string,
): IRolledOutFoodItem[] => {
  const filteredItems = menu.filter((item) => item.mealType === mealType);
  if (filteredItems.length === 0) {
    return [];
  }
  return filteredItems
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 2);
};

export const viewDiscardFoodItems = async (role: Role , employeeId:number) => {
  socket.emit("getDiscardFooditems");
  socket.off("getDiscardFoodItemResponse");
  socket.on("getDiscardFoodItemResponse", (data) => {
  
    if (data.error) {
      console.error("Error fetching discard menu items:", data.error);
      return;
    }

    console.log("Discard Menu Item List:");
    console.table(
      data.discardFoodItems.map((item: IDiscardFoodItem) => {
        const { date, ...rest } = item;
        return { ...rest, date: date ? new Date(date).toLocaleDateString() : "N/A" };
      })
    );

    rl.question(
      `Would you like to \n (1) Remove an item or \n (2) Get detailed feedback? or \n exit to return to main Menu `,
      async (answer) => {
        if (answer === "1") {
          rl.question(
            "Enter the name of the food item to remove from the menu: ",
            (itemName) => {
              socket.emit("deleteFoodItem", itemName);
              socket.off("deleteFoodItemResponse");
              socket.on("deleteFoodItemResponse", (response) => {
                if (response.success) {
                  console.log(response.message);
                } else {
                  console.error(response.message);
                }
              });
            }
          );
        } else if (answer === "2") {
          rl.question(
            "Enter the name of the food item to get detailed feedback: ",
            (itemName) => {
              const questions = [
                `What didn’t you like about ${itemName}?`,
                `How would you like ${itemName} to taste?`,
                `Share your mom’s recipe for ${itemName}.`,
              ];

              socket.emit('storeFeedbackQuestions', itemName, questions);

              socket.on('storeFeedbackQuestionsResponse', (response) => {
                if (response.success) {
                  console.log(`Questions stored successfully for ${itemName}.`);
                } else {
                  console.error(`Failed to store questions: ${response.message}`);
                }
              });

              const message = `We are trying to improve your experience with ${itemName}. Please provide your feedback and help us. \n
              Press 3 --> Give Detailed Feedback`;
              socket.emit("sendNotificationToEmployees", message, false);
              socket.off("employeeNotificationResponse");
              socket.on("employeeNotificationResponse", (response) => {
                if (response.success) {
                  console.log(
                    `Notification sent to employees to provide feedback on ${itemName}.`
                  );
                  requestMenu(role,employeeId);
                } else {
                  console.error(
                    `Failed to send notification: ${response.message}`
                  );
                }
              });
            }
          );
        } else if (answer === "exit") {
          requestMenu(role,employeeId);
        } else {
          console.log("Invalid choice. Please enter 1 or 2.");
        }
      }
    );
  });
};

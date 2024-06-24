import { MealType } from "../enum/MealType";
import { Role } from "../enum/Role";
import { IMenuItem } from "../interface/IFoodItem";
import { socket } from "./client";
import { requestMenu, rl } from "./clientOperation";

export const viewRecommendedFoodItems = async (role: Role) => {
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
    requestMenu(role);
  });
};

const promptUserForIds = (mealType: string) => {
    return new Promise<number[]>((resolve) => {
      rl.question(`Enter the IDs of ${mealType} items (comma-separated): `, (answer) => {
        const selectedItemIds = (answer as string).split(',')
          .map(id => parseInt(id.trim()))
          .filter(id => !isNaN(id));
  
        resolve(selectedItemIds);
      });
    });
}
  

export const rollOutMenuForNextDay = async (role: Role) => {
  socket.emit("viewAllFoodItems");
  socket.on("viewAllFoodItemsResponse", (data) => {
    const formattedFoodItems: IMenuItem[] = data.foodItems.map(
      (foodItem: IMenuItem) => ({
        id: foodItem.id,
        name: foodItem.name,
        price: foodItem.price,
        availabilityStatus: foodItem.availabilityStatus,
        categoryName: foodItem.categoryName,
        mealType:foodItem.mealType,
      })
    );


    socket.emit("viewRecommendedFoodItems");
    socket.on("recommendedFoodItemsResponse", async(data) => {
    
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

      const selectedIds = [ ...selectedBreakfastIds, ...selectedLunchIds, ...selectedDinnerIds];

    
      socket.emit("storeSelectedIds", selectedIds);
      socket.off("storeSelectedIdsResponse");
      socket.on("storeSelectedIdsResponse", (response) => {
        if (response.success) {
          console.log("Selected IDs stored successfully:", response.message);
          requestMenu(role);
        } else {
          console.error("Failed to store selected IDs:", response.message);
          requestMenu(role);
        }
    });
  });
});
}

import { MealType } from "../enum/MealType";
import { Role } from "../enum/Role";
import { IMenuItem, IRolledOutmenu } from "../interface/IFoodItem";
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

export const rollOutMenuForNextDay = async (role: Role) => {
  socket.emit("checkRolledOutMenu");
  socket.once("checkRolledOutMenuResponse", (data) => {
    if (data.menuRolledOut) {
      console.log(
        "Menu has already been rolled out for today. You cannot roll out the menu again."
      );
      requestMenu(role);
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
              requestMenu(role);
            } else {
              console.error(response.message);
              requestMenu(role);
            }
          });
        });
      });
    }
  });
};

export const finalizeFoodItems = async (role: Role) => {
  socket.emit("getRolledOutMenu");

  socket.off("rolledOutMenuResponse");
  socket.on("rolledOutMenuResponse", async (data) => {
    if (data.error) {
      console.error("Error fetching rolled out menu:", data.error);
      return;
    }

    const rolledOutMenu: IRolledOutmenu[] = data.rolledOutMenu;

    console.log(rolledOutMenu);

    const topBreakfastItem = findTopVotedItem(rolledOutMenu, "Breakfast");
    const topLunchItem = findTopVotedItem(rolledOutMenu, "Lunch");
    const topDinnerItem = findTopVotedItem(rolledOutMenu, "Dinner");

    const finalizedItems = [
      topBreakfastItem,
      topLunchItem,
      topDinnerItem,
    ].filter((item) => item !== undefined);
    console.log(finalizedItems, "finalmenu");

    console.log("Tomorrow's Menu");
    console.log("Breakfast Item:");
    console.table([topBreakfastItem]);

    console.log("Lunch Item:");
    console.table([topLunchItem]);

    console.log("Dinner Item:");
    console.table([topDinnerItem]);

    socket.emit("storeFinalizedItems", finalizedItems);

    socket.on("storefinalizedItemsResponse", (response) => {
      if (response.success) {
        console.log(response.message);
        requestMenu(role);
      } else {
        console.error(response.message);
        requestMenu(role);
      }
    });
  });
};

const findTopVotedItem = (
  menu: IRolledOutmenu[],
  mealType: string
): IRolledOutmenu | undefined => {
  const filteredItems = menu.filter((item) => item.mealType === mealType);
  if (filteredItems.length === 0) {
    return undefined;
  }
  return filteredItems.sort((a, b) => b.votes - a.votes)[0];
};

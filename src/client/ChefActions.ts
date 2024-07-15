import { MealType } from "../enum/MealType";
import { Role } from "../enum/Role";
import { IMenuItem } from "../interface/IFoodItem";
import { IRolledOutFoodItem } from "../interface/IRolledOutFoodItem";
import { requestMenu, socket } from "./client";
import { promptFoodItemIdsForFinalMenu, promptFoodItemIdsForRollOutMenu } from "./promptFunctions";

interface RecommendedFoodItemResponse {
  topBreakfastItems : IMenuItem[]
  topLunchItems : IMenuItem[]
  topDinnerItems : IMenuItem[]
  error ?:string
}
interface MessageResponse {
  success: boolean;
  message: string;
}

export const viewRecommendedFoodItems = async (role: Role , employeeId:number) => {
  socket.emit("viewRecommendedFoodItems");

  let itemsFound = false;

  socket.once("recommendedFoodItemsResponse", (response:RecommendedFoodItemResponse) => {
    if (response.error) {
      console.error(response.error);
      requestMenu(role,employeeId);
      return;
    }

    if (response.topBreakfastItems && response.topBreakfastItems.length > 0) {
      console.log("Recommended Breakfast Items:");
      console.table(response.topBreakfastItems);
      itemsFound = true;
    }

    if (response.topLunchItems && response.topLunchItems.length > 0) {
      console.log("Recommended Lunch Items:");
      console.table(response.topLunchItems);
      itemsFound = true;
    }

    if (response.topDinnerItems && response.topDinnerItems.length > 0) {
      console.log("Recommended Dinner Items:");
      console.table(response.topDinnerItems);
      itemsFound = true;
    }

    if (!itemsFound) {
      console.log("No items for any meal found.");
    }
    requestMenu(role,employeeId);
  });
};

export const rollOutMenuForNextDay = async (role: Role , employeeId: number) => {
  socket.emit("checkRolledOutMenu");
  socket.once("checkRolledOutMenuResponse", (response: {isMenuRolledOut:boolean , error ?:string}) => {
    if (response.error) {
      console.error(response.error);
      requestMenu(role, employeeId);
      return
    }
    if (response.isMenuRolledOut) {
      console.log(
        "Menu has already been rolled out for today. You cannot roll out the menu again."
      );
      requestMenu(role,employeeId);
    } else {
      socket.emit("viewAllFoodItems");
      socket.once("viewAllFoodItemsResponse", (response:{foodItems:IMenuItem[] , error?: string}) => {
        if (response.error) {
          console.error(response.error);
          requestMenu(role, employeeId);
          return;
        }
     
        const formattedFoodItems: IMenuItem[] = response.foodItems.map(
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
        socket.once("recommendedFoodItemsResponse", async (response:RecommendedFoodItemResponse) => {
          if (response.error) {
            console.error(response.error);
            requestMenu(role, employeeId);
            
          }
          const breakfastItems = formattedFoodItems.filter((item) =>
            item.mealType.includes(MealType[MealType.Breakfast])
          );

          console.log("Breakfast Menu:");
          console.table(breakfastItems);
          console.log("\n \n Recommended Breakfast Items:");
          console.table(response.topBreakfastItems);
          const selectedBreakfastIds = await promptFoodItemIdsForRollOutMenu("Breakfast");

          const lunchItems = formattedFoodItems.filter((item) =>
            item.mealType.includes(MealType[MealType.Lunch])
          );
          console.log("Lunch Menu:");
          console.table(lunchItems);
          console.log("\n \n Recommended Lunch Items:");
          console.table(response.topLunchItems);
          const selectedLunchIds = await promptFoodItemIdsForRollOutMenu("Lunch");

          const dinnerItems = formattedFoodItems.filter((item) =>
            item.mealType.includes(MealType[MealType.Dinner])
          );
          console.log("Dinner Menu:");
          console.table(dinnerItems);
          console.log(" \n \n Recommended Dinner Items:");
          console.table(response.topDinnerItems);
          const selectedDinnerIds = await promptFoodItemIdsForRollOutMenu("Dinner");

          const selectedIds = [
            ...selectedBreakfastIds,
            ...selectedLunchIds,
            ...selectedDinnerIds,
          ];

          socket.emit("storeSelectedIds",{selectedIds});
          socket.once("storeSelectedIdsResponse", (response:MessageResponse) => {
            if (response.success) {
              console.log(response.message);
              socket.emit(
                "sendNotificationToEmployees",
               { message:"New menu has been rolled out for the next day.\n Press 1 --> Please vote for your preferred items.",isSeen:false}
              );
              socket.once("employeeNotificationResponse", (notificationResponse :MessageResponse) => {
                if (notificationResponse.success) {
                  console.log(notificationResponse.message);
                  requestMenu(role,employeeId);
                } else {
                  console.error(notificationResponse.message);
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

export const finalizeFoodItemsForNextDay = async (role: Role, employeeId: number) =>{
  socket.emit("checkFinalMenu");
  socket.once("checkFinalMenuResponse", async (response:{ isFinalMenu: boolean, error?: string }) => {
    if (response.error) {
      console.error("Error checking final menu:",response.error);
      requestMenu(role, employeeId);
      return;
    }
    if (response.isFinalMenu) {
      console.log("Menu has already been finalized for today!");
      requestMenu(role, employeeId);
      return;
    }

    socket.emit("getRolledOutMenu");
    socket.once("rolledOutMenuResponse", async (response: { rolledOutMenu: IRolledOutFoodItem[], error?: string }) => {
      if (response.error) {
        console.error("Error fetching rolled out menu:", response.error);
        requestMenu(role, employeeId);
        return;
      }

      const rolledOutMenu: IRolledOutFoodItem[] = response.rolledOutMenu;

      if(rolledOutMenu.length === 0){
        console.log("You cannot finalize the menu right now since the mneu has not been rolled out till now!");
        requestMenu(role,employeeId);
        return;
      }
      rolledOutMenu.sort((a, b) => b.votes - a.votes);

      const breakfastItems = rolledOutMenu.filter((item) =>
        item.mealType.includes(MealType[MealType.Breakfast])
      );

      console.log("Breakfast Menu:");
      console.table(breakfastItems);

      const selectedBreakfastIds = await promptFoodItemIdsForFinalMenu("Breakfast");

      const lunchItems = rolledOutMenu.filter((item) =>
        item.mealType.includes(MealType[MealType.Lunch])
      );

      console.log("Lunch Menu:");
      console.table(lunchItems);

      const selectedLunchIds = await promptFoodItemIdsForFinalMenu("Lunch");

      const dinnerItems = rolledOutMenu.filter((item) =>
        item.mealType.includes(MealType[MealType.Dinner])
      );

      console.log("Dinner Menu:");
      console.table(dinnerItems);

      const selectedDinnerIds = await promptFoodItemIdsForFinalMenu("Dinner");

      const selectedIds = [
        ...selectedBreakfastIds,
        ...selectedLunchIds,
        ...selectedDinnerIds,
      ];

    
      socket.emit("storeFinalizedItems", {selectedIds});

      socket.once("storeFinalizedItemsResponse", (response:MessageResponse) => {
        if (response.success) {
          console.log(response.message);
          socket.emit(
            "sendNotificationToEmployees", { message: "Menu has been finalized for tomorrow! \n Press 2 --> View final Menu", isSeen: false }
          );

          socket.once("employeeNotificationResponse", (notificationResponse: MessageResponse) => {
            if (notificationResponse.success) {
              console.log(notificationResponse.message);
            } else {
              console.error(notificationResponse.message);
            }
            requestMenu(role, employeeId);
          });
        } else {
          console.error(response.message);
          requestMenu(role, employeeId);
        }
      });
    });
  });
};






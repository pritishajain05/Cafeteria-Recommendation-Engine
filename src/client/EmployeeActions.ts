import { Role } from "../enum/Role";
import { socket } from "./client";
import { IRolledOutmenu } from "./../interface/IFoodItem";
import { requestMenu, rl } from "./clientOperation";

const promptUserForIds = (mealType: string) => {
  return new Promise<number[]>((resolve) => {
    rl.question(
      `Vote for any 2 ${mealType} items (comma-separated): `,
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

export const selectFoodItemsForNextDay = async (role: Role) => {
  socket.emit("getRolledOutMenu");
  socket.on("rolledOutMenuResponse", async (data) => {
    if (data.error) {
      console.error("Error fetching rolled out menu:", data.error);
      return;
    }

    const rolledOutMenu: IRolledOutmenu[] = data.rolledOutMenu;

    const breakfastItems = rolledOutMenu.filter(
      (item: IRolledOutmenu) => item.mealType === "Breakfast"
    );
    const lunchItems = rolledOutMenu.filter(
      (item: IRolledOutmenu) => item.mealType === "Lunch"
    );
    const dinnerItems = rolledOutMenu.filter(
      (item: IRolledOutmenu) => item.mealType === "Dinner"
    );

    console.log("Breakfast Items:");
    console.table(breakfastItems);
    const votesBreakfastIds = await promptUserForIds("Breakfast");

    console.log("Lunch Items:");
    console.table(lunchItems);
    const votesLunchIds = await promptUserForIds("Lunch");

    console.log("Dinner Items:");
    console.table(dinnerItems);
    const votesDinnerIds = await promptUserForIds("Dinner");

    const votedIds = [
      ...votesBreakfastIds,
      ...votesLunchIds,
      ...votesDinnerIds,
    ];

    socket.emit("voteForItems", votedIds);
    socket.off("voteForItemsResponse");
    socket.on("voteForItemsResponse", (response) => {
      if (response.success) {
        console.log("Voted successfully:", response.message);
        requestMenu(role);
      } else {
        console.error("Failed to Vote:", response.message);
        requestMenu(role);
      }
    });
  });
};

export const viewFeedbackOnItem = async (role: Role) => {
  rl.question(
    "Enter the id of the fooditem you want to view feedback of:",
    (id) => {
      socket.emit("getFeedbackOnItem", id);

      socket.off("feedbackresponse");
      socket.on("feedbackresponse", (data) => {
        if (data.error) {
            console.error("Error fetching feedback:", data.error);
            return;
          }

          if(data.feedback && data.feedback.length>0){
            console.log(`Feedback for Food Item ID ${id}:`);
            console.table(data.feedback);
          }
          else{
            console.log("No feedbacks found for this item");
          }       
          requestMenu(role);
      });
    }
  );
};

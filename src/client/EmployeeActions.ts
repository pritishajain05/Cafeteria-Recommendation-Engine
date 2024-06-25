import { Role } from "../enum/Role";
import { employeeId, socket } from "./client";
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

  socket.off("rolledOutMenuResponse");
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

        if (data.feedback && data.feedback.length > 0) {
          console.log(`Feedback for Food Item ID ${id}:`);
          console.table(data.feedback);
        } else {
          console.log("No feedbacks found for this item");
        }
        requestMenu(role);
      });
    }
  );
};

export const giveFeedbackOnItem = async (role: Role) => {
  rl.question(
    "Enter the ID of the food item you want to give feedback on: ",
    (foodItemId) => {
      if (isNaN(Number(foodItemId))) {
        console.error("Invalid ID. Please enter a valid number.");
        giveFeedbackOnItem(role);
      }

      rl.question("Enter your rating (1-5): ", (rating) => {
        if (isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
          console.error(
            "Invalid rating. Please enter a number between 1 and 5."
          );
          giveFeedbackOnItem(role);
        }

        rl.question("Enter your comment: ", (comment) => {
          socket.emit("addFeedbackOnItem", {
            employeeId,
            foodItemId: Number(foodItemId),
            rating: Number(rating),
            comment,
          });

          socket.off("addFeedbackresponse");
          socket.on("addFeedbackresponse", (response) => {
            if (response.success) {
              console.log(response.message);
              requestMenu(role);
            } else {
              console.error(response.message);
              giveFeedbackOnItem(role);
            }
          });
        });
      });
    }
  );
};

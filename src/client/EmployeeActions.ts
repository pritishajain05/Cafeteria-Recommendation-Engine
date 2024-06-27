import { Role } from "../enum/Role";
import { employeeId, socket } from "./client";
import { IFinalMenu, IRolledOutmenu } from "./../interface/IFoodItem";
import { requestMenu, rl } from "./clientOperation";
import { INotification } from "../interface/INotification";

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

export const viewNotification = async (role: Role) => {
  socket.emit("getNotifications", employeeId);

  socket.off("getNotificationsResponse");
  socket.on("getNotificationsResponse", (data) => {
    if (data.error) {
      console.error("Error fetching notifications:", data.error);
      return;
    }

    if (data.notifications && data.notifications.length > 0) {
      console.log("Notifications:");
      data.notifications.forEach((notification: INotification) => {
        console.log("-------------------");
        console.log(`Message: ${notification.message}`);
        console.log(`Date: ${notification.date}`);
        console.log("-------------------");

        if (!notification.isSeen) {
          socket.emit("markNotificationAsSeen", {
            notificationId: notification.id,
            employeeId: employeeId,
          });    
        }
      });

      rl.question(
        "Enter your choice: \n Type exit to return to main menu",
        (choice) => {
          switch (choice) {
            case "1":
              selectFoodItemsForNextDay(role);
              break;
            case "2":
              viewFinalMenu(role);
              break;
            case "exit":
              requestMenu(role);
              break;
            default:
              console.log("Invalid choice. Please enter 1 or 2.");
              viewNotification(role);
          }
        }
      );
    } else {
      console.log("No new notifications.");
      requestMenu(role);
    }
  });
};

const viewFinalMenu = async (role: Role) => {
  socket.emit("getFinalizedMenu");

  socket.off("finalizedMenuResponse");
  socket.on("finalizedMenuResponse", (data) => {
    if (data.error) {
      console.error("Error fetching final menu:", data.error);
      return;
    }

    if (data.finalMenu && data.finalMenu.length > 0) {
      console.log("Finalized Menu for Tomorrow:");
      const breakfastItems = data.filter(
        (item: IFinalMenu) => item.mealType === "Breakfast"
      );
      const lunchItems = data.filter(
        (item: IFinalMenu) => item.mealType === "Lunch"
      );
      const dinnerItems = data.filter(
        (item: IFinalMenu) => item.mealType === "Dinner"
      );

      console.log("Breakfast Items:");
      console.table(breakfastItems);

      console.log("Lunch Items:");
      console.table(lunchItems);

      console.log("Dinner Items:");
      console.table(dinnerItems);

      viewNotification(role);
    } else {
      console.log("No finalized menu available.");
      viewNotification(role);
    }
  });
};

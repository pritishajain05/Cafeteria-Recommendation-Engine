import { Role } from "../enum/Role";
import { IDiscardFoodItem } from "../interface/IDiscardFoodItem";
import { IFeedback } from "../interface/IFeedback";
import { IMenuItem } from "../interface/IFoodItem";
import { INotification } from "../interface/INotification";
import { requestMenu, socket } from "./client";
import {
  promptActionAfterViewingDiscardItems,
  promptDiscardedItemIdForFeedback,
  promptFeedbackItemId,
  promptFoodItemNameToRemove,
  promptUserChoiceFromNotification,
} from "./promptFunctions";

interface MessageResponse {
  success: boolean;
  message: string;
}

export const viewMenu = async (role: Role, employeeId: number) => {
  socket.emit("viewAllFoodItems");
  socket.once("viewAllFoodItemsResponse", (response: { foodItems: IMenuItem[]; error?: string }) => {
    if (response.error) {
      console.error("Error fetching menu:", response.error);
      requestMenu(role, employeeId);
      return;
    }

    if (response.foodItems && response.foodItems.length > 0) {
      console.log("Complete Menu:");
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

      console.table(formattedFoodItems);
      requestMenu(role, employeeId);
    } else {
      console.log("No menu items found.");
      requestMenu(role, employeeId);
    }
  });
};

export const viewFeedbackOnItem = async (role: Role, employeeId: number) => {
  const id = await promptFeedbackItemId();
  socket.emit("viewFeedbackOnItem", { id });
  socket.once("feedbackResponse", (response: { feedback: IFeedback[]; error?: string }) => {
    if (response.error) {
      console.error("Error fetching feedback:", response.error);
      requestMenu(role, employeeId);
      return;
    }

    if (response.feedback && response.feedback.length > 0) {
      console.log(`Feedback for Food Item ID ${id}:`);
      console.table(
        response.feedback.map((feedback: IFeedback) => {
          const { employeeId, date, ...rest } = feedback;
          return { ...rest, date: new Date(date).toLocaleDateString() };
        })
      );
    } else {
      console.log("No feedbacks found for this item");
    }
    requestMenu(role, employeeId);
  });
};

export const viewDiscardFoodItems = async (role: Role, employeeId: number) => {
  socket.emit("getDiscardFooditems");

  socket.once("getDiscardFoodItemResponse", async (response: { discardFoodItems: IDiscardFoodItem[]; error?: string }) => {
    if (response.error) {
      console.error("Error fetching discard menu items:", response.error);
      requestMenu(role, employeeId);
      return;
    }

    console.log("Discard Menu Item List:");
    console.table(
      response.discardFoodItems.map((item: IDiscardFoodItem) => {
        const { date, ...rest } = item;
        return {
          ...rest,
          date: date ? new Date(date).toLocaleDateString() : "N/A",
        };
      })
    );

    do {
     const actionChoice = await promptActionAfterViewingDiscardItems();
  
      if (actionChoice === "1") {
        const itemName = await promptFoodItemNameToRemove();
        socket.emit("deleteDiscardFoodItem", { itemName });
        socket.once("deleteDiscardFoodItemResponse", (response: MessageResponse) => {
          if (response.success) {
            console.log(response.message);
            requestMenu(role, employeeId);
          } else {
            console.error(response.message);
          }
        });
        break;
      } else if (actionChoice === "2") {
        const discardedItemId = await promptDiscardedItemIdForFeedback();
        const discardFoodItem = response.discardFoodItems.find(
          (item: IDiscardFoodItem) => item.id === discardedItemId
        );
  
        if (!discardFoodItem) {
          console.error(`No discarded item found with the ID ${discardedItemId}.`);
          return;
        }
  
        const itemName = discardFoodItem.foodItemName;
  
        const questions = [
          `What didn’t you like about ${itemName}?`,
          `How would you like ${itemName} to taste?`,
          `Share your mom’s recipe for ${itemName}.`,
        ];

        socket.emit("storeFeedbackQuestions", { itemName, questions, discardedItemId });
  
        socket.once("storeFeedbackQuestionsResponse", (response: MessageResponse) => {
          if (response.success) {
            console.log(`Questions stored successfully for ${itemName}.`);
          } else {
            console.error(`${response.message}`);
          }
        });
  
        const message = `We are trying to improve your experience with ${itemName}. Please provide your feedback and help us. \n
                  Press 3 --> Give Detailed Feedback`;
        socket.emit("sendNotificationToEmployees", { message, isSeen: false });
        socket.once("employeeNotificationResponse", (response: MessageResponse) => {
          if (response.success) {
            console.log(`Notification sent to employees to provide feedback on ${itemName}.`);
            requestMenu(role, employeeId);
          } else {
            console.error(`Failed to send notification: ${response.message}`);
          }
        });
        break;
      } else if (actionChoice === "exit") {
        requestMenu(role, employeeId);
        break;
      } else {
        console.log("Invalid choice. Please enter 1 or 2.");
      }
    } while (true);
  })
};

export const viewNotification = async (role: Role, employeeId: number) => {
  socket.emit("getNotifications", { employeeId });
  socket.once("getNotificationsResponse", (response: { notifications: INotification[]; error?: string }) => {
    if (response.error) {
      console.error("Error fetching notifications:", response.error);
      requestMenu(role, employeeId);
      return;
    }

    if (response.notifications && response.notifications.length > 0) {
      console.log("Notifications:");
      response.notifications.forEach((notification: INotification) => {
        console.log("-------------------");
        console.log(`Message: ${notification.message}`);
        console.log(`Date: ${new Date(notification.date).toLocaleDateString()}`);
        console.log("-------------------");

        if (!notification.isSeen) {
          socket.emit("markNotificationAsSeen", {
            notificationId: notification.id,
            employeeId: employeeId,
          });
        }
      });

      promptUserChoiceFromNotification(role, employeeId);
    } else {
      console.log("No new notifications.");
      requestMenu(role, employeeId);
    }
  });
};

export const handleLogout = async (role: Role, employeeId: number) => {
  socket.emit("logout", { employeeId });
  socket.once("logoutResponse", (response: MessageResponse) => {
    if (response.success) {
      console.log(response.message);
      socket.disconnect();
    } else {
      console.log(response.message);
      requestMenu(role, employeeId);
    }
  });
};

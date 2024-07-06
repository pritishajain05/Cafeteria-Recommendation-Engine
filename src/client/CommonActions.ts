import { Role } from "../enum/Role";
import { IDiscardFoodItem } from "../interface/IDiscardFoodItem";
import { IFeedback } from "../interface/IFeedback";
import { IMenuItem } from "../interface/IFoodItem";
import { INotification } from "../interface/INotification";
import { requestMenu, socket } from "./client";
import { promptActionAfterViewingDiscardItems, promptDiscardedItemIdForFeedback, promptFeedbackItemId, promptFoodItemNameToRemove, promptUserChoiceFromNotification } from "./promptFunctions";

export const viewMenu = async (role: Role,employeeId:number) => {
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
        requestMenu(role,employeeId);
      } else {
        console.log("No menu items found.");
        requestMenu(role,employeeId);
      }
    });
  };

  export const viewFeedbackOnItem = async (role: Role, employeeId: number) => {
    const id = promptFeedbackItemId();
    socket.emit("getFeedbackOnItem", id);
  
    socket.off("feedbackresponse");
    socket.on("feedbackresponse", (data) => {
      if (data.error) {
        console.error("Error fetching feedback:", data.error);
        return;
      }
  
      if (data.feedback && data.feedback.length > 0) {
        console.log(`Feedback for Food Item ID ${id}:`);
        console.table(
          data.feedback.map((feedback: IFeedback) => {
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
  
  export const viewDiscardFoodItems = async (role: Role , employeeId:number) => {
    socket.emit("getDiscardFooditems");

    socket.once("getDiscardFoodItemResponse", async (data) => {
    
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
  
      const actionChoice = await promptActionAfterViewingDiscardItems();
     
          if (actionChoice === "1") {
            const itemName = await promptFoodItemNameToRemove();
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
            else if (actionChoice === "2") {
              const discardedItemId = await promptDiscardedItemIdForFeedback();
                  const discardFoodItem = data.discardFoodItems.find(
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
  
                socket.emit('storeFeedbackQuestions', itemName, questions , discardFoodItem.id);
  
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
           else if (actionChoice === "exit") {
            requestMenu(role,employeeId);
          } else {
            console.log("Invalid choice. Please enter 1 or 2.");
          }
        }
      );
    }

    export const viewNotification = async (role: Role, employeeId: number) => {
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
              console.log(
                `Date: ${new Date(notification.date).toLocaleDateString()}`
              );
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
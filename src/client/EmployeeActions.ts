import { Role } from "../enum/Role";
import { employeeId, socket } from "./client";
import { IFinalMenu, IRolledOutmenu } from "./../interface/IFoodItem";
import { requestMenu, rl } from "./clientOperation";
import { INotification } from "../interface/INotification";
import { DietaryPreference } from "../enum/UserPreferences";
import { IDetailedFeedbackAnswer, IDetailedFeedbackQuestion } from "../interface/IFeedback";


const promptUserForIds = (mealType: string) => {
  return new Promise<number[]>((resolve) => {
    rl.question(
      `Vote for any 2 ${mealType} items (comma-separated foodItemid): `,
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
        "Enter your choice: \nType exit to return to main menu",
        (choice) => {
          switch (choice) {
            case "1":
              selectFoodItemsForNextDay(role);
              break;
            case "2":
              viewFinalMenu(role);
              break;
            case "3":
              giveDetailedFeedback(role);
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

export const viewFinalMenu = async (role: Role) => {
  socket.emit("getFinalizedMenu");

  socket.off("finalizedMenuResponse");
  socket.on("finalizedMenuResponse", (data) => {
    if (data.error) {
      console.error("Error fetching final menu:", data.error);
      return;
    }

    if (data.finalMenu && data.finalMenu.length > 0) {
      console.log("Finalized Menu for Tomorrow:");
      const breakfastItems = data.finalMenu.filter(
        (item: IFinalMenu) => item.mealType === "Breakfast"
      );
      const lunchItems = data.finalMenu.filter(
        (item: IFinalMenu) => item.mealType === "Lunch"
      );
      const dinnerItems = data.finalMenu.filter(
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

export const giveDetailedFeedback = async (role: Role) => {
  socket.emit("getFeedbackQuestions");

  socket.once("feedbackQuestionsResponse", async (data) => {
    if (data.error) {
      console.error("Error fetching feedback questions:", data.error);
      return;
    }

    const allQuestions: IDetailedFeedbackQuestion[] = data.questions;

    socket.emit("getEmployeeFeedbackAnswers", { employeeId: employeeId });

    socket.once("employeeFeedbackAnswersResponse", async (answerData) => {
      if (answerData.error) {
        console.error("Error fetching employee feedback answers:", answerData.error);
        return;
      }

      const answeredQuestionIds: number[] = answerData.answers.map(
        (answer: IDetailedFeedbackAnswer) => answer.questionId
      );

      const unansweredQuestions: IDetailedFeedbackQuestion[] = allQuestions.filter(
        (question) => !answeredQuestionIds.includes(question.id)
      );

      const answers: IDetailedFeedbackAnswer[] = [];

      const askQuestion = async (index: number): Promise<void> => {
        if (index >= unansweredQuestions.length) {
          socket.emit("storeFeedbackAnswers", answers);
          socket.once("storeFeedbackAnswersResponse", (response) => {
            if (response.success) {
              console.log("Feedback answers stored successfully.");
              requestMenu(role);
            } else {
              console.error("Error storing feedback answers:", response.message);
            }
          });
          return;
        }

        const question = unansweredQuestions[index];
        rl.question(`${question.question} `, (answer) => {
          answers.push({
            questionId: question.id,
            employeeId: employeeId,
            answer: answer,
          });
          askQuestion(index + 1);
        });
      };

      await askQuestion(0);
    });
  });
};

export const updateProfile = async (role: Role) => {
  console.log("Please answer these questions to know your preferences");

  rl.question(
    `1) Please select one - ${Object.values(DietaryPreference).join(" / ")}: `,
    (preferenceType) => {
      if (!Object.values(DietaryPreference).includes(preferenceType as DietaryPreference)) {
        console.error("Invalid choice. Please select a valid option.");
        updateProfile(role);
        return;
      }

      rl.question("2) Please select your spice level - High / Medium / Low: ", (spiceLevel) => {
        if (!["High", "Medium", "Low"].includes(spiceLevel)) {
          console.error("Invalid choice. Please select a valid option.");
          updateProfile(role);
          return;
        }

        rl.question("3) What do you prefer most - North Indian / South Indian / Other: ", (cuisineType) => {
          if (!["North Indian", "South Indian", "Other"].includes(cuisineType)) {
            console.error("Invalid choice. Please select a valid option.");
            updateProfile(role);
            return;
          }

          rl.question("4) Do you have a sweet tooth? (Yes / No): ", (sweetTooth) => {
            if (!["Yes", "No"].includes(sweetTooth)) {
              console.error("Invalid choice. Please select a valid option.");
              updateProfile(role);
              return;
            }

            const preferences = {
              preferenceType,
              spiceLevel,
              cuisineType,
              sweetTooth: sweetTooth === "Yes",
            };

            socket.emit("updateUserPreferences", employeeId, preferences);
            socket.off("updateUserPreferencesResponse");
            socket.on("updateUserPreferencesResponse", (response) => {
              if (response.success) {
                console.log("Profile updated successfully!");
              } else {
                console.error("Failed to update profile:", response.message);
              }
              requestMenu(role);
            });
          });
        });
      });
    }
  );
};

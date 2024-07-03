import { Role } from "../enum/Role";
import { socket } from "./client";
import { requestMenu, rl } from "./clientOperation";
import { INotification } from "../interface/INotification";
import { CuisineType, DietaryPreference, SpiceLevel } from "../enum/UserPreferences";
import { IDetailedFeedbackAnswer, IDetailedFeedbackQuestion } from "../interface/IFeedback";
import { IFeedback } from './../interface/IFeedback';
import { IUserPreference } from "../interface/IUser";
import { IFoodItemPreference } from "../interface/IFoodItem";
import { IRolledOutFoodItem } from "../interface/IRolledOutFoodItem";
import { IFinalFoodItem } from "../interface/IFinalFoodItem";

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


const getUserPreferences = async (employeeId: number) : Promise<IUserPreference> => {
  return new Promise((resolve, reject) => {
    socket.emit("getUserPreferences", employeeId);
    socket.once("userPreferencesResponse", (data) => {
      if (data.error) {
        reject(data.error);
      } else {
        resolve(data.preferences);
      }
    });
  });
};

const getFoodItemPreferences = async () :Promise<IFoodItemPreference[]>=> {
  return new Promise((resolve, reject) => {
    socket.emit("getFoodItemPreferences");
    socket.once("foodItemPreferencesResponse", (data) => {
      if (data.error) {
        reject(data.error);
      } else {
        resolve(data.preferences);
      }
    });
  });
};


const sortMenuItems = (menuItems: IRolledOutFoodItem[], foodPreferences: IFoodItemPreference[], userPreferences: IUserPreference) => {
  const sortedItems = menuItems.sort((a, b) => {
    const prefA = foodPreferences.find((pref) => pref.foodItemId === a.foodItemId);
    const prefB = foodPreferences.find((pref) => pref.foodItemId === b.foodItemId);

    let scoreA = 0;
    let scoreB = 0;

    if (prefA) {
      if (prefA.dietaryPreference.toLowerCase() === userPreferences.dietaryPreference.toLowerCase()) scoreA++;
      if (prefA.spiceLevel.toLowerCase() === userPreferences.spiceLevel.toLowerCase()) scoreA++;
      if (prefA.cuisineType.toLowerCase() === userPreferences.cuisineType.toLowerCase()) scoreA++;
      if (prefA.sweetTooth === userPreferences.sweetTooth) scoreA++;
    }

    if (prefB) {
      if (prefB.dietaryPreference.toLowerCase() === userPreferences.dietaryPreference.toLowerCase()) scoreB++;
      if (prefB.spiceLevel.toLowerCase() === userPreferences.spiceLevel.toLowerCase()) scoreB++;
      if (prefB.cuisineType.toLowerCase() === userPreferences.cuisineType.toLowerCase()) scoreB++;
      if (prefB.sweetTooth === userPreferences.sweetTooth) scoreB++;
    }

    return scoreB - scoreA;
  });

  return sortedItems;
};


export const voteForFoodItemsForNextDay = async (role: Role ,employeeId:number,fromNotification:boolean) => {
  socket.emit("getRolledOutMenu");

  socket.off("rolledOutMenuResponse");
  socket.on("rolledOutMenuResponse", async (data) => {
    if (data.error) {
      console.error("Error fetching rolled out menu:", data.error);
      return;
    }

    const rolledOutMenu: IRolledOutFoodItem[] = data.rolledOutMenu;
  
    const userPreferences = await getUserPreferences(employeeId);
    const foodPreferences = await getFoodItemPreferences();

    const sortedBreakfastItems = sortMenuItems(
      rolledOutMenu.filter((item: IRolledOutFoodItem) => item.mealType === "Breakfast"),
      foodPreferences,
      userPreferences
    );

    const sortedLunchItems = sortMenuItems(
      rolledOutMenu.filter((item: IRolledOutFoodItem) => item.mealType === "Lunch"),
      foodPreferences,
      userPreferences
    );

    const sortedDinnerItems = sortMenuItems(
      rolledOutMenu.filter((item: IRolledOutFoodItem) => item.mealType === "Dinner"),
      foodPreferences,
      userPreferences
    );

   
    console.log("Breakfast Items:");
    console.table(sortedBreakfastItems.map(item => {
      const { id,votes, ...rest } = item;
      return rest;
    }));
    const votesBreakfastIds = await promptUserForIds("Breakfast");

    console.log("Lunch Items:");
    console.table(sortedLunchItems.map(item => {
      const { id,votes, ...rest } = item;
      return rest;
    }));
    const votesLunchIds = await promptUserForIds("Lunch");

    console.log("Dinner Items:");
    console.table(sortedDinnerItems.map(item => {
      const { id,votes, ...rest } = item;
      return rest;
    }));
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
        if (fromNotification) {
          askUserChoiceFromNotification(role, employeeId);
        } else {
          requestMenu(role, employeeId);
        }
      } else {
        console.error("Failed to Vote:", response.message);
        if (fromNotification) {
          askUserChoiceFromNotification(role, employeeId);
        } else {
          requestMenu(role, employeeId);
        }
      }
    });
  });
};

export const viewFeedbackOnItem = async (role: Role ,employeeId:number) => {
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
          console.table(data.feedback.map((feedback:IFeedback) => {
            const { employeeId, date, ...rest } = feedback;
              return { ...rest, date: new Date(date).toLocaleDateString() };
          }));
        } else {
          console.log("No feedbacks found for this item");
        }
        requestMenu(role,employeeId);
      });
    }
  );
};

export const giveFeedbackOnItem = async (role: Role ,employeeId:number) => {
  rl.question(
    "Enter the ID of the food item you want to give feedback on: ",
    (foodItemId) => {
      if (isNaN(Number(foodItemId))) {
        console.error("Invalid ID. Please enter a valid number.");
        giveFeedbackOnItem(role,employeeId);
      }

      rl.question("Enter your rating (1-5): ", (rating) => {
        if (isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
          console.error(
            "Invalid rating. Please enter a number between 1 and 5."
          );
          giveFeedbackOnItem(role,employeeId);
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
              requestMenu(role,employeeId);
            } else {
              console.error(response.message);
              giveFeedbackOnItem(role,employeeId);
            }
          });
        });
      });
    }
  );
};

export const viewNotification = async (role: Role ,employeeId:number) => {
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
        console.log(`Date: ${new Date(notification.date).toLocaleDateString()}`);
        console.log("-------------------");

        if (!notification.isSeen) {
          socket.emit("markNotificationAsSeen", {
            notificationId: notification.id,
            employeeId: employeeId,
          });    
        }
      });

      askUserChoiceFromNotification(role,employeeId);
      
    } else {
      console.log("No new notifications.");
      requestMenu(role,employeeId);
    }
  });
};

const askUserChoiceFromNotification =(role:Role , employeeId:number)=>{
  rl.question(
    "Enter your choice: \nType exit to return to main menu",
    (choice) => {
      switch (choice) {
        case "1":
          voteForFoodItemsForNextDay(role,employeeId,true);
          break;
        case "2":
          viewFinalMenu(role,employeeId,true);
          break;
        case "3":
          giveDetailedFeedback(role,employeeId,true);
          break;
        case "exit":
          requestMenu(role,employeeId);
          break;
        default:
          console.log("Invalid choice. Please enter 1 or 2.");
          askUserChoiceFromNotification(role,employeeId);
      }
    }
  )
}
export const viewFinalMenu = async (role: Role ,employeeId:number,fromNotification:boolean) => {
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
        (item: IFinalFoodItem) => item.mealType === "Breakfast"
      );
      const lunchItems = data.finalMenu.filter(
        (item: IFinalFoodItem) => item.mealType === "Lunch"
      );
      const dinnerItems = data.finalMenu.filter(
        (item: IFinalFoodItem) => item.mealType === "Dinner"
      );

      console.log("Breakfast Items:");
      console.table(breakfastItems);

      console.log("Lunch Items:");
      console.table(lunchItems);

      console.log("Dinner Items:");
      console.table(dinnerItems);

      if (fromNotification) {
        askUserChoiceFromNotification(role, employeeId);
      } else {
        requestMenu(role, employeeId);
      }

    } else {
      console.log("No finalized menu available.");
      requestMenu(role, employeeId);
    }
  });
};

export const giveDetailedFeedback = async (role: Role ,employeeId:number,fromNotification:boolean) => {
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

      if (unansweredQuestions.length === 0) {
        console.log("You have already given detailed feedback.");
        if (fromNotification) {
          askUserChoiceFromNotification(role, employeeId);
        } else {
          requestMenu(role, employeeId);
        }
        return;
      }

      const answers: IDetailedFeedbackAnswer[] = [];

      const askQuestion = async (index: number): Promise<void> => {
        if (index >= unansweredQuestions.length) {
          socket.emit("storeFeedbackAnswers", answers);
          socket.once("storeFeedbackAnswersResponse", (response) => {
            if (response.success) {
              console.log("Feedback answers stored successfully.");
              if (fromNotification) {
                askUserChoiceFromNotification(role, employeeId);
              } else {
                requestMenu(role, employeeId);
              }
            }else {
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


export const updateProfile = async (role: Role ,employeeId:number) => {
  console.log("Please answer these questions to know your preferences");

  rl.question(
    `1) Please select one - ${Object.values(DietaryPreference).join(" / ")}: `,
    (preferenceTypeInput) => {
      const preferenceType = preferenceTypeInput.trim().toLowerCase() as DietaryPreference;
      if (!Object.values(DietaryPreference).map(p => p.toLowerCase()).includes(preferenceType)) {
        console.error("Invalid choice. Please select a valid option.");
        updateProfile(role,employeeId);
        return;
      }

      rl.question("2) Please select your spice level - High / Medium / Low: ", (spiceLevelInput) => {
        const spiceLevel = spiceLevelInput.trim().toLowerCase() as SpiceLevel;
        if (!Object.values(SpiceLevel).map(s => s.toLowerCase()).includes(spiceLevel)) {
          console.error("Invalid choice. Please select a valid option.");
          updateProfile(role,employeeId);
          return;
        }

        rl.question("3) What do you prefer most - North Indian / South Indian / Other: ", (cuisineTypeInput) => {
          const cuisineType = cuisineTypeInput.trim().toLowerCase() as CuisineType;
          if (!Object.values(CuisineType).map(c => c.toLowerCase()).includes(cuisineType)) {
            console.error("Invalid choice. Please select a valid option.");
            updateProfile(role,employeeId);
            return;
          }

          rl.question("4) Do you have a sweet tooth? (Yes / No): ", (sweetToothInput) => {
            const sweetTooth = sweetToothInput.trim().toLowerCase();
            if (!["yes", "no"].includes(sweetTooth)) {
              console.error("Invalid choice. Please select a valid option.");
              updateProfile(role,employeeId);
              return;
            }

            const preferences = {
              dietaryPreference:preferenceType,
              spiceLevel,
              cuisineType:cuisineType,
              sweetTooth: sweetTooth === "yes",
            };

            socket.emit("updateUserPreferences", employeeId, preferences);
            socket.off("updateUserPreferencesResponse");
            socket.on("updateUserPreferencesResponse", (response) => {
              if (response.success) {
                console.log("Profile updated successfully!");
              } else {
                console.error("Failed to update profile:", response.message);
              }
              requestMenu(role,employeeId);
            });
          });
        });
      });
    }
  );
};

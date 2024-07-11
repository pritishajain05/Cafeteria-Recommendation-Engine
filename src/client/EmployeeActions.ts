import { Role } from "../enum/Role";
import { requestMenu, socket } from "./client";
import {
  IDetailedFeedbackAnswer,
  IDetailedFeedbackQuestion,
  IFeedback,
} from "../interface/IFeedback";
import { IUserPreference } from "../interface/IUser";
import { IFoodItemPreference } from "../interface/IFoodItem";
import { IRolledOutFoodItem } from "../interface/IRolledOutFoodItem";
import { IFinalFoodItem } from "../interface/IFinalFoodItem";
import {
  promptDetailedFeedbackAnswers,
  promptEmployeeToVoteForItems,
  promptFeedbackDetails,
  promptFoodItemPreferences,
  promptUserChoiceFromNotification,
} from "./promptFunctions";

interface MessageResponse {
  success: boolean;
  message: string;
}

const getUserPreferences = async (
  employeeId: number
): Promise<IUserPreference> => {
  return new Promise((resolve, reject) => {
    socket.emit("getUserPreferences", { employeeId });
    socket.once(
      "userPreferencesResponse",
      (response: { preferences: IUserPreference; error?: string }) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.preferences);
        }
      }
    );
  });
};

const getFoodItemPreferences = async (): Promise<IFoodItemPreference[]> => {
  return new Promise((resolve, reject) => {
    socket.emit("getFoodItemPreferences");
    socket.once(
      "foodItemPreferencesResponse",
      (response: { preferences: IFoodItemPreference[]; error?: string }) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.preferences);
        }
      }
    );
  });
};

const sortMenuItems = (
  menuItems: IRolledOutFoodItem[],
  foodPreferences: IFoodItemPreference[],
  userPreferences: IUserPreference
) => {
  const sortedItems = menuItems.sort((a, b) => {
    const prefA = foodPreferences.find(
      (pref) => pref.foodItemId === a.foodItemId
    );
    const prefB = foodPreferences.find(
      (pref) => pref.foodItemId === b.foodItemId
    );

    let scoreA = 0;
    let scoreB = 0;

    if (prefA) {
      if (
        prefA.dietaryPreference.toLowerCase() ===
        userPreferences.dietaryPreference.toLowerCase()
      )
        scoreA++;
      if (
        prefA.spiceLevel.toLowerCase() ===
        userPreferences.spiceLevel.toLowerCase()
      )
        scoreA++;
      if (
        prefA.cuisineType.toLowerCase() ===
        userPreferences.cuisineType.toLowerCase()
      )
        scoreA++;
      if (prefA.sweetTooth === userPreferences.sweetTooth) scoreA++;
    }

    if (prefB) {
      if (
        prefB.dietaryPreference.toLowerCase() ===
        userPreferences.dietaryPreference.toLowerCase()
      )
        scoreB++;
      if (
        prefB.spiceLevel.toLowerCase() ===
        userPreferences.spiceLevel.toLowerCase()
      )
        scoreB++;
      if (
        prefB.cuisineType.toLowerCase() ===
        userPreferences.cuisineType.toLowerCase()
      )
        scoreB++;
      if (prefB.sweetTooth === userPreferences.sweetTooth) scoreB++;
    }

    return scoreB - scoreA;
  });

  return sortedItems;
};

export const voteForFoodItemsForNextDay = async (
  role: Role,
  employeeId: number,
  fromNotification: boolean
) => {
  socket.emit("checkUserVotedToday", { employeeId });
  socket.once(
    "checkUserVotedTodayResponse",
    async (response: { hasVoted: boolean; error?: string }) => {
      if (response.error) {
        console.error("Error checking vote status:", response.error);
        if (fromNotification) {
          promptUserChoiceFromNotification(role, employeeId);
        } else {
          requestMenu(role, employeeId);
        }
        return;
      }

      if (response.hasVoted) {
        console.error("You have already voted today.");
        if (fromNotification) {
          promptUserChoiceFromNotification(role, employeeId);
        } else {
          requestMenu(role, employeeId);
        }
        return;
      }

      socket.emit("getRolledOutMenu");
      socket.once(
        "rolledOutMenuResponse",
        async (response: {
          rolledOutMenu: IRolledOutFoodItem[];
          error?: string;
        }) => {
          if (response.error) {
            console.error("Error fetching rolled out menu:", response.error);
            return;
          }

          const rolledOutMenu = response.rolledOutMenu;

          if (rolledOutMenu.length === 0) {
            console.log("Menu has not been rolled out till now!");
            requestMenu(role, employeeId);
            return;
          }

          const userPreferences = await getUserPreferences(employeeId);
          const foodPreferences = await getFoodItemPreferences();

          const sortedBreakfastItems = sortMenuItems(
            rolledOutMenu.filter(
              (item: IRolledOutFoodItem) => item.mealType === "Breakfast"
            ),
            foodPreferences,
            userPreferences
          );

          const sortedLunchItems = sortMenuItems(
            rolledOutMenu.filter(
              (item: IRolledOutFoodItem) => item.mealType === "Lunch"
            ),
            foodPreferences,
            userPreferences
          );

          const sortedDinnerItems = sortMenuItems(
            rolledOutMenu.filter(
              (item: IRolledOutFoodItem) => item.mealType === "Dinner"
            ),
            foodPreferences,
            userPreferences
          );

          console.log("Breakfast Items:");
          console.table(
            sortedBreakfastItems.map((item) => {
              const { id, votes, ...rest } = item;
              return rest;
            })
          );
          const votesBreakfastIds = await promptEmployeeToVoteForItems(
            "Breakfast"
          );

          console.log("Lunch Items:");
          console.table(
            sortedLunchItems.map((item) => {
              const { id, votes, ...rest } = item;
              return rest;
            })
          );
          const votesLunchIds = await promptEmployeeToVoteForItems("Lunch");

          console.log("Dinner Items:");
          console.table(
            sortedDinnerItems.map((item) => {
              const { id, votes, ...rest } = item;
              return rest;
            })
          );
          const votesDinnerIds = await promptEmployeeToVoteForItems("Dinner");

          const votedIds = [
            ...votesBreakfastIds,
            ...votesLunchIds,
            ...votesDinnerIds,
          ];

          socket.emit("voteForItems", { votedIds });
          socket.once("voteForItemsResponse", (response: MessageResponse) => {
            if (response.success) {
              console.log("Voted successfully:", response.message);
              if (fromNotification) {
                promptUserChoiceFromNotification(role, employeeId);
              } else {
                requestMenu(role, employeeId);
              }
            } else {
              console.error("Failed to Vote:", response.message);
              if (fromNotification) {
                promptUserChoiceFromNotification(role, employeeId);
              } else {
                requestMenu(role, employeeId);
              }
            }
          });
        }
      );
    }
  );
};

export const giveFeedbackOnItem = async (role: Role, employeeId: number) => {
  const { foodItemId, rating, comment } = await promptFeedbackDetails();

  socket.emit("addFeedbackOnItem", {
    employeeId,
    foodItemId: Number(foodItemId),
    rating: Number(rating),
    comment,
  });
  socket.once("addFeedbackresponse", (response: MessageResponse) => {
    if (response.success) {
      console.log(response.message);
      requestMenu(role, employeeId);
    } else {
      console.error(response.message);
      giveFeedbackOnItem(role, employeeId);
    }
  });
};

export const viewFinalMenu = async (
  role: Role,
  employeeId: number,
  fromNotification: boolean
) => {
  socket.emit("getFinalizedMenu");
  socket.once(
    "finalizedMenuResponse",
    (response: { finalMenu: IFinalFoodItem[]; error?: string }) => {
      if (response.error) {
        console.error("Error fetching final menu:", response.error);
        return;
      }

      if (response.finalMenu && response.finalMenu.length > 0) {
        console.log("Finalized Menu for Tomorrow:");
        const breakfastItems = response.finalMenu.filter(
          (item: IFinalFoodItem) => item.mealType === "Breakfast"
        );
        const lunchItems = response.finalMenu.filter(
          (item: IFinalFoodItem) => item.mealType === "Lunch"
        );
        const dinnerItems = response.finalMenu.filter(
          (item: IFinalFoodItem) => item.mealType === "Dinner"
        );

        console.log("Breakfast Items:");
        console.table(breakfastItems);

        console.log("Lunch Items:");
        console.table(lunchItems);

        console.log("Dinner Items:");
        console.table(dinnerItems);

        if (fromNotification) {
          promptUserChoiceFromNotification(role, employeeId);
        } else {
          requestMenu(role, employeeId);
        }
      } else {
        console.log("No finalized menu available.");
        requestMenu(role, employeeId);
      }
    }
  );
};

export const giveDetailedFeedback = async (
  role: Role,
  employeeId: number,
  fromNotification: boolean
) => {
  socket.emit("getFeedbackQuestions");

  socket.once(
    "feedbackQuestionsResponse",
    async (response: {
      questions: IDetailedFeedbackQuestion[];
      error?: string;
    }) => {
      if (response.error) {
        console.error("Error fetching feedback questions:", response.error);
        return;
      }

      const allQuestions: IDetailedFeedbackQuestion[] = response.questions;

      socket.emit("getEmployeeFeedbackAnswers", { employeeId: employeeId });

      socket.once(
        "employeeFeedbackAnswersResponse",
        async (response: {
          answers: IDetailedFeedbackAnswer[];
          error?: string;
        }) => {
          if (response.error) {
            console.error(
              "Error fetching employee feedback answers:",
              response.error
            );
            return;
          }

          const answeredQuestionIds: number[] = response.answers.map(
            (answer: IDetailedFeedbackAnswer) => answer.questionId
          );

          const unansweredQuestions: IDetailedFeedbackQuestion[] =
            allQuestions.filter(
              (question) => !answeredQuestionIds.includes(question.id)
            );

          if (unansweredQuestions.length === 0) {
            console.log("You have already given detailed feedback.");
            if (fromNotification) {
              promptUserChoiceFromNotification(role, employeeId);
            } else {
              requestMenu(role, employeeId);
            }
            return;
          }

          const answers = await promptDetailedFeedbackAnswers(
            unansweredQuestions,
            employeeId
          );

          socket.emit("storeFeedbackAnswers", { answers });
          socket.once(
            "storeFeedbackAnswersResponse",
            (response: MessageResponse) => {
              if (response.success) {
                console.log("Feedback answers stored successfully.");
                if (fromNotification) {
                  promptUserChoiceFromNotification(role, employeeId);
                } else {
                  requestMenu(role, employeeId);
                }
              } else {
                console.error(
                  "Error storing feedback answers:",
                  response.message
                );
              }
            }
          );
        }
      );
    }
  );
};

export const updateProfile = async (role: Role, employeeId: number) => {
  console.log("Please answer these questions to know your preferences");

  const preferences = await promptFoodItemPreferences();

  socket.emit("updateUserPreferences", { employeeId, preferences });
  socket.once("updateUserPreferencesResponse", (response: MessageResponse) => {
    if (response.success) {
      console.log("Profile updated successfully!");
    } else {
      console.error("Failed to update profile:", response.message);
    }
    requestMenu(role, employeeId);
  });
};

import { IFoodItem, IFoodItemPreference } from "../interface/IFoodItem";
import readline from "readline";
import {
  CuisineType,
  DietaryPreference,
  SpiceLevel,
} from "../enum/UserPreferences";
import { getFoodCategories } from "./AdminActions";
import { IFoodCategory } from "../interface/IFoodCategory";
import { Role } from "../enum/Role";
import { giveDetailedFeedback, viewFinalMenu, voteForFoodItemsForNextDay } from "./EmployeeActions";
import { IDetailedFeedbackAnswer, IDetailedFeedbackQuestion } from "../interface/IFeedback";
import { handleAdminOption, handleChefOption, handleEmployeeOption } from "./RoleBasedActions";
import { requestMenu } from "./client";

export const rl = readline.createInterface({
     input: process.stdin,
     output: process.stdout,
  });

export const getLoginInput = (): Promise<{ employeeId: string, name: string }> => {
  return new Promise((resolve) => {
    rl.question("Enter your employee ID: ", (employeeId) => {
      rl.question("Enter your name: ", (name) => {
        resolve({ employeeId, name });
      });
    });
  });
};

export const handleMenuOptionSelection = async (role: Role, employeeId: number) => {
  rl.question("Choose an option: ", async (option: string) => {
    switch (role) {
      case Role.Admin:
        await handleAdminOption(option, role, employeeId);
        break;
      case Role.Chef:
        await handleChefOption(option, role, employeeId);
        break;
      case Role.Employee:
        await handleEmployeeOption(option, role, employeeId);
        break;
      default:
        console.log("Invalid Role");
    }
  });
};

export const promptFoodItemDetails = (): Promise<IFoodItem> => {
  return new Promise((resolve, reject) => {
    rl.question("Enter Food Item Name: ", (name) => {
      rl.question("Enter Food Item Price: ", (price) => {
        const itemPrice = parseFloat(price);
        if (isNaN(itemPrice)) {
          console.error("Invalid price. Please enter a valid number.");
          reject("Invalid price");
          return;
        }

        getFoodCategories()
          .then((categories: IFoodCategory[]) => {
            console.log("Available Categories:");
            categories.forEach((category: IFoodCategory) => {
              console.log(`${category.id}. ${category.name}`);
            });

            rl.question(
              "Enter the number corresponding to the Food Category: ",
              (categoryId) => {
                const category = categories.find(
                  (cat) => cat.id.toString() === categoryId
                );
                if (!category) {
                  console.error(
                    "Invalid category. Please choose a valid category."
                  );
                  reject("Invalid category");
                  return;
                }

                rl.question(
                  "Enter the meal type id: 1--> Breakfast , 2--> Lunch , 3--> Dinner",
                  (mealTypeId) => {
                    const foodItem: IFoodItem = {
                      name,
                      price: itemPrice,
                      availabilityStatus: true,
                      foodCategoryId: parseInt(categoryId),
                      mealTypeId: parseInt(mealTypeId),
                    };
                    resolve(foodItem);
                  }
                );
              }
            );
          })
          .catch((error) => {
            console.error("Error fetching categories:", error);
            console.log("Please try again.");
            reject("Error fetching categories");
          });
      });
    });
  });
};

export const promptFoodItemPreferences = (): Promise<IFoodItemPreference> => {
  return new Promise((resolve, reject) => {
    rl.question(
      `1) Please select one - ${Object.values(DietaryPreference).join(
        " / "
      )}: `,
      (preferenceTypeInput) => {
        const preferenceType = preferenceTypeInput
          .trim()
          .toLowerCase() as DietaryPreference;
        if (
          !Object.values(DietaryPreference)
            .map((p) => p.toLowerCase())
            .includes(preferenceType)
        ) {
          console.error("Invalid choice. Please select a valid option.");
          reject("Invalid dietary preference");
          return;
        }

        rl.question(
          "2) Spice level - High / Medium / Low: ",
          (spiceLevelInput) => {
            const spiceLevel = spiceLevelInput
              .trim()
              .toLowerCase() as SpiceLevel;
            if (
              !Object.values(SpiceLevel)
                .map((s) => s.toLowerCase())
                .includes(spiceLevel)
            ) {
              console.error("Invalid choice. Please select a valid option.");
              reject("Invalid spice level");
              return;
            }

            rl.question(
              "3) Cuisine Type: North Indian / South Indian / Other: ",
              (cuisineTypeInput) => {
                const cuisineType = cuisineTypeInput
                  .trim()
                  .toLowerCase() as CuisineType;
                if (
                  !Object.values(CuisineType)
                    .map((c) => c.toLowerCase())
                    .includes(cuisineType)
                ) {
                  console.error(
                    "Invalid choice. Please select a valid option."
                  );
                  reject("Invalid cuisine type");
                  return;
                }

                rl.question(
                  "4) Sweet tooth? (Yes / No): ",
                  (sweetToothInput) => {
                    const sweetTooth = sweetToothInput.trim().toLowerCase();
                    if (!["yes", "no"].includes(sweetTooth)) {
                      console.error(
                        "Invalid choice. Please select a valid option."
                      );
                      reject("Invalid sweet tooth");
                      return;
                    }

                    const preferences: IFoodItemPreference = {
                      dietaryPreference: preferenceType,
                      spiceLevel,
                      cuisineType,
                      sweetTooth: sweetTooth === "yes",
                    };
                    resolve(preferences);
                  }
                );
              }
            );
          }
        );
      }
    );
  });
};

export const promptFoodItemNameToUpdate = () => {
  return new Promise<string>((resolve) => {
    rl.question("Enter Food Item Name to update: ", (itemName) => {
      resolve(itemName);
    });
  });
};

export const promptFoodItemNameToDelete = () => {
  return new Promise<string>((resolve) => {
    rl.question("Enter Food Item Name to delete: ", (itemName) => {
      resolve(itemName);
    });
  });
};

export const promptFoodItemIdsForRollOutMenu = (mealType: string) => {
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


export const promptFoodItemIdsForFinalMenu = (mealType: string) => {
  return new Promise<number[]>((resolve) => {
    rl.question(
      `Enter the IDs of ${mealType} items ( Any 2 comma-separated): `,
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

export const promptActionAfterViewingDiscardItems = (): Promise<string> => {
  return new Promise<string>((resolve) => {
    rl.question(
      `Would you like to \n (1) Remove an item or \n (2) Get detailed feedback? or \n exit to return to main Menu `,
      (answer) => {
        resolve(answer);
      }
    );
  });
};

export const promptFoodItemNameToRemove = (): Promise<string> => {
  return new Promise<string>((resolve) => {
    rl.question(
      "Enter the name of the food item to remove from the menu: ",
      (itemName) => {
        resolve(itemName);
      }
    );
  });
};

export const promptDiscardedItemIdForFeedback = (): Promise<number> => {
  return new Promise<number>((resolve) => {
    rl.question(
      "Enter the ID of the discarded food item to get detailed feedback: ",
      (itemId) => {
        resolve(parseInt(itemId));
      }
    );
  });
};

export const promptEmployeeToVoteForItems = (mealType: string) => {
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

  export const promptFeedbackItemId = (): Promise<number> => {
    return new Promise<number>((resolve) => {
      rl.question(
        "Enter the id of the food item you want to view feedback of:",
        (id) => {
          resolve(parseInt(id.trim()));
        }
      );
    });
  };

  export const promptFeedbackDetails = (): Promise<{ foodItemId: number, rating: number, comment: string }> => {
    return new Promise<{ foodItemId: number, rating: number, comment: string }>((resolve) => {
      rl.question("Enter the ID of the food item you want to give feedback on: ", (foodItemId) => {
        if (isNaN(Number(foodItemId))) {
          console.error("Invalid ID. Please enter a valid number.");
          return;
        }
  
        rl.question("Enter your rating (1-5): ", (rating) => {
          if (isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
            console.error("Invalid rating. Please enter a number between 1 and 5.");
            return;
          }
  
          rl.question("Enter your comment: ", (comment) => {
            resolve({
              foodItemId: Number(foodItemId),
              rating: Number(rating),
              comment: comment
            });
          });
        });
      });
    });
  };

export const promptUserChoiceFromNotification =(role:Role , employeeId:number)=>{
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
            promptUserChoiceFromNotification(role,employeeId);
        }
      }
    )
  };

  export const promptDetailedFeedbackAnswers = async (questions: IDetailedFeedbackQuestion[], employeeId: number): Promise<IDetailedFeedbackAnswer[]> => {
    const answers: IDetailedFeedbackAnswer[] = [];
  
    const askQuestion = async (index: number): Promise<void> => {
      if (index >= questions.length) {
        return;
      }
  
      const question = questions[index];
      return new Promise<void>((resolve) => {
        rl.question(`${question.question} `, (answer) => {
          answers.push({
            questionId: question.id,
            employeeId: employeeId,
            answer: answer,
          });
          resolve(askQuestion(index + 1));
        });
      });
    };
  
    await askQuestion(0);
    return answers;
  };
  
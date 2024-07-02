import { Server } from "socket.io";
import http from "http";
import { UserController } from "../controller/UserController";
import { showMenu } from "./MenuBasedOnRole";
import { AdminController } from "../controller/AdminController";
import { FoodItemService } from "../service/FoodItemService";
import { IFoodItem, IRolledOutmenu } from "../interface/IFoodItem";
import { FoodItemRepository } from "../repository/FoodItemRepository";
import { RecommendationService } from "../service/RecommendationService";
import { FeedbackService } from "../service/FeedbackService";
import { IFeedback } from "../interface/IFeedback";
import { NotificationService } from "../service/NotificationService";
import { UserService } from "../service/UserService";
import { IUserPreference } from "../interface/IUserPreference";

const server = http.createServer();
const io = new Server(server);

const userController = new UserController();
const adminController = new AdminController();
const foodItemService = new FoodItemService();
const foodItemRepository = new FoodItemRepository();
const recommendationService = new RecommendationService();
const feedbackService = new FeedbackService();
const notificationService = new NotificationService();
const userService = new UserService();

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("login", async (data) => {
    const user = await userController.login(data.id, data.name);

    if (user) {
      socket.emit("loginResponse", user);
    } else {
      socket.emit("loginResponse", { error: "Invalid credentials" });
    }
  });

  socket.on("getRoleBasedMenu", ({ role }) => {
    try {
      const menu = showMenu(role);
      socket.emit("menuResponse", { menu, role });
    } catch (error) {
      socket.emit("menuResponse", { error: "Invalid role." });
    }
  });

  socket.on("checkFoodItemExistence", async (itemName: string) => {
    try {
      const exists = await foodItemRepository.checkFoodItemExistence(itemName);
      socket.emit("checkFoodItemExistenceResponse", { exists });
    } catch (error) {
      console.error("Error checking food item existence:", error);
      socket.emit("checkFoodItemExistenceResponse", {
        exists: false,
        error: "Error checking existence",
      });
    }
  });

  socket.on("updateFoodItem", async ({ itemName, updatedFoodItem }) => {
    try {
      const result = await foodItemService.updateFoodItem(
        itemName,
        updatedFoodItem
      );
      socket.emit("updateFoodItemResponse", {
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      console.error("Error updating food item:", error);
      socket.emit("updateFoodItemResponse", {
        success: false,
        message: `Failed to update food item: ${error}`,
      });
    }
  });

  socket.on("deleteFoodItem", async (itemName: string) => {
    try {
      const result = await adminController.deleteFoodItem(itemName);
      socket.emit("deleteFoodItemResponse", {
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      socket.emit("deleteFoodItemResponse", { message: error });
    }
  });

  socket.on("addFoodItem", async (foodItem: IFoodItem) => {
    try {
      const result = await adminController.addFoodItem(foodItem);
      socket.emit("addFoodItemResponse", {
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      socket.emit("addFoodItemResponse", { message: error });
    }
  });

  socket.on("getFoodCategories", async () => {
    try {
      const foodCategories = await foodItemService.getAllCategories();
      socket.emit("foodCategoryResponse", { foodCategories });
    } catch (error) {
      socket.emit("foodCategoryResponse", { error });
    }
  });

  socket.on("viewAllFoodItems", async () => {
    try {
      const foodItems = await foodItemService.viewAllFoodItems();
      socket.emit("viewAllFoodItemsResponse", { foodItems });
    } catch (error) {
      console.error("Error fetching menu:", error);
      socket.emit("viewAllFoodItemsResponse", {
        error: "Failed to fetch food Items",
      });
    }
  });

  socket.on("viewRecommendedFoodItems", async () => {
    try {
      const { topBreakfastItems, topLunchItems, topDinnerItems } =
        await recommendationService.recommendationEngine();
      socket.emit("recommendedFoodItemsResponse", {
        topBreakfastItems,
        topLunchItems,
        topDinnerItems,
      });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      socket.emit("recommendedFoodItemsResponse", {
        error: "Failed to fetch recommended items",
      });
    }
  });

  socket.on("storeSelectedIds", async (selectedIds: number[]) => {
    try {
      const response = await foodItemService.addRolledOutItems(selectedIds);
      socket.emit("storeSelectedIdsResponse", {
        success: true,
        message: response.message,
      });
    } catch (error) {
      console.error("Error storing selected IDs:", error);
      socket.emit("storeSelectedIdsResponse", {
        success: false,
        message: "Failed to store selected IDs.",
      });
    }
  });

  socket.on("checkRolledOutMenu", async () => {
    try {
      const menuRolledOut = await foodItemService.checkRolledOutMenu();
      socket.emit("checkRolledOutMenuResponse", { menuRolledOut });
    } catch (error) {
      console.error("Error checking rolled out menu:", error);
      socket.emit("checkRolledOutMenuResponse", {
        error: "Error checking rolled out menu",
      });
    }
  });

  socket.on("getRolledOutMenu", async () => {
    try {
      const rolledOutMenu = await recommendationService.getRolledOutItemsWithFeedback();
      socket.emit("rolledOutMenuResponse", { rolledOutMenu });
    } catch (error) {
      console.log("Error in rolling out menu", error);
      socket.emit("rolledOutMenuResponse", { error });
    }
  });

  socket.on("voteForItems", async (selectedIds: number[]) => {
    try {
      const response = await foodItemService.voteForRolledOutItems(selectedIds);
      socket.emit("voteForItemsResponse", {
        success: true,
        message: response.message,
      });
    } catch (error) {
      console.error("Error storing selected IDs:", error);
      socket.emit("voteForItemsResponse", {
        success: false,
        message: "Failed to vote",
      });
    }
  });

  socket.on("getFeedbackOnItem", async (id: number) => {
    try {
      const feedback = await feedbackService.getFeedbackByFoodItemId(id);
      socket.emit("feedbackresponse", { feedback });
    } catch (error) {
      console.log("Error in getting feedback", error);
      socket.emit("feedbackResponse", { error });
    }
  });

  socket.on("storeFinalizedItems", async (data: IRolledOutmenu[]) => {
    try {
      const result = await foodItemService.addFinalFoodItem(data);
      socket.emit("storefinalizedItemsResponse", {
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      console.log("Error in storing final menu", error);
      socket.emit("storeFinalizedItemsResponse", {
        success: false,
        message: error,
      });
    }
  });

  socket.on("addFeedbackOnItem", async (data: IFeedback) => {
    try {
      const result = await feedbackService.addFeedbackOnItem(data);
      socket.emit("addFeedbackresponse", {
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      console.log("Error in adding feedback", error);
      socket.emit("addFeedbackresponse", { success: false, message: error });
    }
  });

  socket.on("sendNotificationToChefAndEmployee", async (message, isSeen) => {
    try {
      await notificationService.sendNotificationToChefAndEmployee(
        message,
        isSeen
      );
      socket.emit("chefAndEmployeeNotificationResponse", {
        success: true,
        message: "Notification sent to all users",
      });
    } catch (error) {
      socket.emit("chefAndEmployeeNotificationResponse", {
        success: false,
        message: `Failed to send notification: ${error}`,
      });
    }
  });

  socket.on("sendNotificationToEmployees", async (message, isSeen) => {
    try {
      await notificationService.sendNotificationToEmployees(message, isSeen);
      socket.emit("employeeNotificationResponse", {
        success: true,
        message: "Notification sent to employees",
      });
    } catch (error) {
      socket.emit("employeeNotificationResponse", {
        success: false,
        message: `Failed to send notification: ${error}`,
      });
    }
  });

  socket.on("getNotifications", async (employeeId) => {
    try {
      const notifications = await notificationService.getNotifications(
        employeeId
      );
      socket.emit("getNotificationsResponse", { notifications: notifications });
    } catch (error) {
      socket.emit("getNotificationsResponse", {
        error: "Failed to fetch notifications",
      });
    }
  });

  socket.on("getFinalizedMenu", async () => {
    try {
      const finalMenu = await foodItemService.getFinalFoodItem();
      socket.emit("finalizedMenuResponse", { finalMenu });
    } catch (error) {
      socket.emit("finalizedMenuResponse", { error });
    }
  });

  socket.on(
    "markNotificationAsSeen",
    async ({ notificationId, employeeId }) => {
      try {
        const response = await notificationService.markNotificationAsSeen(
          notificationId,
          employeeId
        );
        socket.emit("markNotificationAsSeenResponse", {
          success: response.success,
        });
      } catch (error) {
        socket.emit("markNotificationAsSeenResponse", { success: false });
      }
    }
  );

  socket.on("getDiscardFooditems", async () => {
    try {
      await recommendationService.getDiscardFoodItems();
      const discardFoodItems = await foodItemRepository.getDiscardFoodItems();
      socket.emit("getDiscardFoodItemResponse", {discardFoodItems});
    } catch (error) {
      console.error("Error generating discard items", error);
      socket.emit("getDiscardFoodItemResponse", {error:"error generating discard items"});
    }
  });

  socket.on(
    "updateUserPreferences",
    async (employeeId: number, preferences: IUserPreference) => {
      try {
        const response = await userService.updateUserPreferences(
          employeeId,
          preferences
        );
        socket.emit("updateUserPreferencesResponse", {success:response.success , message:response.message});
      } catch (error) {
        console.log(error);
        socket.emit("updateUserPreferencesResponse", {success: false , message:error});
      }
    }
  );

 
  socket.on("storeFeedbackQuestions", async (itemName:string, questions:string[]) => {
    try {
        const response = await feedbackService.storeDetailedFeedbackQuestions(itemName, questions);
        socket.emit("storeFeedbackQuestionsResponse", {
            success: response.success,
            message: response.message
        });
    } catch (error) {
        console.error(`Failed to store questions: ${error}`);
        socket.emit("storeFeedbackQuestionsResponse", {
            success: false,
            message: error
        });
    }
});

socket.on('getFeedbackQuestions', async () => {
  try {
    const questions = await feedbackService.getFeedbackQuestions();
    socket.emit('feedbackQuestionsResponse', { questions });
  } catch (error) {
    console.error('Error fetching feedback questions:', error);
    socket.emit('feedbackQuestionsResponse', { error });
  }
});

socket.on('getEmployeeFeedbackAnswers', async ({ employeeId }) => {
  try {
    const answers = await feedbackService.getEmployeeFeedbackAnswers(employeeId);
    socket.emit('employeeFeedbackAnswersResponse', { answers });
  } catch (error) {
    console.error('Error fetching employee feedback answers:', error);
    socket.emit('employeeFeedbackAnswersResponse', { error });
  }
});

socket.on('storeFeedbackAnswers', async (answers) => {
  try {
    await feedbackService.storeFeedbackAnswers(answers);
    socket.emit('storeFeedbackAnswersResponse', { success: true, message: 'Feedback answers stored successfully.' });
  } catch (error) {
    console.error('Error storing feedback answers:', error);
    socket.emit('storeFeedbackAnswersResponse', { success: false, message: error});
  }
});

socket.on("getUserPreferences", async (employeeId) => {
  try {
    const preferences = await userService.getUserPreferences(employeeId);
    socket.emit("userPreferencesResponse", { preferences });
  } catch (error) {
    socket.emit("userPreferencesResponse", { error: "Failed to fetch user preferences" });
  }
});

socket.on("getFoodItemPreferences", async () => {
  try {
    const preferences = await foodItemService.getAllFoodItemPreferences();
    socket.emit("foodItemPreferencesResponse", { preferences });
  } catch (error) {
    socket.emit("foodItemPreferencesResponse", { error: "Failed to fetch food item preferences" });
  }
});


  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

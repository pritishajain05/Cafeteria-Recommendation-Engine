import { Server as IOServer, Socket } from "socket.io";
import http from "http";
import { showMenu } from "./MenuBasedOnRole";
import { FoodItemService } from "../service/FoodItemService";
import { IFoodItem, IFoodItemPreference } from "../interface/IFoodItem";
import { RecommendationService } from "../service/RecommendationService";
import { FeedbackService } from "../service/FeedbackService";
import { IFeedback } from "../interface/IFeedback";
import { NotificationService } from "../service/NotificationService";
import { UserService } from "../service/UserService";
import { RolledOutFoodItemService } from "../service/RolledOuFoodItemService";
import { FinalFoodItemService } from "./../service/FinalFoodItemService";
import { DiscardFoodItemService } from "./../service/DiscardFoodItemService";
import { IRolledOutFoodItem } from "../interface/IRolledOutFoodItem";
import { IUserPreference } from "../interface/IUser";

class Server {
  private server: http.Server;
  private io: IOServer;

  private foodItemService: FoodItemService;
  private rolledOutFoodItemService: RolledOutFoodItemService;
  private finalFoodItemService: FinalFoodItemService;
  private discardFoodItemService: DiscardFoodItemService;
  private recommendationService: RecommendationService;
  private feedbackService: FeedbackService;
  private notificationService: NotificationService;
  private userService: UserService;

  constructor() {
    this.server = http.createServer();
    this.io = new IOServer(this.server);

    this.foodItemService = new FoodItemService();
    this.rolledOutFoodItemService = new RolledOutFoodItemService();
    this.finalFoodItemService = new FinalFoodItemService();
    this.discardFoodItemService = new DiscardFoodItemService();
    this.recommendationService = new RecommendationService();
    this.feedbackService = new FeedbackService();
    this.notificationService = new NotificationService();
    this.userService = new UserService();

    this.initializeSocket();
  }

  private initializeSocket() {
    this.io.on("connection", (socket: Socket) => {
      console.log("Client connected");

      socket.on("login", async (data) => {
        const user = await this.userService.login(data.id, data.name);

        if (user) {
          socket.emit("loginResponse", user);
        } else {
          socket.emit("loginResponse", { error: "Invalid credentials" });
        }
      });

      socket.on("getRoleBasedMenu", ({ role ,employeeId}) => {
        try {
          const menu = showMenu(role);
          socket.emit("menuResponse", { menu, role ,employeeId});
        } catch (error) {
          socket.emit("menuResponse", { error: "Invalid role." });
        }
      });

      socket.on("checkFoodItemExistence", async (itemName: string) => {
        try {
          const exists = await this.foodItemService.checkFoodItemExistence(
            itemName
          );
          socket.emit("checkFoodItemExistenceResponse", { exists });
        } catch (error) {
          console.error("Error checking food item existence:", error);
          socket.emit("checkFoodItemExistenceResponse", {
            exists: false,
            error: "Error checking existence",
          });
        }
      });

      socket.on(
        "addFoodItem",
        async (
          foodItem: IFoodItem,
          foodItemPreference: IFoodItemPreference
        ) => {
          try {
            const result = await this.foodItemService.addFoodItem(
              foodItem,
              foodItemPreference
            );
            socket.emit("addFoodItemResponse", {
              success: result.success,
              message: result.message,
            });
          } catch (error) {
            socket.emit("addFoodItemResponse", { message: error });
          }
        }
      );

      socket.on(
        "updateFoodItem",
        async (
          itemName: string,
          newFoodItem: IFoodItem,
          newFoodItemPreference: IFoodItemPreference
        ) => {
          try {
            const result = await this.foodItemService.updateFoodItem(
              itemName,
              newFoodItem,
              newFoodItemPreference
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
        }
      );

      socket.on("deleteFoodItem", async (itemName: string) => {
        try {
          const result = await this.foodItemService.deleteFoodItem(itemName);
          socket.emit("deleteFoodItemResponse", {
            success: result.success,
            message: result.message,
          });
        } catch (error) {
          socket.emit("deleteFoodItemResponse", { message: error });
        }
      });

      socket.on("getFoodCategories", async () => {
        try {
          const foodCategories = await this.foodItemService.getAllCategories();
          socket.emit("foodCategoryResponse", { foodCategories });
        } catch (error) {
          socket.emit("foodCategoryResponse", { error });
        }
      });

      socket.on("viewAllFoodItems", async () => {
        try {
          const foodItems = await this.foodItemService.getAllFoodItem();
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
            await this.recommendationService.recommendationEngine();
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
          const response = await this.rolledOutFoodItemService.addRolledOutItem(
            selectedIds
          );
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
          const menuRolledOut =
            await this.rolledOutFoodItemService.checkRolledOutMenu();
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
          const rolledOutMenu =
            await this.recommendationService.getRolledOutItemsWithFeedback();
          socket.emit("rolledOutMenuResponse", { rolledOutMenu });
        } catch (error) {
          console.log("Error in rolling out menu", error);
          socket.emit("rolledOutMenuResponse", { error });
        }
      });

      socket.on("voteForItems", async (selectedIds: number[]) => {
        try {
          const response =
            await this.rolledOutFoodItemService.voteForRolledOutItem(
              selectedIds
            );
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
          const feedback = await this.feedbackService.getFeedbackByFoodItemId(
            id
          );
          socket.emit("feedbackresponse", { feedback });
        } catch (error) {
          console.log("Error in getting feedback", error);
          socket.emit("feedbackResponse", { error });
        }
      });

      socket.on("storeFinalizedItems", async (data: IRolledOutFoodItem[][]) => {
        try {
          const result = await this.finalFoodItemService.addFinalFoodItem(data);
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
          const result = await this.feedbackService.addFeedbackOnItem(data);
          socket.emit("addFeedbackresponse", {
            success: result.success,
            message: result.message,
          });
        } catch (error) {
          console.log("Error in adding feedback", error);
          socket.emit("addFeedbackresponse", {
            success: false,
            message: error,
          });
        }
      });

      socket.on(
        "sendNotificationToChefAndEmployee",
        async (message, isSeen) => {
          try {
            await this.notificationService.sendNotificationToChefAndEmployee(
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
        }
      );

      socket.on("sendNotificationToEmployees", async (message, isSeen) => {
        try {
          await this.notificationService.sendNotificationToEmployees(
            message,
            isSeen
          );
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
          const notifications = await this.notificationService.getNotifications(
            employeeId
          );
          socket.emit("getNotificationsResponse", {
            notifications: notifications,
          });
        } catch (error) {
          socket.emit("getNotificationsResponse", {
            error: "Failed to fetch notifications",
          });
        }
      });

      socket.on("getFinalizedMenu", async () => {
        try {
          const finalMenu = await this.finalFoodItemService.getFinalFoodItem();
          socket.emit("finalizedMenuResponse", { finalMenu });
        } catch (error) {
          socket.emit("finalizedMenuResponse", { error });
        }
      });

      socket.on(
        "markNotificationAsSeen",
        async ({ notificationId, employeeId }) => {
          try {
            const response =
              await this.notificationService.markNotificationAsSeen(
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
          const alreadyGenerated = await this.discardFoodItemService.checkDiscardFoodItemsGenerated();
          if (!alreadyGenerated) {
            await this.recommendationService.getDiscardFoodItem();
          }
          const discardFoodItems =
            await this.discardFoodItemService.getDiscardFoodItem();
          socket.emit("getDiscardFoodItemResponse", { discardFoodItems });
        } catch (error) {
          console.error("Error generating discard items", error);
          socket.emit("getDiscardFoodItemResponse", {
            error: "error generating discard items",
          });
        }
      });

      socket.on(
        "updateUserPreferences",
        async (employeeId: number, preferences: IUserPreference) => {
          try {
            const response = await this.userService.updateUserPreferences(
              employeeId,
              preferences
            );
            socket.emit("updateUserPreferencesResponse", {
              success: response.success,
              message: response.message,
            });
          } catch (error) {
            console.log(error);
            socket.emit("updateUserPreferencesResponse", {
              success: false,
              message: error,
            });
          }
        }
      );

      socket.on(
        "storeFeedbackQuestions",
        async (itemName: string, questions: string[] , discardFoodItemId:number) => {
          try {
            const response =
              await this.feedbackService.storeDetailedFeedbackQuestions(
                itemName,
                questions,
                discardFoodItemId
              );
            socket.emit("storeFeedbackQuestionsResponse", {
              success: response.success,
              message: response.message,
            });
          } catch (error) {
            console.error(`Failed to store questions: ${error}`);
            socket.emit("storeFeedbackQuestionsResponse", {
              success: false,
              message: error,
            });
          }
        }
      );

      socket.on("getFeedbackQuestions", async () => {
        try {
          const questions = await this.feedbackService.getFeedbackQuestions();
          socket.emit("feedbackQuestionsResponse", { questions });
        } catch (error) {
          console.error("Error fetching feedback questions:", error);
          socket.emit("feedbackQuestionsResponse", { error });
        }
      });

      socket.on("getEmployeeFeedbackAnswers", async ({ employeeId }) => {
        try {
          const answers = await this.feedbackService.getEmployeeFeedbackAnswers(
            employeeId
          );
          socket.emit("employeeFeedbackAnswersResponse", { answers });
        } catch (error) {
          console.error("Error fetching employee feedback answers:", error);
          socket.emit("employeeFeedbackAnswersResponse", { error });
        }
      });

      socket.on("storeFeedbackAnswers", async (answers) => {
        try {
          await this.feedbackService.storeFeedbackAnswers(answers);
          socket.emit("storeFeedbackAnswersResponse", {
            success: true,
            message: "Feedback answers stored successfully.",
          });
        } catch (error) {
          console.error("Error storing feedback answers:", error);
          socket.emit("storeFeedbackAnswersResponse", {
            success: false,
            message: error,
          });
        }
      });

      socket.on("getUserPreferences", async (employeeId) => {
        try {
          const preferences = await this.userService.getUserPreference(
            employeeId
          );
          socket.emit("userPreferencesResponse", { preferences });
        } catch (error) {
          socket.emit("userPreferencesResponse", {
            error: "Failed to fetch user preferences",
          });
        }
      });

      socket.on("getFoodItemPreferences", async () => {
        try {
          const preferences =
            await this.foodItemService.getAllFoodItemPreferences();
          socket.emit("foodItemPreferencesResponse", { preferences });
        } catch (error) {
          socket.emit("foodItemPreferencesResponse", {
            error: "Failed to fetch food item preferences",
          });
        }
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  }

  public start(port: number) {
    this.server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  }
}

const server = new Server();
server.start(3000);

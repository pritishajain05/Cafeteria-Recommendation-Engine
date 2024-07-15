import { Server, Socket } from "socket.io";
import { FoodItemService } from "../service/FoodItemService";
import { FeedbackService } from "../service/FeedbackService";
import { IFoodItem, IFoodItemPreference } from "../interface/IFoodItem";
import { NotificationService } from "./../service/NotificationService";
import { UserActivityService } from "./../service/UserActivityService";
import { UserAction } from "../enum/UserAction";

export class AdminController {
  private foodItemService: FoodItemService;
  private feedbackService: FeedbackService;
  private notificationService: NotificationService;
  private userActivityService: UserActivityService;
  private socketEmployeeIdMapping: { [socketId: string]: number };

  constructor(
    io: Server,
    socketEmployeeIdMapping: { [socketId: string]: number }
  ) {
    this.foodItemService = new FoodItemService();
    this.feedbackService = new FeedbackService();
    this.notificationService = new NotificationService();
    this.userActivityService = new UserActivityService();
    this.socketEmployeeIdMapping = socketEmployeeIdMapping;
  }

  public initializeAdminHandlers(socket: Socket) {
    socket.on(
      "addFoodItem",
      (request: {
        foodItem: IFoodItem;
        foodItemPreference: IFoodItemPreference;
      }) => this.addFoodItem(socket, request)
    );
    socket.on(
      "updateFoodItem",
      (request: {
        itemName: string;
        newFoodItem: IFoodItem;
        newFoodItemPreference: IFoodItemPreference;
      }) => this.updateFoodItem(socket, request)
    );
    socket.on("deleteFoodItem", (request: { itemName: string }) =>
      this.deleteFoodItem(socket, request)
    );
    socket.on("getFoodCategories", () => this.getFoodCategories(socket));
    socket.on("checkFoodItemExistence", (request: { itemName: string }) =>
      this.checkFoodItemExistence(socket, request)
    );
    socket.on("viewAllFoodItems", () => this.viewAllFoodItems(socket));
    socket.on("viewFeedbackOnItem", (request: { id: number }) =>
      this.viewFeedbackOnItem(socket, request)
    );
    socket.on(
      "sendNotificationToChefAndEmployee",
      (request: { message: string; isSeen: boolean }) =>
        this.sendNotificationToChefAndEmployee(socket, request)
    );
  }

  private async addFoodItem(socket: Socket, request: {
    foodItem: IFoodItem;
    foodItemPreference: IFoodItemPreference;
  }) {
    try {
      const result = await this.foodItemService.addFoodItem(
        request.foodItem,
        request.foodItemPreference
      );
      socket.emit("addFoodItemResponse", {
        success: result.success,
        message: result.message,
      });
      await this.userActivityService.recordUserAction(
        this.socketEmployeeIdMapping[socket.id],
        UserAction.ADD_FOOD_ITEM
      );
    } catch (error) {
      socket.emit("addFoodItemResponse", {
        success: false,
        message: `Failed to add food item: ${error}`,
      });
    }
  }

  private async updateFoodItem(socket: Socket, request: {
    itemName: string;
    newFoodItem: IFoodItem;
    newFoodItemPreference: IFoodItemPreference;
  }) {
    try {
      const result = await this.foodItemService.updateFoodItem(
        request.itemName,
        request.newFoodItem,
        request.newFoodItemPreference
      );
      socket.emit("updateFoodItemResponse", {
        success: result.success,
        message: result.message,
      });
      await this.userActivityService.recordUserAction(
        this.socketEmployeeIdMapping[socket.id],
        UserAction.UPDATE_FOOD_ITEM
      );
    } catch (error) {
      socket.emit("updateFoodItemResponse", {
        success: false,
        message: `Failed to update food item: ${error}`,
      });
    }
  }

  private async deleteFoodItem(socket: Socket, request: { itemName: string }) {
    try {
      const result = await this.foodItemService.deleteFoodItem(
        request.itemName
      );
      socket.emit("deleteFoodItemResponse", {
        success: result.success,
        message: result.message,
      });
      await this.userActivityService.recordUserAction(
        this.socketEmployeeIdMapping[socket.id],
        UserAction.DELETE_FOOD_ITEM
      );
    } catch (error) {
      socket.emit("deleteFoodItemResponse", {
        success: false,
        message: `Failed to delete food item: ${error}`,
      });
    }
  }

  private async getFoodCategories(socket: Socket) {
    try {
      const foodCategories = await this.foodItemService.getAllCategories();
      socket.emit("foodCategoryResponse", { foodCategories });
    } catch (error) {
      socket.emit("foodCategoryResponse", { error });
    }
  }

  private async checkFoodItemExistence(
    socket: Socket,
    request: { itemName: string }
  ) {
    try {
      const exists = await this.foodItemService.checkFoodItemExistence(
        request.itemName
      );
      socket.emit("checkFoodItemExistenceResponse", { exists });
    } catch (error) {
      socket.emit("checkFoodItemExistenceResponse", { exists: false });
    }
  }

  private async viewAllFoodItems(socket: Socket) {
    try {
      const foodItems = await this.foodItemService.getAllFoodItem();
      socket.emit("viewAllFoodItemsResponse", { foodItems });
      await this.userActivityService.recordUserAction(
        this.socketEmployeeIdMapping[socket.id],
        UserAction.VIEW_MENU
      );
    } catch (error) {
      socket.emit("viewAllFoodItemsResponse", {
        error: `Failed to fetch food Items: ${error}`,
      });
    }
  }

  private async viewFeedbackOnItem(socket: Socket, request: { id: number }) {
    try {
      const feedback = await this.feedbackService.getFeedbackByFoodItemId(
        request.id
      );
      socket.emit("feedbackResponse", { feedback });
      await this.userActivityService.recordUserAction(
        this.socketEmployeeIdMapping[socket.id],
        UserAction.VIEW_FEEDBACK
      );
    } catch (error) {
      socket.emit("feedbackResponse", {
        error: `Failed To get Fooditem: ${error}`,
      });
    }
  }

  private async sendNotificationToChefAndEmployee(
    socket: Socket,
    request: { message: string; isSeen: boolean }
  ) {
    try {
      await this.notificationService.sendNotificationToChefAndEmployee(
        request.message,
        request.isSeen
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
}

import { Server, Socket } from "socket.io";
import { FoodItemService } from "../service/FoodItemService";
import { FeedbackService } from "../service/FeedbackService";
import { IFoodItem, IFoodItemPreference } from "../interface/IFoodItem";
import { NotificationService } from './../service/NotificationService';
import { ChefController } from "./ChefController";

export class AdminController {
  private foodItemService: FoodItemService;
  private feedbackService: FeedbackService;
  private notificationService: NotificationService;

  constructor(io: Server){
    this.foodItemService = new FoodItemService();
    this.feedbackService = new FeedbackService();
    this.notificationService = new NotificationService();

    // this.addFoodItem = this.addFoodItem.bind(this);
    // this.updateFoodItem = this.updateFoodItem.bind(this);
    // this.deleteFoodItem = this.deleteFoodItem.bind(this);
    // this.getFoodCategories = this.getFoodCategories.bind(this);
    // this.checkFoodItemExistence = this.checkFoodItemExistence.bind(this);
    // this.viewAllFoodItems = this.viewAllFoodItems.bind(this);
    // this.getFeedbackOnItem = this.getFeedbackOnItem.bind(this);
  }

  public initializeAdminHandlers(socket: Socket) {
    socket.on("addFoodItem", (foodItem , foodItemPreference ) => this.addFoodItem(socket, foodItem,foodItemPreference));
    socket.on("updateFoodItem", (itemName, newFoodItem, newFoodItemPreference) => this.updateFoodItem(socket,itemName, newFoodItem, newFoodItemPreference));
    socket.on("deleteFoodItem", (itemName) => this.deleteFoodItem(socket, itemName));
    socket.on("getFoodCategories", () => this.getFoodCategories(socket));
    socket.on("checkFoodItemExistence", (itemName) => this.checkFoodItemExistence(socket, itemName));
    socket.on("viewAllFoodItems", () => this.viewAllFoodItems(socket));
    socket.on("getFeedbackOnItem", (id) => this.getFeedbackOnItem(id,socket));
    socket.on("sendNotificationToChefAndEmployee", (message,isSeen) => this.sendNotificationToChefAndEmployee(socket,message,isSeen));
  }

  private async addFoodItem(socket: Socket, foodItem: IFoodItem, foodItemPreference: IFoodItemPreference ) {
    try {
      const result = await this.foodItemService.addFoodItem(foodItem, foodItemPreference);
      socket.emit("addFoodItemResponse", { success: result.success, message: result.message });
    } catch (error) {
      socket.emit("addFoodItemResponse", { success: false, message: `Failed to add food item: ${error}` });
    }
  }

  private async updateFoodItem(socket: Socket, itemName: string, newFoodItem: IFoodItem, newFoodItemPreference: IFoodItemPreference) {
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
      socket.emit("updateFoodItemResponse", {
        success: false,
        message: `Failed to update food item: ${error}`,
      });
    }
  }

  private async deleteFoodItem(socket: Socket, itemName: string) {
    try {
      const result = await this.foodItemService.deleteFoodItem(itemName);
      socket.emit("deleteFoodItemResponse", {
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      socket.emit("deleteFoodItemResponse", { success: false, message: `Failed to delete food item: ${error}` });
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

  private async checkFoodItemExistence(socket: Socket, itemName: string) {
    try {
      const exists = await this.foodItemService.checkFoodItemExistence(itemName);
      socket.emit("checkFoodItemExistenceResponse", { exists });
    } catch (error) {
      socket.emit("checkFoodItemExistenceResponse", { exists: false });
    }
  }

  private async viewAllFoodItems (socket:Socket) {
    try {
      const foodItems = await this.foodItemService.getAllFoodItem();
      socket.emit("viewAllFoodItemsResponse", { foodItems });
    } catch (error) {
      console.error("Error fetching menu:", error);
      socket.emit("viewAllFoodItemsResponse", {
        error: "Failed to fetch food Items",
      });
    }
  }

  
  private async getFeedbackOnItem (id: number,socket:Socket) {
    try {
      const feedback = await this.feedbackService.getFeedbackByFoodItemId(
        id
      );
      socket.emit("feedbackresponse", { feedback });
    } catch (error) {
      console.log("Error in getting feedback", error);
      socket.emit("feedbackResponse", { error });
    }
  }


    private async sendNotificationToChefAndEmployee (socket:Socket ,message:string , isSeen:boolean) { 
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
  
}

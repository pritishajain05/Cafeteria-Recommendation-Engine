import { Server, Socket } from "socket.io";
import { RolledOutFoodItemService } from "../service/RolledOuFoodItemService";
import { FeedbackService } from "../service/FeedbackService";
import { FinalFoodItemService } from "../service/FinalFoodItemService";
import { UserService } from "../service/UserService";
import { FoodItemService } from "../service/FoodItemService";
import { IDetailedFeedbackAnswer, IFeedback } from "../interface/IFeedback";
import { IUserPreference } from "../interface/IUser";
import { NotificationService } from "../service/NotificationService";
import { UserActivityService } from "../service/UserActivityService";
import { UserAction } from "../enum/UserAction";

export class EmployeeController {
  private rolledOutFoodItemService: RolledOutFoodItemService;
  private feedbackService: FeedbackService;
  private finalFoodItemService: FinalFoodItemService;
  private userService: UserService;
  private foodItemService: FoodItemService;
  private notificationService: NotificationService;
  private userActivityService: UserActivityService;
  private socketEmployeeIdMapping: { [socketId: string]: number };

  constructor(
    io: Server , socketEmployeeIdMapping: { [socketId: string]: number }
  ) {
    this.rolledOutFoodItemService = new RolledOutFoodItemService();
    this.feedbackService = new FeedbackService();
    this.finalFoodItemService = new FinalFoodItemService();
    this.userService = new UserService();
    this.foodItemService = new FoodItemService();
    this.notificationService = new NotificationService();
    this.userActivityService = new UserActivityService(); 
    this.socketEmployeeIdMapping = socketEmployeeIdMapping;

  }

  public initializeEmployeeHandlers(socket: Socket) {
    socket.on("voteForItems", (selectedIds: number[]) => this.voteForItems(socket, selectedIds));
    socket.on("addFeedbackOnItem", (data: IFeedback) => this.addFeedbackOnItem(socket, data));
    socket.on("getFinalizedMenu", () => this.getFinalizedMenu(socket));
    socket.on("updateUserPreferences", (employeeId: number, preferences: IUserPreference) => this.updateUserPreferences(socket, employeeId, preferences));
    socket.on("getFeedbackQuestions", () => this.getFeedbackQuestions(socket));
    socket.on("getEmployeeFeedbackAnswers", (employeeId:number ) => this.getEmployeeFeedbackAnswers(socket, employeeId));
    socket.on("storeFeedbackAnswers", (answers:IDetailedFeedbackAnswer[]) => this.storeFeedbackAnswers(socket, answers));
    socket.on("getUserPreferences", (employeeId:number) => this.getUserPreferences(socket, employeeId));
    socket.on("getFoodItemPreferences", () => this.getFoodItemPreferences(socket));
    socket.on("sendNotificationToEmployees",(message,isSeen) =>this.sendNotificationToEmployees(socket,message,isSeen));
    socket.on("getNotifications",(employeeId)=>this.getNotifications(socket,employeeId));
    socket.on("markNotificationAsSeen",(notificationId:number,employeeId:number)=> this.markNotificationAsSeen(socket,notificationId,employeeId));
  }

  private async voteForItems(socket: Socket, selectedIds: number[]) {
    try {
      const response = await this.rolledOutFoodItemService.voteForRolledOutItem(selectedIds);
      socket.emit("voteForItemsResponse", {
        success: true,
        message: response.message,
      });
      this.userActivityService.recordUserAction(this.socketEmployeeIdMapping[socket.id], UserAction.VOTE_FOR_FOOD_ITEM);
    } catch (error) {
      socket.emit("voteForItemsResponse", {
        success: false,
        message: "Failed to vote",
      });
    }
  }

  private async addFeedbackOnItem(socket: Socket, data: IFeedback) {
    try {
      const result = await this.feedbackService.addFeedbackOnItem(data);
      socket.emit("addFeedbackresponse", {
        success: result.success,
        message: result.message,
      });
      this.userActivityService.recordUserAction(this.socketEmployeeIdMapping[socket.id], UserAction.GIVE_FEEDBACK);
    } catch (error) {
      socket.emit("addFeedbackresponse", {
        success: false,
        message: error,
      });
    }
  }

  private async getFinalizedMenu(socket: Socket) {
    try {
      const finalMenu = await this.finalFoodItemService.getFinalFoodItem();
      socket.emit("finalizedMenuResponse", { finalMenu });
      this.userActivityService.recordUserAction(this.socketEmployeeIdMapping[socket.id], UserAction.VIEW_FINAL_MENU );
    } catch (error) {
      socket.emit("finalizedMenuResponse", { error });
    }
  }

  private async updateUserPreferences(socket: Socket, employeeId: number, preferences: IUserPreference) {
    try {
      const response = await this.userService.updateUserPreferences(employeeId, preferences);
      socket.emit("updateUserPreferencesResponse", {
        success: response.success,
        message: response.message,
      });
      this.userActivityService.recordUserAction(this.socketEmployeeIdMapping[socket.id], UserAction.UPDATE_USER_PROFILE);
    } catch (error) {
      socket.emit("updateUserPreferencesResponse", {
        success: false,
        message: error,
      });
    }
  }

  private async getFeedbackQuestions(socket: Socket) {
    try {
      const questions = await this.feedbackService.getFeedbackQuestions();
      socket.emit("feedbackQuestionsResponse", { questions });
    } catch (error) {
      socket.emit("feedbackQuestionsResponse", { error });
    }
  }

  private async getEmployeeFeedbackAnswers(socket: Socket, employeeId: number) {
    try {
      const answers = await this.feedbackService.getEmployeeFeedbackAnswers(employeeId);
      socket.emit("employeeFeedbackAnswersResponse", { answers });
    } catch (error) {
      socket.emit("employeeFeedbackAnswersResponse", { error });
    }
  }

  private async storeFeedbackAnswers(socket: Socket, answers:IDetailedFeedbackAnswer[]) {
    try {
      await this.feedbackService.storeFeedbackAnswers(answers);
      socket.emit("storeFeedbackAnswersResponse", {
        success: true,
        message: "Feedback answers stored successfully.",
      });
      this.userActivityService.recordUserAction(this.socketEmployeeIdMapping[socket.id], UserAction.GIVE_DETAILED_FEEDBACK);
    } catch (error) {
      socket.emit("storeFeedbackAnswersResponse", {
        success: false,
        message: error,
      });
    }
  }

  private async getUserPreferences(socket: Socket, employeeId: number) {
    try {
      const preferences = await this.userService.getUserPreference(employeeId);
      socket.emit("userPreferencesResponse", { preferences });
    } catch (error) {
      socket.emit("userPreferencesResponse", {
        error: "Failed to fetch user preferences",
      });
    }
  }

  private async getFoodItemPreferences(socket: Socket) {
    try {
      const preferences = await this.foodItemService.getAllFoodItemPreferences();
      socket.emit("foodItemPreferencesResponse", { preferences });
    } catch (error) {
      socket.emit("foodItemPreferencesResponse", {
        error: "Failed to fetch food item preferences",
      });
    }
  }

  private async sendNotificationToEmployees(socket:Socket,message:string, isSeen:boolean){
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
  }

  private async getNotifications(socket:Socket , employeeId:number){
    try {
      const notifications = await this.notificationService.getNotifications(
        employeeId
      );
      socket.emit("getNotificationsResponse", {
        notifications: notifications,
      });
      this.userActivityService.recordUserAction(this.socketEmployeeIdMapping[socket.id], UserAction.VIEW_NOTIFICATION);
    } catch (error) {
      socket.emit("getNotificationsResponse", {
        error: "Failed to fetch notifications",
      });
    }
  }

  private async markNotificationAsSeen (socket:Socket , notificationId:number, employeeId:number) {
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
  
}

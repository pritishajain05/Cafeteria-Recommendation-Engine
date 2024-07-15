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
    io: Server,
    socketEmployeeIdMapping: { [socketId: string]: number }
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
    socket.on("voteForItems", (request: { votedIds: number[] }) =>
      this.voteForItems(socket, request)
    );
    socket.on(
      "addFeedbackOnItem",
      (request: {
        employeeId: number;
        foodItemId: number;
        rating: number;
        comment: string;
      }) => this.addFeedbackOnItem(socket, request)
    );
    socket.on("getFinalizedMenu", () => this.getFinalizedMenu(socket));
    socket.on(
      "updateUserPreferences",
      (request: { employeeId: number; preferences: IUserPreference }) =>
        this.updateUserPreferences(socket, request)
    );
    socket.on("getFeedbackQuestions", () => this.getFeedbackQuestions(socket));
    socket.on("getEmployeeFeedbackAnswers", (request: { employeeId: number }) =>
      this.getEmployeeFeedbackAnswers(socket, request)
    );
    socket.on(
      "storeFeedbackAnswers",
      (request: { answers: IDetailedFeedbackAnswer[] }) =>
        this.storeFeedbackAnswers(socket, request)
    );
    socket.on("getUserPreferences", (request: { employeeId: number }) =>
      this.getUserPreferences(socket, request)
    );
    socket.on("getFoodItemPreferences", () =>
      this.getFoodItemPreferences(socket)
    );
    socket.on(
      "sendNotificationToEmployees",
      (request: { message: string; isSeen: boolean }) =>
        this.sendNotificationToEmployees(socket, request)
    );
    socket.on("getNotifications", (request: { employeeId: number }) =>
      this.getNotifications(socket, request)
    );
    socket.on(
      "markNotificationAsSeen",
      (request: { notificationId: number; employeeId: number }) =>
        this.markNotificationAsSeen(socket, request)
    );
    socket.on("checkUserVotedToday", (request: { employeeId: number }) =>
      this.checkUserVotedToday(socket, request)
    );
  }

  private async voteForItems(socket: Socket, request: { votedIds: number[] }) {
    try {
      const response = await this.rolledOutFoodItemService.voteForRolledOutItem(
        request.votedIds
      );
      socket.emit("voteForItemsResponse", {
        success: true,
        message: response.message,
      });
      await this.userActivityService.recordUserAction(
        this.socketEmployeeIdMapping[socket.id],
        UserAction.VOTE_FOR_FOOD_ITEM
      );
    } catch (error) {
      socket.emit("voteForItemsResponse", {
        success: false,
        message: `Failed to vote: ${error}`,
      });
    }
  }

  private async addFeedbackOnItem(socket: Socket, request: {employeeId:number,
    foodItemId: number,
    rating: number,
    comment:string,}) {
    try {
      const result = await this.feedbackService.addFeedbackOnItem(
        request.employeeId,
        request.foodItemId,
        request.rating,
        request.comment
      );
      socket.emit("addFeedbackresponse", {
        success: result.success,
        message: result.message,
      });
      await this.userActivityService.recordUserAction(
        this.socketEmployeeIdMapping[socket.id],
        UserAction.GIVE_FEEDBACK
      );
    } catch (error) {
      socket.emit("addFeedbackresponse", {
        success: false,
        message: `Failed to add feedback on item: ${error}`,
      });
    }
  }

  private async getFinalizedMenu(socket: Socket) {
    try {
      const finalMenu = await this.finalFoodItemService.getFinalFoodItem();
      socket.emit("finalizedMenuResponse", { finalMenu });
      await this.userActivityService.recordUserAction(
        this.socketEmployeeIdMapping[socket.id],
        UserAction.VIEW_FINAL_MENU
      );
    } catch (error) {
      socket.emit("finalizedMenuResponse", {
        error: `Failed to get final menu: ${error}`,
      });
    }
  }

  private async updateUserPreferences(
    socket: Socket,
    request: { employeeId: number; preferences: IUserPreference }
  ) {
    try {
      const response = await this.userService.updateUserPreferences(
        request.employeeId,
        request.preferences
      );
      socket.emit("updateUserPreferencesResponse", {
        success: response.success,
        message: response.message,
      });
      await this.userActivityService.recordUserAction(
        this.socketEmployeeIdMapping[socket.id],
        UserAction.UPDATE_USER_PROFILE
      );
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
      socket.emit("feedbackQuestionsResponse", {
        error: `Failed to get feedback questions: ${error}`,
      });
    }
  }

  private async getEmployeeFeedbackAnswers(
    socket: Socket,
    request: { employeeId: number }
  ) {
    try {
      const answers = await this.feedbackService.getEmployeeFeedbackAnswers(
        request.employeeId
      );
      socket.emit("employeeFeedbackAnswersResponse", { answers });
    } catch (error) {
      socket.emit("employeeFeedbackAnswersResponse", {
        error: `Failed to get employee feedback answers: ${error}`,
      });
    }
  }

  private async storeFeedbackAnswers(
    socket: Socket,
    request: { answers: IDetailedFeedbackAnswer[] }
  ) {
    try {
      await this.feedbackService.addFeedbackAnswers(request.answers);
      socket.emit("storeFeedbackAnswersResponse", {
        success: true,
        message: "Feedback answers stored successfully.",
      });
      await this.userActivityService.recordUserAction(
        this.socketEmployeeIdMapping[socket.id],
        UserAction.GIVE_DETAILED_FEEDBACK
      );
    } catch (error) {
      socket.emit("storeFeedbackAnswersResponse", {
        success: false,
        message: `Failed to store feedback answers: ${error}`,
      });
    }
  }

  private async getUserPreferences(
    socket: Socket,
    request: { employeeId: number }
  ) {
    try {
      const preferences = await this.userService.getUserPreference(
        request.employeeId
      );
      socket.emit("userPreferencesResponse", { preferences });
    } catch (error) {
      socket.emit("userPreferencesResponse", {
        error: `Failed to fetch user preferences: ${error}`,
      });
    }
  }

  private async getFoodItemPreferences(socket: Socket) {
    try {
      const preferences =
        await this.foodItemService.getAllFoodItemPreferences();
      socket.emit("foodItemPreferencesResponse", { preferences });
    } catch (error) {
      socket.emit("foodItemPreferencesResponse", {
        error: `Failed to fetch food item preferences: ${error}`,
      });
    }
  }

  private async sendNotificationToEmployees(
    socket: Socket,
    request: { message: string; isSeen: boolean }
  ) {
    try {
      await this.notificationService.sendNotificationToEmployees(
        request.message,
        request.isSeen
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

  private async getNotifications(
    socket: Socket,
    request: { employeeId: number }
  ) {
    try {
      const notifications = await this.notificationService.getNotifications(
        request.employeeId
      );
      socket.emit("getNotificationsResponse", { notifications });
      await this.userActivityService.recordUserAction(
        this.socketEmployeeIdMapping[socket.id],
        UserAction.VIEW_NOTIFICATION
      );
    } catch (error) {
      socket.emit("getNotificationsResponse", {
        error: `Failed to fetch notifications: ${error}`,
      });
    }
  }

  private async markNotificationAsSeen(
    socket: Socket,
    request: { notificationId: number; employeeId: number }
  ) {
    try {
      const response = await this.notificationService.markNotificationAsSeen(
        request.notificationId,
        request.employeeId
      );
      socket.emit("markNotificationAsSeenResponse", {
        success: response.success,
      });
    } catch (error) {
      socket.emit("markNotificationAsSeenResponse", { success: false });
    }
  }

  private async checkUserVotedToday(
    socket: Socket,
    request: { employeeId: number }
  ) {
    try {
      const hasVoted = await this.userActivityService.hasUserVotedToday(
        request.employeeId
      );
      socket.emit("checkUserVotedTodayResponse", { hasVoted });
    } catch (error) {
      socket.emit("checkUserVotedTodayResponse", {
        error: "Error checking voting activity",
      });
    }
  }
}

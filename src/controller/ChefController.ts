import { Server, Socket } from "socket.io";
import { RecommendationService } from "../service/RecommendationService";
import { RolledOutFoodItemService } from "../service/RolledOuFoodItemService";
import { IRolledOutFoodItem } from "../interface/IRolledOutFoodItem";
import { FinalFoodItemService } from './../service/FinalFoodItemService';
import { DiscardFoodItemService } from './../service/DiscardFoodItemService';
import { FeedbackService } from './../service/FeedbackService';
import { UserActivityService } from "../service/UserActivityService";
import { UserAction } from "../enum/UserAction";

export class ChefController {
  private recommendationService: RecommendationService;
  private rolledOutFoodItemService: RolledOutFoodItemService;
  private finalFoodItemService: FinalFoodItemService;
  private discardFoodItemService: DiscardFoodItemService;
  private feedbackService:FeedbackService;
  private userActivityService: UserActivityService;
  private socketEmployeeIdMapping: { [socketId: string]: number }


  constructor(io: Server , socketEmployeeIdMapping: { [socketId: string]: number }){
    this.recommendationService = new RecommendationService();
    this.rolledOutFoodItemService = new RolledOutFoodItemService();
    this.finalFoodItemService = new FinalFoodItemService();
    this.discardFoodItemService = new DiscardFoodItemService();
    this.feedbackService = new FeedbackService();
    this.userActivityService = new UserActivityService();
    this.socketEmployeeIdMapping = socketEmployeeIdMapping;
  }

  public initializeChefHandlers(socket: Socket) {
    socket.on("viewRecommendedFoodItems", () => this.viewRecommendedFoodItems(socket));
    socket.on("storeSelectedIds", (selectedIds:number[]) => this.storeSelectedIds(socket, selectedIds));
    socket.on("checkRolledOutMenu", () => this.checkRolledOutMenu(socket));
    socket.on("storeFinalizedItems",(data:IRolledOutFoodItem[][]) => this.storeFinalizedItems(socket,data));
    socket.on("getRolledOutMenu",() => this.getRolledOutMenu(socket));
    socket.on("getDiscardFooditems", () => this.getDiscardFooditems(socket));
    socket.on("storeFeedbackQuestions", (itemName, questions, discardFoodItemId)=>this.storeFeedbackQuestions(socket,itemName, questions, discardFoodItemId));
  }

  private async viewRecommendedFoodItems(socket: Socket) {
    try {
      const { topBreakfastItems, topLunchItems, topDinnerItems } = await this.recommendationService.recommendationEngine();
      socket.emit("recommendedFoodItemsResponse", {
        topBreakfastItems,
        topLunchItems,
        topDinnerItems,
      });
      this.userActivityService.recordUserAction(this.socketEmployeeIdMapping[socket.id], UserAction.VIEW_RECOMMENDED_FOOD_ITEM);
    } catch (error) {
      socket.emit("recommendedFoodItemsResponse", {
        error: "Failed to fetch recommended items",
      });
    }
  }

  private async storeSelectedIds(socket: Socket, selectedIds: number[]) {
    try {
      const response = await this.rolledOutFoodItemService.addRolledOutItem(selectedIds);
      socket.emit("storeSelectedIdsResponse", {
        success: true,
        message: response.message,
      });
      this.userActivityService.recordUserAction(this.socketEmployeeIdMapping[socket.id], UserAction.ROLLED_OUT_ITEM);
    } catch (error) {
      socket.emit("storeSelectedIdsResponse", {
        success: false,
        message: "Failed to store selected IDs.",
      });
    }
  }

  private async checkRolledOutMenu(socket: Socket) {
    try {
      const menuRolledOut = await this.rolledOutFoodItemService.checkRolledOutMenu();
      socket.emit("checkRolledOutMenuResponse", { menuRolledOut });
    } catch (error) {
      socket.emit("checkRolledOutMenuResponse", {
        error: "Error checking rolled out menu",
      });
    }
  }

  private async storeFinalizedItems(socket :Socket,data: IRolledOutFoodItem[][]) {
    try {
      const result = await this.finalFoodItemService.addFinalFoodItem(data);
      socket.emit("storefinalizedItemsResponse", {
        success: result.success,
        message: result.message,
      });
      this.userActivityService.recordUserAction(this.socketEmployeeIdMapping[socket.id], UserAction.FINALIZE_FOOD_ITEM);
    } catch (error) {
      socket.emit("storeFinalizedItemsResponse", {
        success: false,
        message: error,
      });
    }
  }

  private async getRolledOutMenu (socket:Socket) {
    try {
      const rolledOutMenu =
        await this.recommendationService.getRolledOutItemsWithFeedback();
      socket.emit("rolledOutMenuResponse", { rolledOutMenu });
    } catch (error) {
      socket.emit("rolledOutMenuResponse", { error });
    }
  }
  
  private async getDiscardFooditems (socket:Socket) {
    try {
      const alreadyGenerated = await this.discardFoodItemService.checkDiscardFoodItemsGenerated();
      if (!alreadyGenerated) {
        await this.recommendationService.getDiscardFoodItem();
      }
      const discardFoodItems =
        await this.discardFoodItemService.getDiscardFoodItem();
      socket.emit("getDiscardFoodItemResponse", { discardFoodItems });
      this.userActivityService.recordUserAction(this.socketEmployeeIdMapping[socket.id], UserAction.VIEW_DISCARD_FOOD_ITEM);
    } catch (error) {
      socket.emit("getDiscardFoodItemResponse", {
        error: "error generating discard items",
      });
    }
  }

  
    private async storeFeedbackQuestions (socket:Socket ,itemName: string, questions: string[] , discardFoodItemId:number){
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
        socket.emit("storeFeedbackQuestionsResponse", {
          success: false,
          message: error,
        });
      }
    }
  
}

import { Server, Socket } from "socket.io";
import { RecommendationService } from "../service/RecommendationService";
import { RolledOutFoodItemService } from "../service/RolledOuFoodItemService";
import { IRolledOutFoodItem } from "../interface/IRolledOutFoodItem";
import { FinalFoodItemService } from './../service/FinalFoodItemService';
import { DiscardFoodItemService } from './../service/DiscardFoodItemService';
import { FeedbackService } from './../service/FeedbackService';

export class ChefController {
  private recommendationService: RecommendationService;
  private rolledOutFoodItemService: RolledOutFoodItemService;
  private finalFoodItemService: FinalFoodItemService;
  private discardFoodItemService: DiscardFoodItemService;
  private feedbackService:FeedbackService;

  constructor(io: Server){
    this.recommendationService = new RecommendationService();
    this.rolledOutFoodItemService = new RolledOutFoodItemService();
    this.finalFoodItemService = new FinalFoodItemService();
    this.discardFoodItemService = new DiscardFoodItemService();
    this.feedbackService = new FeedbackService();
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
    } catch (error) {
      console.error("Error generating recommendations:", error);
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
    } catch (error) {
      console.error("Error storing selected IDs:", error);
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
      console.error("Error checking rolled out menu:", error);
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
    } catch (error) {
      console.log("Error in storing final menu", error);
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
      console.log("Error in rolling out menu", error);
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
    } catch (error) {
      console.error("Error generating discard items", error);
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
        console.error(`Failed to store questions: ${error}`);
        socket.emit("storeFeedbackQuestionsResponse", {
          success: false,
          message: error,
        });
      }
    }
  
}

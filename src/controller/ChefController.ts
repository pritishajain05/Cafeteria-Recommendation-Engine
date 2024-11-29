import { Server, Socket } from "socket.io";
import { RecommendationService } from "../service/RecommendationService";
import { RolledOutFoodItemService } from "../service/RolledOuFoodItemService";
import { FinalFoodItemService } from "./../service/FinalFoodItemService";
import { DiscardFoodItemService } from "./../service/DiscardFoodItemService";
import { FeedbackService } from "./../service/FeedbackService";
import { UserActivityService } from "../service/UserActivityService";
import { UserAction } from "../enum/UserAction";
import { FoodItemService } from "../service/FoodItemService";

export class ChefController {
  private recommendationService: RecommendationService;
  private rolledOutFoodItemService: RolledOutFoodItemService;
  private finalFoodItemService: FinalFoodItemService;
  private discardFoodItemService: DiscardFoodItemService;
  private feedbackService: FeedbackService;
  private userActivityService: UserActivityService;
  private foodItemService: FoodItemService;
  private socketEmployeeIdMapping: { [socketId: string]: number };

  constructor( io: Server, socketEmployeeIdMapping: { [socketId: string]: number }) {
    this.recommendationService = new RecommendationService();
    this.rolledOutFoodItemService = new RolledOutFoodItemService();
    this.finalFoodItemService = new FinalFoodItemService();
    this.discardFoodItemService = new DiscardFoodItemService();
    this.feedbackService = new FeedbackService();
    this.userActivityService = new UserActivityService();
    this.foodItemService = new FoodItemService();
    this.socketEmployeeIdMapping = socketEmployeeIdMapping;
  }

  public initializeChefHandlers(socket: Socket) {
    socket.on("viewRecommendedFoodItems", () => this.viewRecommendedFoodItems(socket));
    socket.on("storeSelectedIds", (request: { selectedIds: number[] }) => this.storeSelectedIds(socket, request));
    socket.on("checkRolledOutMenu", () => this.checkRolledOutMenu(socket));
    socket.on("storeFinalizedItems", (request: {selectedIds: number[]}) => this.storeFinalizedItems(socket, request));
    socket.on("getRolledOutMenu", () => this.getRolledOutMenu(socket));
    socket.on("getDiscardFooditems", () => this.getDiscardFooditems(socket));
    socket.on("storeFeedbackQuestions",(request:{itemName:string, questions: string[], discardedItemId: number}) => this.storeFeedbackQuestions(socket, request));
    socket.on("checkFinalMenu", () => this.checkFinalMenu(socket));
    socket.on("deleteDiscardFoodItem", (request: {itemName: string}) => this.deleteDiscardFoodItem(socket, request));
  }

  private async viewRecommendedFoodItems(socket: Socket) {
    try {
      const { topBreakfastItems, topLunchItems, topDinnerItems } = await this.recommendationService.recommendationEngine();
      socket.emit("recommendedFoodItemsResponse", { topBreakfastItems, topLunchItems, topDinnerItems });
      await this.userActivityService.recordUserAction( this.socketEmployeeIdMapping[socket.id], UserAction.VIEW_RECOMMENDED_FOOD_ITEM );
    } catch (error) {
      socket.emit("recommendedFoodItemsResponse", { error: `Failed to fetch recommended items: ${error}`});
    }
  }

  private async storeSelectedIds( socket: Socket, request: { selectedIds: number[] }) {
    try {
      const response = await this.rolledOutFoodItemService.addRolledOutItem( request.selectedIds );
      socket.emit("storeSelectedIdsResponse", { success: true, message: response.message });
      await this.userActivityService.recordUserAction( this.socketEmployeeIdMapping[socket.id], UserAction.ROLLED_OUT_ITEM);
    } catch (error) {
      socket.emit("storeSelectedIdsResponse", { success: false, message: `Failed to store selected IDs: ${error}`});
    }
  }

  private async checkRolledOutMenu(socket: Socket) {
    try {
      const isMenuRolledOut = await this.rolledOutFoodItemService.checkRolledOutMenu();
      socket.emit("checkRolledOutMenuResponse", { isMenuRolledOut });
    } catch (error) {
      socket.emit("checkRolledOutMenuResponse", { error: `Error checking rolled out menu: ${error}`});
    }
  }

  private async checkFinalMenu(socket: Socket) {
    try {
      const isFinalMenu = await this.finalFoodItemService.checkFinalMenu();
      socket.emit("checkFinalMenuResponse", { isFinalMenu });
    } catch (error) {
      socket.emit("checkFinalMenuResponse", { error: `Error checking final menu : ${error}`});
    }
  }

  private async storeFinalizedItems(socket: Socket, request:{selectedIds: number[]}) {
    try {
      const result = await this.finalFoodItemService.addFinalFoodItem( request.selectedIds );
      socket.emit("storeFinalizedItemsResponse", { success: result.success,message: result.message });
      await this.userActivityService.recordUserAction( this.socketEmployeeIdMapping[socket.id], UserAction.FINALIZE_FOOD_ITEM );
    } catch (error) {
      socket.emit("storeFinalizedItemsResponse", { success: false, message: `Failed to store finalized items: ${error}` });
    }
  }

  private async getRolledOutMenu(socket: Socket) {
    try {
      const rolledOutMenu = await this.recommendationService.getRolledOutItemsWithFeedback();
      socket.emit("rolledOutMenuResponse", { rolledOutMenu });
    } catch (error) {
      socket.emit("rolledOutMenuResponse", { error });
    }
  }

  private async getDiscardFooditems(socket: Socket) {
    try {
      const alreadyGenerated = await this.discardFoodItemService.checkDiscardFoodItemsGenerated();
      if (!alreadyGenerated) {
        await this.recommendationService.getDiscardFoodItem();
      }
      const discardFoodItems = await this.discardFoodItemService.getDiscardFoodItem();
      socket.emit("getDiscardFoodItemResponse", { discardFoodItems });
      await this.userActivityService.recordUserAction( this.socketEmployeeIdMapping[socket.id], UserAction.VIEW_DISCARD_FOOD_ITEM );
    } catch (error) {
      socket.emit("getDiscardFoodItemResponse", { error: `error generating discard items: ${error}` });
    }
  }

  private async deleteDiscardFoodItem(socket: Socket, request: {itemName: string}) {
    try {
      const result = await this.discardFoodItemService.deleteDiscardFoodItem( request.itemName );
      await this.foodItemService.deleteFoodItem(request.itemName);
      socket.emit("deleteDiscardFoodItemResponse", { success: result.success, message: result.message });
      await this.userActivityService.recordUserAction( this.socketEmployeeIdMapping[socket.id], UserAction.DELETE_DISCARD_FOOD_ITEM );
    } catch (error) {
      socket.emit("deleteFoodItemResponse", { success: false, message: `Failed to delete food item: ${error}`});
    }
  }

  private async storeFeedbackQuestions( socket: Socket, request:{itemName: string, questions: string[], discardedItemId: number} ) {
    try {
      const response = await this.feedbackService.addDetailedFeedbackQuestions( request.itemName, request.questions, request.discardedItemId);
      socket.emit("storeFeedbackQuestionsResponse", { success: response.success, message: response.message});
    } catch (error) {
      socket.emit("storeFeedbackQuestionsResponse", { success: false, message: error });
    }
  }
}

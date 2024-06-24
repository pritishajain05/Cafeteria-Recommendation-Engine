import { Server } from "socket.io";
import http from "http";
import { UserController } from "../controller/UserController";
import { showMenu } from "./MenuBasedOnRole";
import { AdminController } from "../controller/AdminController";
import { FoodItemService } from '../service/FoodItemService';
import { IFoodItem } from "../interface/IFoodItem";
import { FoodItemRepository } from "../repository/FoodItemRepository";
import { RecommendationService } from "../service/RecommendationService";
import { FeedbackService } from "../service/FeedbackService";

const server = http.createServer();
const io = new Server(server);

const userController = new UserController();
const adminController = new AdminController();
const foodItemService = new FoodItemService();
const foodItemRepository = new FoodItemRepository();
const recommendationService = new RecommendationService();
const feedbackService = new FeedbackService();

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("login", async (data) => {
    const user = await userController.login(data.id , data.name);

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
      socket.emit("checkFoodItemExistenceResponse", { exists: false, error: "Error checking existence" });
    }
  });

  socket.on("updateFoodItem", async ({ itemName, updatedFoodItem }) => {
    try {
      const result = await foodItemService.updateFoodItem(itemName, updatedFoodItem);
      socket.emit("updateFoodItemResponse", { success: result.success, message: result.message });
    } catch (error) {
      console.error("Error updating food item:", error);
      socket.emit("updateFoodItemResponse", { success: false, message: `Failed to update food item: ${error}` });
    }
  });

 
  socket.on("deleteFoodItem", async (itemName: string) => {
    try {
      const result = await adminController.deleteFoodItem(itemName);
      socket.emit("deleteFoodItemResponse", { success: result.success, message: result.message });
    } catch (error) {
      socket.emit("deleteFoodItemResponse", { message: error });
    }
  });

  socket.on("addFoodItem", async (foodItem: IFoodItem) => {
    try {
      const result = await adminController.addFoodItem(foodItem);
      socket.emit("addFoodItemResponse", { success: result.success, message: result.message });
    } catch (error) {
      socket.emit("addFoodItemResponse", { message: error });
    }
  });
  
  socket.on("getFoodCategories", async () => {
    try {
        const foodCategories = await foodItemService.getAllCategories();
        socket.emit("foodCategoryResponse" , { foodCategories });
    } catch (error) {
        socket.emit("foodCategoryResponse", { error });
    }
  })

  socket.on("viewAllFoodItems", async () => {
    try {
      const foodItems = await foodItemService.viewAllFoodItems();
      console.table(foodItems);
      socket.emit("viewAllFoodItemsResponse", { foodItems });
      
    } catch (error) {
      console.error("Error fetching menu:", error);
      socket.emit("viewAllFoodItemsResponse", { error: "Failed to fetch food Items" });
    }
  });

  socket.on("viewRecommendedFoodItems", async () => {
    try {
      const { topBreakfastItems, topLunchItems, topDinnerItems } = await recommendationService.recommendationEngine();
      socket.emit("recommendedFoodItemsResponse", { topBreakfastItems, topLunchItems, topDinnerItems });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      socket.emit("recommendedFoodItemsResponse", { error: "Failed to fetch recommended items" });
    }
  });

  socket.on("storeSelectedIds", async (selectedIds: number[]) => {
    try {
      const response = await foodItemService.addRolledOutItems(selectedIds);
      socket.emit("storeSelectedIdsResponse", { success: true, message: response.message });
    } catch (error) {
      console.error("Error storing selected IDs:", error);
      socket.emit("storeSelectedIdsResponse", { success: false, message: "Failed to store selected IDs." });
    }
  });

  socket.on("getRolledOutMenu" , async ()=> {
    try {
      const rolledOutMenu = await foodItemService.getRolledOutItems();
      socket.emit("rolledOutMenuResponse",{rolledOutMenu});
    } catch (error) {
      console.log("Error in rolling out menu",error)
      socket.emit("rolledOutMenuResponse",{error});
    }
  })

  socket.on("voteForItems", async (selectedIds: number[]) => {
    try {
      const response = await foodItemService.voteForRolledOutItems(selectedIds);
      socket.emit("voteForItemsResponse", { success: true, message: response.message });
    } catch (error) {
      console.error("Error storing selected IDs:", error);
      socket.emit("voteForItemsResponse", { success: false, message: "Failed to vote" });
    }
  });

  socket.on("getFeedbackOnItem" , async (id:number)=> {
    try {
       const feedback = await feedbackService.getFeedbackByFoodItemId(id);
      socket.emit("feedbackresponse",{feedback});
    } catch (error) {
      console.log("Error in getting feedback",error)
      socket.emit("feedbackResponse",{error});
    }
  })
  
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

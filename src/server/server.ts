import { Server } from "socket.io";
import http from "http";
import { UserController } from "../controller/UserController";
import { showMenu } from "./MenuBasedOnRole";
import { AdminController } from "../controller/AdminController";
import { FoodItemService } from '../service/FoodItemService';
import { IFoodItem } from "../interfaces/IFoodItem";

const server = http.createServer();
const io = new Server(server);

const userController = new UserController();
const adminController = new AdminController();
const foodItemService = new FoodItemService();

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


  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

import { Server } from "socket.io";
import http from "http";
import { UserController } from "../controller/UserController";
import { showMenu } from "./MenuBasedOnRole";
import { AdminController } from "../controller/AdminController";
import { FoodItemService } from '../services/FoodItemService';

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

  
  socket.on("handleAdminResponse", async ({ response, option , role}) => {
    try {
      let result;
      switch (option) {
        case "1":
          result = await adminController.addFoodItem(response);
          break;
        default:
          result = {error: "Invalid admin option"}
      }
      socket.emit("selectedOptionResponse", { message: result.message, option ,role });
    } catch (error) {
      socket.emit("selectedOptionResponse", { error ,option , role});
    }
  });

  socket.on("handleChefResponse", async ({ response, option }) => {
    try {

    } catch (error) {
      socket.emit("selectedOptionResponse", { error});
    }
  });

  socket.on("handleEmployeeResponse", async ({ response, option }) => {
    try {
    
    } catch (error) {
      socket.emit("selectedOptionResponse", { error });
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

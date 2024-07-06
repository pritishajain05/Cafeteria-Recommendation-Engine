import { Server as IOServer, Socket } from "socket.io";
import http from "http";
import { UserController } from "../controller/UserController";
import { EmployeeController } from "../controller/EmployeeController";
import { ChefController } from "../controller/ChefController";
import { AdminController } from "../controller/AdminController";

class Server {
  private server: http.Server;
  private io: IOServer;
  private userController: UserController;
  private employeeController: EmployeeController;
  private chefController: ChefController;
  private adminController: AdminController;

  constructor() {
    this.server = http.createServer();
    this.io = new IOServer(this.server);

    this.userController = new UserController(this.io);
    this.employeeController = new EmployeeController(this.io);
    this.chefController = new ChefController(this.io);
    this.adminController = new AdminController(this.io);

    this.initializeSocket();
  }

  private initializeSocket() {
    this.io.on("connection", (socket: Socket) => {
      console.log("Client connected");
      this.userController.initializeUserHandlers(socket);
      this.employeeController.initializeEmployeeHandlers(socket);
      this.chefController.initializeChefHandlers(socket);
      this.adminController.initializeAdminHandlers(socket);
     

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  }

  public start(port: number) {
    this.server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  }
}

const server = new Server();
server.start(3000);

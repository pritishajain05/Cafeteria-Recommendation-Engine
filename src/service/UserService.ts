import { UserRepository } from "../repository/UserRepository";
import { IUser, IUserPreference } from "../interface/IUser";

export class UserService {
  private userRepository = new UserRepository();

  async login(id: number, name: string): Promise<IUser | null> {
    try {
      return await this.userRepository.getUserById(id, name);
    } catch (error) {
      throw error; 
    }
  }

  async updateUserPreferences(employeeId: number, preferences: IUserPreference): Promise<{ success: boolean; message: string }> {
    try {
      return await this.userRepository.updateUserPreferences(employeeId, preferences);
    } catch (error) {
      throw error; 
    }
  }

  async getUserPreference(employeeId: number): Promise<IUserPreference> {
    try {
      return await this.userRepository.getUserPreference(employeeId);
    } catch (error) {
      throw error; 
    }
  }
}

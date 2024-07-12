import { FoodItemService } from '../service/FoodItemService';
import { describe, expect, test } from '@jest/globals';
import { IFoodItem, IFoodItemPreference, IMenuItem } from '../interface/IFoodItem';
import { IFoodCategory } from '../interface/IFoodCategory';
import { DietaryPreference, SpiceLevel, CuisineType } from '../enum/UserPreferences';

type MockGetAllCategories = jest.Mock<Promise<IFoodCategory[] | null>>;
type MockCheckFoodItemExistence = jest.Mock<Promise<boolean>, [string]>;
type MockAddFoodItem = jest.Mock<Promise<number>, [IFoodItem]>;
type MockAddFoodItemPreference = jest.Mock<Promise<{ success: boolean; message: string }>,[IFoodItemPreference]>;
type MockDeleteFoodItem = jest.Mock<Promise<{ success: boolean; message: string }>, [string]>;
type MockUpdateFoodItem = jest.Mock<Promise<number>, [string, IFoodItem ]>;
type MockUpdateFoodItemPreference = jest.Mock<Promise<{ success: boolean; message: string }>,[number,IFoodItemPreference]>;
type MockGetAllFoodItem = jest.Mock<Promise<IMenuItem[]>, []>;
type MockGetAllFoodItemPreferences = jest.Mock<Promise<IFoodItemPreference[]>, []>;


const mockGetAllCategories: MockGetAllCategories = jest.fn();
const mockCheckFoodItemExistence: MockCheckFoodItemExistence = jest.fn();
const mockAddFoodItem: MockAddFoodItem = jest.fn();
const mockDeleteFoodItem: MockDeleteFoodItem = jest.fn();
const mockUpdateFoodItem: MockUpdateFoodItem = jest.fn();
const mockGetAllFoodItem: MockGetAllFoodItem = jest.fn();
const mockGetAllFoodItemPreferences: MockGetAllFoodItemPreferences = jest.fn();
const mockAddFoodItemPreference: MockAddFoodItemPreference = jest.fn()
const mockUpdateFoodItemPreference: MockUpdateFoodItemPreference = jest.fn();

jest.mock('../repository/FoodItemRepository', () => ({
  FoodItemRepository: jest.fn().mockImplementation(() => ({
    getAllCategories: mockGetAllCategories,
    checkFoodItemExistence: mockCheckFoodItemExistence,
    addFoodItem: mockAddFoodItem,
    deleteFoodItem: mockDeleteFoodItem,
    updateFoodItem: mockUpdateFoodItem,
    getAllFoodItem: mockGetAllFoodItem,
    getAllFoodItemPreferences: mockGetAllFoodItemPreferences,
    addFoodItemPreference: mockAddFoodItemPreference,
    updateFoodItemPreference: mockUpdateFoodItemPreference,
  })),
}));

// Import the mocked FoodItemRepository
import { FoodItemRepository as MockedFoodItemRepository } from '../repository/FoodItemRepository';

describe('FoodItemService', () => {
  let foodItemService: FoodItemService;
  let foodItemRepository: MockedFoodItemRepository;

  beforeEach(() => {
    foodItemRepository = new MockedFoodItemRepository() as unknown as MockedFoodItemRepository;
    foodItemService = new FoodItemService();
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mock calls after each test
  });

  describe('getAllCategories', () => {
    it('should return all food categories', async () => {
      // Arrange
      const mockCategories: IFoodCategory[] = [{ id: 1, name: 'Category A' }, { id: 2, name: 'Category B' }];
      mockGetAllCategories.mockResolvedValue(mockCategories);

      // Act
      const categories = await foodItemService.getAllCategories();

      // Assert
      expect(categories).toEqual(mockCategories);
      expect(mockGetAllCategories).toHaveBeenCalledTimes(1);
    });

    it('should return null if no categories found', async () => {
      // Arrange
      mockGetAllCategories.mockResolvedValue(null);

      // Act
      const categories = await foodItemService.getAllCategories();

      // Assert
      expect(categories).toBeNull();
      expect(mockGetAllCategories).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if fetching categories fails', async () => {
      // Arrange
      const errorMessage = 'Failed to fetch categories';
      mockGetAllCategories.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(foodItemService.getAllCategories()).rejects.toThrow(errorMessage);
      expect(mockGetAllCategories).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkFoodItemExistence', () => {
    it('should return true if food item exists', async () => {
      // Arrange
      const itemName = 'Test Item';
      mockCheckFoodItemExistence.mockResolvedValue(true);

      // Act
      const exists = await foodItemService.checkFoodItemExistence(itemName);

      // Assert
      expect(exists).toBe(true);
      expect(mockCheckFoodItemExistence).toHaveBeenCalledWith(itemName);
      expect(mockCheckFoodItemExistence).toHaveBeenCalledTimes(1);
    });

    it('should return false if food item does not exist', async () => {
      // Arrange
      const itemName = 'Nonexistent Item';
      mockCheckFoodItemExistence.mockResolvedValue(false);

      // Act
      const exists = await foodItemService.checkFoodItemExistence(itemName);

      // Assert
      expect(exists).toBe(false);
      expect(mockCheckFoodItemExistence).toHaveBeenCalledWith(itemName);
      expect(mockCheckFoodItemExistence).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if checking existence fails', async () => {
      // Arrange
      const itemName = 'Error Item';
      const errorMessage = 'Failed to check item existence';
      mockCheckFoodItemExistence.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(foodItemService.checkFoodItemExistence(itemName)).rejects.toThrow(errorMessage);
      expect(mockCheckFoodItemExistence).toHaveBeenCalledWith(itemName);
      expect(mockCheckFoodItemExistence).toHaveBeenCalledTimes(1);
    });
  });

  describe('addFoodItem', () => {
    it('should successfully add a new food item and preferences', async () => {
      // Arrange
      const newItem: IFoodItem = {
        name: 'New Food Item',
        price: 10,
        availabilityStatus: true,
        foodCategoryId: 1,
        mealTypeId: 1,
      };
      const newPreference: IFoodItemPreference = {
        dietaryPreference: DietaryPreference.Vegetarian,
        spiceLevel: SpiceLevel.High,
        cuisineType: CuisineType.NorthIndian,
        sweetTooth: false,
      };
      const successMessage = 'Item and preferences added successfully.';
      mockCheckFoodItemExistence.mockResolvedValue(false);
      mockAddFoodItem.mockResolvedValue(1);
      mockAddFoodItemPreference.mockResolvedValue({ success: true, message: successMessage });

      // Act
      const result = await foodItemService.addFoodItem(newItem, newPreference);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe(successMessage);
      expect(mockCheckFoodItemExistence).toHaveBeenCalledWith(newItem.name);
      expect(mockAddFoodItem).toHaveBeenCalledWith(newItem);
      expect(mockAddFoodItemPreference).toHaveBeenCalledWith({ ...newPreference, foodItemId: 1 });
      expect(mockCheckFoodItemExistence).toHaveBeenCalledTimes(1);
      expect(mockAddFoodItem).toHaveBeenCalledTimes(1);
      expect(mockAddFoodItemPreference).toHaveBeenCalledTimes(1);
    });

    it('should fail to add a new food item if it already exists', async () => {
      // Arrange
      const existingItem: IFoodItem = {
        name: 'Existing Food Item',
        price: 15,
        availabilityStatus: true,
        foodCategoryId: 2,
        mealTypeId: 2,
      };
      const existingPreference: IFoodItemPreference = {
        dietaryPreference: DietaryPreference.Vegetarian,
        spiceLevel: SpiceLevel.Low,
        cuisineType: CuisineType.Other,
        sweetTooth: true,
      };
      const errorMessage = 'Food Item already Exists! Try to Add another Food Item';
      mockCheckFoodItemExistence.mockResolvedValue(true);

      // Act
      const result = await foodItemService.addFoodItem(existingItem, existingPreference);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe(errorMessage);
      expect(mockCheckFoodItemExistence).toHaveBeenCalledWith(existingItem.name);
      expect(mockAddFoodItem).not.toHaveBeenCalled();
      expect(mockAddFoodItemPreference).not.toHaveBeenCalled();
      expect(mockCheckFoodItemExistence).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteFoodItem', () => {
    it('should successfully delete a food item', async () => {
      // Arrange
      const itemName = 'Item to Delete';
      const successMessage = 'Food Item deleted successfully.';
      mockCheckFoodItemExistence.mockResolvedValue(true);
      mockDeleteFoodItem.mockResolvedValue({ success: true, message: successMessage });

      // Act
      const result = await foodItemService.deleteFoodItem(itemName);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe(successMessage);
      expect(mockCheckFoodItemExistence).toHaveBeenCalledWith(itemName);
      expect(mockDeleteFoodItem).toHaveBeenCalledWith(itemName);
      expect(mockCheckFoodItemExistence).toHaveBeenCalledTimes(1);
      expect(mockDeleteFoodItem).toHaveBeenCalledTimes(1);
    });

    it('should fail to delete a non-existent food item', async () => {
      // Arrange
      const itemName = 'Nonexistent Item';
      const errorMessage = 'Food item not found.';
      mockCheckFoodItemExistence.mockResolvedValue(false);

      // Act
      const result = await foodItemService.deleteFoodItem(itemName);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe(errorMessage);
      expect(mockCheckFoodItemExistence).toHaveBeenCalledWith(itemName);
      expect(mockDeleteFoodItem).not.toHaveBeenCalled();
      expect(mockCheckFoodItemExistence).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if deleting food item fails', async () => {
      // Arrange
      const itemName = 'Error Item';
      const errorMessage = 'Failed to delete food item.';
      mockCheckFoodItemExistence.mockResolvedValue(true);
      mockDeleteFoodItem.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(foodItemService.deleteFoodItem(itemName)).rejects.toThrow(errorMessage);
      expect(mockCheckFoodItemExistence).toHaveBeenCalledWith(itemName);
      expect(mockDeleteFoodItem).toHaveBeenCalledWith(itemName);
      expect(mockCheckFoodItemExistence).toHaveBeenCalledTimes(1);
      expect(mockDeleteFoodItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAllFoodItem', () => {
    it('should return all food items', async () => {
      // Arrange
      const mockFoodItems: IMenuItem[] = [
        { id: 1, name: 'Item A', price: 10, availabilityStatus: 'available', categoryName: 'Category A', mealType: 'Lunch' },
        { id: 2, name: 'Item B', price: 12, availabilityStatus: 'available', categoryName: 'Category B', mealType: 'Dinner' },
      ];
      mockGetAllFoodItem.mockResolvedValue(mockFoodItems);

      // Act
      const foodItems = await foodItemService.getAllFoodItem();

      // Assert
      expect(foodItems).toEqual(mockFoodItems);
      expect(mockGetAllFoodItem).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if no food items found', async () => {
      // Arrange
      mockGetAllFoodItem.mockResolvedValue([]);

      // Act
      const foodItems = await foodItemService.getAllFoodItem();

      // Assert
      expect(foodItems).toEqual([]);
      expect(mockGetAllFoodItem).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if fetching food items fails', async () => {
      // Arrange
      const errorMessage = 'Failed to fetch food items';
      mockGetAllFoodItem.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(foodItemService.getAllFoodItem()).rejects.toThrow(errorMessage);
      expect(mockGetAllFoodItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAllFoodItemPreferences', () => {
    it('should return all food item preferences', async () => {
      // Arrange
      const mockPreferences: IFoodItemPreference[] = [
        { foodItemId: 1, dietaryPreference: DietaryPreference.Vegetarian, spiceLevel: SpiceLevel.Medium, cuisineType: CuisineType.NorthIndian, sweetTooth: true },
        { foodItemId: 2, dietaryPreference: DietaryPreference.NonVegetarian, spiceLevel: SpiceLevel.Low, cuisineType: CuisineType.Other, sweetTooth: false },
      ];
      mockGetAllFoodItemPreferences.mockResolvedValue(mockPreferences);

      // Act
      const preferences = await foodItemService.getAllFoodItemPreferences();

      // Assert
      expect(preferences).toEqual(mockPreferences);
      expect(mockGetAllFoodItemPreferences).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if no food item preferences found', async () => {
      // Arrange
      mockGetAllFoodItemPreferences.mockResolvedValue([]);

      // Act
      const preferences = await foodItemService.getAllFoodItemPreferences();

      // Assert
      expect(preferences).toEqual([]);
      expect(mockGetAllFoodItemPreferences).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if fetching food item preferences fails', async () => {
      // Arrange
      const errorMessage = 'Failed to fetch food item preferences';
      mockGetAllFoodItemPreferences.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(foodItemService.getAllFoodItemPreferences()).rejects.toThrow(errorMessage);
      expect(mockGetAllFoodItemPreferences).toHaveBeenCalledTimes(1);
    });
  });
});

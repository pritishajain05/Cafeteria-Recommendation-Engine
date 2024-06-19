export const GET_USER_BY_ID : string= `SELECT u.employeeId, u.name, r.roleName AS role
                FROM user u
                JOIN role r ON u.roleId = r.id
                WHERE u.employeeId = ? AND LOWER(REPLACE(u.name, ' ', '')) = LOWER(REPLACE(?, ' ', ''))` ;

export const GET_ALL_FOOD_CATEGORIES : string = `Select * from foodCategory` ; 

export const ADD_FOOD_ITEM = ` INSERT INTO foodItem (name, price, availabilityStatus, foodCategoryId)
      VALUES (?, ?, ?, ?)` ;

export const ADD_FOOD_ITEM_MEAL_TYPE : string =`INSERT INTO foodItemMealType (foodItemId, mealTypeId)
      VALUES (?, ?)` ;
export const GET_USER_BY_ID : string= `SELECT u.employeeId, u.name, r.roleName AS role
                FROM user u
                JOIN role r ON u.roleId = r.id
                WHERE u.employeeId = ? AND LOWER(REPLACE(u.name, ' ', '')) = LOWER(REPLACE(?, ' ', ''))` ;

export const GET_ALL_FOOD_CATEGORIES : string = `Select * from foodCategory` ; 

export const ADD_FOOD_ITEM = ` INSERT INTO foodItem (name, price, availabilityStatus, foodCategoryId)
      VALUES (?, ?, ?, ?)` ;

export const ADD_FOOD_ITEM_MEAL_TYPE : string =`INSERT INTO foodItemMealType (foodItemId, mealTypeId)
      VALUES (?, ?)` ;

export const DELETE_FOOD_ITEM : string = `UPDATE foodItem SET availabilityStatus = FALSE WHERE LOWER(name) = LOWER(?);` ;

export const LAST_INSERTED_ID : string =  `select id from foodItem where id=(SELECT LAST_INSERT_ID())` ;

export const CHECK_FOOD_ITEM_EXISTENCE : string = `SELECT * FROM foodItem WHERE LOWER(name) = LOWER(?)`;

export const UPDATE_FOOD_ITEM: string  = 'UPDATE foodItem SET name = ?, price = ?, availabilityStatus = ?,foodCategoryId = ? WHERE name = ?'
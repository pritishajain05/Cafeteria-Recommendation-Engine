
import { Role } from '../enum/Role';

export const showMenu = (role: Role): string[] => {
    switch (role) {
        case Role.Admin:
            return [
                "1. Add Food Item",
                "2. Update Food Item",
                "3. Delete Food Item",
                "4. View Monthly Feedback Report",
                "5. View Menu",
                "6. View Feedback on particular item",
                "Type 'logout' to exit."
            ];
        case Role.Chef:
            return [
                "1. View Menu",
                "2. View Recommended Food Items",
                "3. Roll Out Menu for next day",
                "4. Get Selected Food Items From Users",
                "5. Finalize Menu Items",
                "6. View Feedback on particular item",
                "7. View Notifications",
                "8. View Monthly Feedback Report",
                "Type 'logout' to exit."
            ];
        case Role.Employee:
            return [
                "1. View Menu",
                "2. Select Food Items for next day",
                "3. View Feedback on particular item",
                "4. Give Feedback",
                "5. View Notifications",
                "Type 'logout' to exit."
            ];
        default:
            return ['Invalid Role.'];
    }
}




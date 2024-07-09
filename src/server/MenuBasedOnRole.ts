import { Role } from "../enum/Role";

export const showMenu = (role: Role): string[] => {
  switch (role) {
    case Role.Admin:
      return [
        "1. View Menu",
        "2. Add Food Item",
        "3. Update Food Item",
        "4. Delete Food Item",
        "5. View Feedback on particular item",
        "6. View Discard Food Items",
        "Type 'logout' to exit.",
      ];
    case Role.Chef:
      return [
        "1. View Menu",
        "2. View Recommended Food Items",
        "3. Roll Out Menu for next day", 
        "4. Finalize Food Items for next day ",
        "5. View Final Menu",
        "6. View Feedback on particular item",
        "7. View Notifications",
        "8. View Discard Food Items",
        "Type 'logout' to exit.",
      ];
    case Role.Employee:
      return [
        "1. View Menu",
        "2. Vote for Food Items for next day",
        "3. View Feedback on particular item",
        "4. Give Feedback",
        "5. View Notifications",
        "6. View Final Menu",
        "7. Give Detailed Feedback on Discarded items",
        "8. Update Profile",
        "Type 'logout' to exit.",
      ];
    default:
      return ["Invalid Role."];
  }
};

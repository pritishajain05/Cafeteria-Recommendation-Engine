export const GET_USER_BY_ID: string = `SELECT u.employeeId, u.name, r.roleName AS role
                FROM user u
                JOIN role r ON u.roleId = r.id
                WHERE u.employeeId = ? AND LOWER(REPLACE(u.name, ' ', '')) = LOWER(REPLACE(?, ' ', ''))`;

export const GET_ALL_FOOD_CATEGORIES: string = `Select * from foodCategory`;

export const ADD_FOOD_ITEM = ` INSERT INTO foodItem (name, price, availabilityStatus, foodCategoryId, mealTypeId)
      VALUES (?, ?, ?, ?,?)`;

export const ADD_FOOD_ITEM_PREFERENCE: string = `INSERT INTO FoodItemPreference (foodItemId, dietaryPreference, spiceLevel, cuisineType, sweetTooth) VALUES (?, ?, ?, ?, ?)`;

export const ADD_FOOD_ITEM_MEAL_TYPE: string = `INSERT INTO foodItemMealType (foodItemId, mealTypeId)
      VALUES (?, ?)`;

export const DELETE_FOOD_ITEM: string = `UPDATE foodItem SET availabilityStatus = FALSE WHERE LOWER(name) = LOWER(?);`;

export const LAST_INSERTED_ID: string = `select id from foodItem where id=(SELECT LAST_INSERT_ID())`;

export const CHECK_FOOD_ITEM_EXISTENCE: string = `SELECT * FROM foodItem WHERE LOWER(name) = LOWER(?)`;

export const UPDATE_FOOD_ITEM: string =
  "UPDATE foodItem SET name = ?, price = ?, availabilityStatus = ?,foodCategoryId = ? ,mealTypeid = ? WHERE name = ?";

export const UPDATE_FOOD_ITEM_PREFERENCE: string = `UPDATE FoodItemPreference
  SET dietaryPreference = ?, spiceLevel = ?, cuisineType = ?, sweetTooth = ?
  WHERE foodItemId = ?;`;

export const UPDATE_USER_PREFERENCES: string = ` INSERT INTO userProfile (employeeId, dietaryPreference, spiceLevel, cuisineType, sweetTooth)
  VALUES (?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    dietaryPreference = VALUES(dietaryPreference),
    spiceLevel = VALUES(spiceLevel),
    cuisineType = VALUES(cuisineType),
    sweetTooth = VALUES(sweetTooth)`;

export const GET_ALL_FOOD_ITEMS: string = `
        SELECT fi.id AS foodItemId, fi.name AS foodItemName, fi.price AS foodItemPrice, fi.availabilityStatus AS availabilityStatus,
             fc.name AS categoryName, mt.type AS mealType
      FROM foodItem fi
      JOIN foodCategory fc ON fi.foodCategoryId = fc.id
      LEFT JOIN mealType mt ON fi.mealTypeId = mt.id
      `;

export const ADD_ROLLED_OUT_ITEMS: string = `INSERT INTO rolloutFoodItem (foodItemId, votes, rolloutDate) VALUES (?, 0,?)`;

export const GET_ROLLED_OUT_ITEMS: string = `
        SELECT rfi.id AS id , rfi.votes , fi.id AS foodItemId, fi.name AS foodItemName, fi.price AS foodItemPrice,
             mt.type AS mealType
      FROM  rolloutFoodItem  rfi
      JOIN foodItem fi ON rfi.foodItemId = fi.id
      LEFT JOIN mealType mt ON fi.mealTypeId = mt.id
      WHERE DATE(rfi.rolloutDate) = ?
      `;

export const CHECK_ROLLED_OUT_MENU_EXISTENCE: string =
  "SELECT COUNT(*) as count FROM rolloutFoodItem WHERE rolloutDate=?";

export const ADD_VOTE_FOR_ROLLED_OUT_ITEMS: string = `UPDATE rolloutFoodItem SET votes = votes + 1 WHERE foodItemId = ? AND rolloutDate = ?`;

export const ADD_FINAL_FOOD_ITEM: string = `
          INSERT INTO finalFoodItem (rolloutFoodItemId, date)
          VALUES (?, ?) `;

export const GET_FINAL_FOOD_ITEM: string = `
        SELECT fi.id AS foodItemId, fi.name AS foodItemName, mt.type AS mealType
        FROM finalFoodItem ffi
        JOIN rolloutFoodItem rfi ON ffi.rolloutFoodItemId = rfi.id
        JOIN foodItem fi ON rfi.foodItemId = fi.id
        LEFT JOIN mealType mt ON fi.mealTypeId = mt.id
        WHERE DATE(ffi.date) = ?
      `;

export const ADD_DISCARD_FOOD_ITEM: string = `
          INSERT INTO discardFoodItem (foodItemId, foodItemName, averageRating, averageSentiment, date)
          VALUES (?, ?, ?, ?, ?)
        `;

export const GET_USER_BY_ROLE: string = `
      SELECT u.employeeId FROM user u
      JOIN role r ON u.roleId = r.id
      WHERE r.roleName = ?
    `;

export const ADD_NOTIFICATION: string = `
      INSERT INTO notification (employeeId, message, date, isSeen)
      VALUES (?, ?, ?, ?)
    `;
export const GET_NOTIFICATION_BY_EMPLOYEE_ID: string = `
      SELECT * FROM notification WHERE employeeId = ? AND isSeen = false
    `;
export const MARK_NOTIFICATION_AS_SEEN: string = `
        UPDATE notification
        SET isSeen = TRUE
        WHERE id = ? AND employeeId = ?
    `;

export const GET_ALL_FEEDBACK: string = `SELECT * FROM feedback`;

export const GET_FEEDBACK_BY_FOODITEM_ID: string = ` SELECT feedback.*, foodItem.name AS foodItemName 
  FROM feedback 
  JOIN foodItem ON feedback.foodItemId = foodItem.id 
  WHERE feedback.foodItemId = ?`;

export const CHECK_FEEDBACK_FOR_TODAY: string = `SELECT * FROM feedback WHERE employeeId = ? AND foodItemId = ? AND date= ?`;

export const ADD_FEEDBACK_ON_ITEM: string = `
            INSERT INTO feedback (employeeId, foodItemId, rating, comment, date)
            VALUES (?, ?, ?, ?, ?)
          `;

export const FIND_ROLLED_OUT_FOOD_ITEM_ID: string = `SELECT id FROM rolloutFoodItem WHERE foodItemId = ? AND DATE(rolloutDate) = DATE(?)`;

export const IS_ITEM_IN_FINAL_MENU: string = `"SELECT * FROM finalFoodItem WHERE rolloutFoodItemId = ? AND date = ? "`;

export const GET_DISCARD_FOODITEM_BY_DATE: string = `SELECT * FROM discardFoodItem`;

export const ADD_DETAILED_FEEDBACK_QUESTION: string = `
  INSERT INTO detailedFeedbackQuestion (foodItemName, question, date, discardFoodItemId)
  VALUES (?, ?, ?, ?)
`;

export const CHECK_EXISTING_QUESTIONS: string = 'SELECT COUNT(*) as count FROM detailedFeedbackQuestion WHERE discardFoodItemId = ?';

export const GET_ALL_DETAILED_FEEDBACK_QUESTIONS: string =
  "SELECT * FROM detailedFeedbackQuestion";

export const GET_EMPLOYEE_FEEDBACK_ANSWERS: string =
  "SELECT * FROM detailedFeedbackAnswer WHERE employeeId = ?";

export const STORE_FEEDBACK_ANSWERS: string =
  "INSERT INTO detailedFeedbackAnswer (questionId, employeeId, answer, date) VALUES (?,?,?,?)";

export const SELECT_USER_PREFERENCES: string = `
  SELECT dietaryPreference, spiceLevel, cuisineType, sweetTooth 
  FROM userProfile 
  WHERE employeeId = ?
`;

export const SELECT_ALL_FOOD_ITEM_PREFERENCES: string = `
  SELECT * FROM FoodItemPreference
`;

export const CHECK_DISCARD_FOOD_ITEMS_GENERATED: string = `SELECT COUNT(*) as count FROM discardFoodItem WHERE YEAR(date) = YEAR(CURRENT_DATE) AND MONTH(date) = MONTH(CURRENT_DATE)`;

export const RECORD_USER_ACTIVITY: string = `INSERT INTO userActivity (employeeid, action) VALUES (?, ?)`;

export const CHECK_USER_VOTED_TODAY: string = `
    SELECT id 
    FROM userActivity 
    WHERE employeeid = ? AND action = ? AND timestamp >= ?
`;

export const CHECK_FINAL_MENU_EXISTENCE: string =
  "SELECT COUNT(*) as count FROM finalFoodItem WHERE date=?";

export const DELETE_DISCARD_FOOD_ITEM = `DELETE FROM discardFoodItem WHERE foodItemName = ?`;

export const positiveWords: string[] = [
  "good",
  "great",
  "excellent",
  "like",
  "love",
  "awesome",
  "amazing",
  "happy",
  "wonderful",
  "fantastic",
  "delightful",
  "superb",
  "terrific",
  "pleased",
  "satisfied",
  "enjoy",
  "positive",
  "admire",
  "approve",
  "commend",
  "favorable",
  "praise",
  "approve",
  "glad",
  "joyful",
  "grateful",
  "content",
  "excited",
  "thrilled",
  "cheerful",
  "optimistic",
  "perfect",
  "fine",
  "exemplary",
  "brilliant",
  "charming",
  "stellar",
  "phenomenal",
  "splendid",
  "smile",
  "laugh",
  "vibrant",
  "peaceful",
  "refreshing",
  "uplifting",
  "comfortable",
  "hilarious",
  "lovely",
  "kind",
  "best",
  "genius",
  "beautiful",
  "cool",
  "fabulous",
  "nice",
  "genial",
  "bright",
  "admirable",
  "exquisite",
  "exuberant",
  "jubilant",
  "radiant",
  "rejoice",
  "sunny",
  "delicious",
  "divine",
  "ecstatic",
  "elegant",
  "fantasy",
  "festive",
  "gorgeous",
  "graceful",
  "heavenly",
  "harmonious",
  "victorious",
  "vivacious",
  "zesty",
  "lively",
  "amused",
  "amazing",
  "apt",
  "benevolent",
  "bless",
  "bliss",
  "blissful",
  "calm",
  "carefree",
  "celebrate",
  "certain",
  "cheer",
  "cherish",
  "colorful",
  "commend",
  "compliment",
  "congratulate",
  "courageous",
  "creative",
  "dazzling",
  "delight",
  "distinguished",
  "earnest",
  "easy",
  "ecstasy",
  "effortless",
  "elevate",
  "embrace",
  "enchant",
  "endearing",
  "energetic",
  "enthusiastic",
  "exalt",
  "exhilarating",
  "explore",
  "exquisite",
  "extraordinary",
  "fair",
  "fascinate",
  "fine",
  "fulfill",
  "fun",
  "funny",
  "generous",
  "glad",
  "gleeful",
  "goodness",
  "grace",
  "gracious",
  "grand",
  "great",
  "groovy",
  "happy",
  "harmony",
  "heaven",
  "hope",
  "humorous",
  "ideal",
  "imagine",
  "innovate",
  "inspire",
  "integrity",
  "jolly",
  "jovial",
  "joy",
  "jubilant",
  "juicy",
  "keen",
  "kindness",
  "lively",
  "love",
  "luxury",
  "marvelous",
  "magnificent",
  "majestic",
  "miracle",
  "noble",
  "nurturing",
  "optimism",
  "outstanding",
  "paradise",
  "passion",
  "perfect",
  "playful",
  "pleasant",
  "pleasing",
  "powerful",
  "praise",
  "precious",
  "priceless",
  "pride",
  "pure",
  "quaint",
  "radiant",
  "rapture",
  "refreshing",
  "rejoice",
  "relax",
  "remarkable",
  "resplendent",
  "revere",
  "revitalize",
  "sensational",
  "serene",
  "silken",
  "sincere",
  "smart",
  "sparkling",
  "spectacular",
  "splendid",
  "spry",
  "stunning",
  "sublime",
  "succulent",
  "super",
  "superb",
  "sweet",
  "swift",
  "terrific",
  "thankful",
  "thrive",
  "tranquil",
  "transform",
  "triumph",
  "truth",
  "unique",
  "unity",
  "upbeat",
  "victory",
  "virtue",
  "vitality",
  "vivid",
  "warm",
  "wealthy",
  "wholesome",
  "witty",
  "wonder",
  "wondrous",
  "worthy",
  "zany",
  "zeal",
  "zen",
];
export const negativeWords: string[] = [
  "bad",
  "terrible",
  "horrible",
  "awful",
  "poor",
  "negative",
  "dislike",
  "disgusting",
  "disappointing",
  "dreadful",
  "unpleasant",
  "hate",
  "worst",
  "sad",
  "painful",
  "unhappy",
  "annoying",
  "boring",
  "disastrous",
  "horrendous",
  "angry",
  "upset",
  "depressing",
  "unfortunate",
  "grim",
  "tragic",
  "offensive",
  "gross",
  "nasty",
  "irritating",
  "miserable",
  "vile",
  "abysmal",
  "repulsive",
  "dismal",
  "disturbing",
  "unfavorable",
  "lousy",
  "distressing",
  "despicable",
  "underwhelming",
  "pathetic",
  "displeasing",
  "bleak",
  "repugnant",
  "detestable",
  "forbidding",
  "repellant",
  "wretched",
  "undesirable",
  "unwelcome",
  "unsatisfactory",
  "ghastly",
  "woeful",
  "abominable",
  "inferior",
  "heartbreaking",
  "shocking",
  "awful",
  "hideous",
  "sorrowful",
  "unfortunate",
  "unsatisfying",
  "sorry",
  "icky",
  "unbearable",
  "mournful",
  "disheartening",
  "gloomy",
  "hopeless",
  "deplorable",
  "dreadful",
  "loathsome",
  "unspeakable",
  "grief",
  "disgust",
  "desolate",
  "ominous",
  "bitter",
  "upsetting",
  "disliked",
  "repugnant",
  "cruel",
  "hurtful",
  "gory",
  "grievous",
  "nervous",
  "troubled",
  "anguish",
  "off-putting",
  "despair",
  "foul",
  "serious",
  "sickening",
  "lamentable",
  "dreary",
  "harsh",
  "brutal",
  "damaging",
  "disgusted",
  "dejected",
  "unfortunate",
  "hard",
  "atrocious",
  "repelling",
  "uncomfortable",
  "grieved",
  "unappetizing",
  "unloved",
  "hardship",
  "troubling",
  "menacing",
  "banned",
  "dire",
  "pain",
  "sulky",
  "deadly",
  "nightmarish",
  "resentment",
  "resentful",
  "miserable",
  "disillusioned",
  "enraged",
  "betrayed",
  "aggravating",
  "distraught",
  "disaster",
  "trouble",
  "regret",
  "concern",
  "tense",
  "stressful",
  "tension",
  "scary",
  "challenging",
  "evil",
  "vicious",
  "contempt",
  "betrayal",
  "disappointment",
  "fear",
  "angst",
  "frustration",
  "failure",
  "crisis",
  "panic",
  "desperation",
  "nightmare",
  "dangerous",
  "debacle",
  "mess",
  "nasty",
  "freaky",
  "suspicious",
  "dread",
  "hazardous",
  "problem",
  "worries",
  "severe",
  "frustrating",
  "damage",
  "critical",
  "horror",
  "hardship",
  "deficiency",
  "frantic",
  "worry",
  "inferiority",
  "trauma",
  "threat",
  "harm",
  "displeasure",
  "disturbance",
  "frightening",
  "unsafe",
  "disadvantageous",
  "infuriating",
  "violence",
  "unfavorable",
  "problematic",
  "destruction",
  "neglected",
  "abused",
  "harmful",
  "despised",
  "destructive",
  "wicked",
  "adverse",
  "worrying",
  "desperation",
  "regrettable",
  "agony",
  "sinister",
  "abuse",
  "painful",
  "fail",
  "disturbing",
  "anxiety",
  "haunting",
  "catastrophe",
  "hatred",
  "mourn",
  "loath",
  "disturbed",
  "regretful",
  "wrath",
  "desperation",
  "menace",
  "gruesome",
  "agitated",
  "lack",
  "grievance",
  "scare",
  "stressed",
  "disgust",
  "deprived",
  "outrage",
  "tears",
  "desolate",
  "dark",
  "insecurity",
  "cynical",
  "irritation",
  "melancholy",
  "tired",
  "malice",
  "ugly",
  "pain",
  "wrong",
  "discontent",
  "troublesome",
  "discouraging",
  "burden",
  "rage",
  "complaint",
  "failure",
  "destructive",
  "stingy",
  "depressing",
  "repugnant",
  "shame",
  "waste",
  "horror",
  "breakup",
  "vain",
  "traumatic",
  "concern",
  "worn",
  "disadvantage",
  "upset",
  "conflict",
  "mourn",
  "hopeless",
  "dead-end",
];

export const positiveSentences: string[] = [
  "absolutely amazing",
  "loved every bite",
  "cooked to perfection",
  "best meal",
  "flavors were fantastic",
  "service was exceptional",
  "incredibly friendly",
  "staff went above and beyond",
  "top-notch service",
  "customer service was outstanding",
  "wonderful atmosphere",
  "beautiful and inviting",
  "very comfortable",
  "great vibe",
  "perfect for a nice evening",
  "delightful dining experience",
  "everything was perfect",
  "highly recommend",
  "fantastic time",
  "can't wait to come back",
];

export const negativeSentences: string[] = [
  "really bad",
  "didn't like",
  "very disappointed",
  "undercooked and bland",
  "worst meal",
  "flavors were terrible",
  "service was terrible",
  "rude and inattentive",
  "staff seemed uninterested",
  "very poor service",
  "customer service was dreadful",
  "unpleasant atmosphere",
  "outdated and uninviting",
  "very uncomfortable",
  "terrible vibe",
  "ambiance was awful",
  "horrible dining experience",
  "everything was bad",
  "do not recommend",
  "terrible time",
  "won't be coming back",
];

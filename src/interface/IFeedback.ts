export interface IFeedback {
  id: number;
  employeeId: number;
  foodItemId: number;
  foodItemName?: string;
  rating: number;
  comment: string;
  date: Date;
}

export interface IDetailedFeedbackQuestion {
  id: number;
  foodItemName: string;
  question: string;
  date: Date;
}

export interface IDetailedFeedbackAnswer {
  questionId: number;
  employeeId: number;
  answer: string;
  date?: Date;
}
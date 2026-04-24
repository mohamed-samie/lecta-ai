export type QuestionReview = {
  questionId: string;
  isCorrect: boolean;
  explanation: string;
  awardedMarks: number;
};

export type Attempt = {
  id: string;
  score: number;
  totalMarks: number;
  weakAreas: string[];
  reviews: QuestionReview[];
};

export type QuestionType = "mcq" | "short_answer";

export type ExamQuestion = {
  id: string;
  type: QuestionType;
  text: string;
  marks: number;
  options?: string[];
};

export type Exam = {
  id: string;
  title: string;
  instructions?: string;
  totalQuestions: number;
  questions: ExamQuestion[];
};

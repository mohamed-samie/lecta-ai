const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

type CreateMatchExamPayload = {
  title: string;
  lectureFile: File;
  previousExamFile: File;
};

export type CreateMatchExamResponse = {
  session_id: number;
  job_id: number;
  status: "pending" | "processing" | "completed" | "failed";
  progress_stage: string;
  poll_url?: string;
  files?: Array<{
    file_id?: number;
    filename?: string;
    file_type?: string;
  }>;
};

export type MatchExamJobStatusResponse = {
  status: "pending" | "processing" | "completed" | "failed";
  progress_stage: string;
  is_ready_for_exam_generation: boolean;
  error_message: string | null;
};

export type ExamQuestion = {
  type: "mcq";
  question: string;
  choices: string[];
  answer: string;
};

export type GenerateExamResponse = {
  exam_id: number;
  session_id: number;
  topic_plan: string[];
  exam: {
    questions: ExamQuestion[];
  };
};

export type GenerateExamOptions = {
  question_count: number;
  language: "english" | "arabic";
};

export type SubmitExamAnswer = {
  question_index: number;
  answer: string;
};

export type SubmitExamRequest = {
  session_id: number;
  exam_id: number;
  answers: SubmitExamAnswer[];
};

export type SubmitExamResponse = {
  exam_id: number;
  attempt_id: number;
  grading: {
    session_id: number;
    total_score: number;
    max_score: number;
    accuracy: number;
    graded_questions: Array<{
      question_index: number;
      question_type: string;
      question: string;
      student_answer: string;
      correct_answer: string;
      is_correct: boolean;
      awarded_score: number;
      max_score: number;
      explanation: string;
      weak_topic_tags: string[];
    }>;
    weak_areas_summary: string[];
  };
  feedback: {
    performance_summary: string;
    encouragement: string;
    weak_areas_explanation: string[];
    revision_recommendations: string[];
  };
};

export type AttemptReview = {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
  awardedScore: number;
  maxScore: number;
  weakTopicTags: string[];
};

export type AttemptData = {
  id: string;
  examId: number;
  sessionId: number;
  score: number;
  totalMarks: number;
  accuracy: number;
  weakAreas: string[];
  studyNext: string[];
  performanceSummary: string;
  encouragement: string;
  reviews: AttemptReview[];
};

export type LocalDashboardSession = {
  session_id: number;
  job_id: number;
  title: string;
  status: string;
  progress_stage: string;
  created_at: string;
  poll_url?: string;
};

export type LocalDashboardExam = {
  exam_id: number;
  session_id: number;
  title: string;
  topic_plan: string[];
  question_count: number;
  language: "english" | "arabic";
  created_at: string;
};

export type LocalDashboardAttempt = {
  attempt_id: number;
  exam_id: number;
  session_id: number;
  title: string;
  score: number;
  total_score: number;
  accuracy: number;
  weak_areas_summary: string[];
  created_at: string;
};

export type LocalDashboardData = {
  sessions: LocalDashboardSession[];
  exams: LocalDashboardExam[];
  attempts: LocalDashboardAttempt[];
};

const DASHBOARD_STORAGE_KEY = "lecta-dashboard-local-data";
const SESSION_META_KEY_PREFIX = "match-exam-session-meta:";
const GENERATED_EXAM_KEY_PREFIX = "generated-exam:";
const ATTEMPT_KEY_PREFIX = "match-exam-attempt:";

function getGeneratedExamStorageKey(examId: number | string) {
  return `${GENERATED_EXAM_KEY_PREFIX}${examId}`;
}

function getAttemptStorageKey(attemptId: number | string) {
  return `${ATTEMPT_KEY_PREFIX}${attemptId}`;
}

function getSessionMetaKey(sessionId: number | string) {
  return `${SESSION_META_KEY_PREFIX}${sessionId}`;
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function readJsonStorage<T>(key: string): T | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJsonStorage(key: string, value: unknown) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures
  }
}

function getDefaultDashboardData(): LocalDashboardData {
  return {
    sessions: [],
    exams: [],
    attempts: [],
  };
}

function getDashboardDataInternal(): LocalDashboardData {
  return readJsonStorage<LocalDashboardData>(DASHBOARD_STORAGE_KEY) ?? getDefaultDashboardData();
}

function saveDashboardDataInternal(data: LocalDashboardData) {
  writeJsonStorage(DASHBOARD_STORAGE_KEY, data);
}

function upsertByKey<T extends Record<string, unknown>>(
  items: T[],
  item: T,
  key: keyof T,
  limit = 12,
) {
  const filtered = items.filter((existing) => existing[key] !== item[key]);
  return [item, ...filtered].slice(0, limit);
}

async function parseErrorResponse(response: Response) {
  try {
    const data = await response.json();

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data?.detail)) {
      return "Please check the submitted fields and try again.";
    }

    return "Something went wrong. Please try again.";
  } catch {
    return "Something went wrong. Please try again.";
  }
}

export function getLocalDashboardData(): LocalDashboardData {
  return getDashboardDataInternal();
}

export function clearLocalDashboardData() {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(DASHBOARD_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function saveSessionMetaToStorage(sessionId: number, meta: { title: string }) {
  if (!canUseStorage()) return;
  writeJsonStorage(getSessionMetaKey(sessionId), meta);
}

export function getSessionMetaFromStorage(
  sessionId: number | string,
): { title: string } | null {
  return readJsonStorage<{ title: string }>(getSessionMetaKey(sessionId));
}

export function recordCreatedSessionToLocalDashboard(
  response: CreateMatchExamResponse,
  title: string,
) {
  if (!canUseStorage()) return;

  const current = getDashboardDataInternal();

  const sessionEntry: LocalDashboardSession = {
    session_id: response.session_id,
    job_id: response.job_id,
    title,
    status: response.status,
    progress_stage: response.progress_stage,
    created_at: new Date().toISOString(),
    poll_url: response.poll_url,
  };

  current.sessions = upsertByKey(current.sessions, sessionEntry, "session_id");
  saveDashboardDataInternal(current);
  saveSessionMetaToStorage(response.session_id, { title });
}

export function recordGeneratedExamToLocalDashboard(
  response: GenerateExamResponse,
  options?: GenerateExamOptions,
) {
  if (!canUseStorage()) return;

  const current = getDashboardDataInternal();
  const sessionMeta = getSessionMetaFromStorage(response.session_id);

  const examEntry: LocalDashboardExam = {
    exam_id: response.exam_id,
    session_id: response.session_id,
    title: sessionMeta?.title ?? "Match Exam",
    topic_plan: response.topic_plan ?? [],
    question_count: response.exam.questions.length,
    language: options?.language ?? "english",
    created_at: new Date().toISOString(),
  };

  current.exams = upsertByKey(current.exams, examEntry, "exam_id");
  saveDashboardDataInternal(current);
}

export function recordSubmittedAttemptToLocalDashboard(
  response: SubmitExamResponse,
) {
  if (!canUseStorage()) return;

  const current = getDashboardDataInternal();
  const sessionMeta = getSessionMetaFromStorage(response.grading.session_id);

  const attemptEntry: LocalDashboardAttempt = {
    attempt_id: response.attempt_id,
    exam_id: response.exam_id,
    session_id: response.grading.session_id,
    title: sessionMeta?.title ?? "Match Exam",
    score: response.grading.total_score,
    total_score: response.grading.max_score,
    accuracy: response.grading.accuracy,
    weak_areas_summary: response.grading.weak_areas_summary ?? [],
    created_at: new Date().toISOString(),
  };

  current.attempts = upsertByKey(current.attempts, attemptEntry, "attempt_id");
  saveDashboardDataInternal(current);
}

export async function createMatchExamJob({
  title,
  lectureFile,
  previousExamFile,
}: CreateMatchExamPayload): Promise<CreateMatchExamResponse> {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("lecture_file", lectureFile);
  formData.append("previous_exam_file", previousExamFile);

  const response = await fetch(`${API_BASE_URL}/match-exam/create`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  const data = (await response.json()) as CreateMatchExamResponse;
  recordCreatedSessionToLocalDashboard(data, title);
  return data;
}

export async function getMatchExamJob(
  jobId: number | string,
): Promise<MatchExamJobStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  return (await response.json()) as MatchExamJobStatusResponse;
}

export async function generateExam(
  sessionId: number | string,
  options?: GenerateExamOptions,
): Promise<GenerateExamResponse> {
  const response = await fetch(
    `${API_BASE_URL}/exam/generate?session_id=${sessionId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        options ?? {
          question_count: 10,
          language: "english",
        },
      ),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  const data = (await response.json()) as GenerateExamResponse;
  saveGeneratedExamToSessionStorage(data);
  recordGeneratedExamToLocalDashboard(data, options);
  return data;
}

export async function getExamById(
  examId: number | string,
): Promise<GenerateExamResponse> {
  const response = await fetch(`${API_BASE_URL}/exam/${examId}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  return (await response.json()) as GenerateExamResponse;
}

export function saveGeneratedExamToSessionStorage(
  exam: GenerateExamResponse,
): void {
  if (typeof window === "undefined") return;

  try {
    const key = getGeneratedExamStorageKey(exam.exam_id);
    sessionStorage.setItem(key, JSON.stringify(exam));
  } catch {
    // ignore storage failures
  }
}

export function getGeneratedExamFromSessionStorage(
  examId: number | string,
): GenerateExamResponse | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(getGeneratedExamStorageKey(examId));
    if (!raw) return null;
    return JSON.parse(raw) as GenerateExamResponse;
  } catch {
    return null;
  }
}

export async function submitExam(
  payload: SubmitExamRequest,
): Promise<SubmitExamResponse> {
  const response = await fetch(`${API_BASE_URL}/exam/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  const data = (await response.json()) as SubmitExamResponse;
  recordSubmittedAttemptToLocalDashboard(data);
  return data;
}

export function saveAttemptToSessionStorage(attempt: SubmitExamResponse): void {
  if (typeof window === "undefined") return;

  try {
    const key = getAttemptStorageKey(attempt.attempt_id);
    sessionStorage.setItem(key, JSON.stringify(attempt));
  } catch {
    // ignore storage failures
  }
}

export function getAttemptFromSessionStorage(
  attemptId: number | string,
): SubmitExamResponse | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(getAttemptStorageKey(attemptId));
    if (!raw) return null;
    return JSON.parse(raw) as SubmitExamResponse;
  } catch {
    return null;
  }
}

export function mapSubmitResponseToAttemptData(
  response: SubmitExamResponse,
): AttemptData {
  const reviews: AttemptReview[] = response.grading.graded_questions.map(
    (question) => ({
      questionId: `attempt-${response.attempt_id}-question-${question.question_index}`,
      question: question.question,
      userAnswer: question.student_answer,
      correctAnswer: question.correct_answer,
      explanation: question.explanation,
      isCorrect: question.is_correct,
      awardedScore: question.awarded_score,
      maxScore: question.max_score,
      weakTopicTags: question.weak_topic_tags ?? [],
    }),
  );

  return {
    id: String(response.attempt_id),
    examId: response.exam_id,
    sessionId: response.grading.session_id,
    score: response.grading.total_score,
    totalMarks: response.grading.max_score,
    accuracy: response.grading.accuracy,
    weakAreas: response.grading.weak_areas_summary ?? [],
    studyNext: response.feedback.revision_recommendations ?? [],
    performanceSummary: response.feedback.performance_summary ?? "",
    encouragement: response.feedback.encouragement ?? "",
    reviews,
  };
}

export async function getAttemptById(
  attemptId: number | string,
): Promise<SubmitExamResponse> {
  const response = await fetch(`${API_BASE_URL}/attempt/${attemptId}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  return (await response.json()) as SubmitExamResponse;
}
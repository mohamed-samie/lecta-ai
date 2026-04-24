import json
import re

from langchain_core.prompts import ChatPromptTemplate

from app.schemas.exam import GeneratedExam
from app.services.exam_cleaner import clean_generated_exam_payload
from app.services.llm import get_llm
from app.services.question_validator import validate_question_payload


WEAK_QUESTION_PATTERNS = [
    r"^what is the primary step",
    r"^what is the primary purpose",
    r"^what is the time complexity",
    r"^what happens to the array after",
]


def _clean_json_text(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[len("```json"):].strip()
    elif cleaned.startswith("```"):
        cleaned = cleaned[len("```"):].strip()
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3].strip()
    return cleaned


def _join_chunks(chunks: list[str], max_chars: int) -> str:
    return "\n\n".join(chunks)[:max_chars]


def _normalize_question(parsed: dict) -> dict | None:
    if not isinstance(parsed, dict):
        return None

    if "questions" in parsed and isinstance(parsed["questions"], list) and parsed["questions"]:
        candidate = parsed["questions"][0]
    else:
        candidate = parsed

    if not isinstance(candidate, dict):
        return None

    if not all(k in candidate for k in ["type", "question", "choices", "answer"]):
        return None

    cleaned = clean_generated_exam_payload({"questions": [candidate]})
    questions = cleaned.get("questions", [])
    if not questions:
        return None

    q = questions[0]
    return q if q.get("type") == "mcq" else None


def _looks_weak(question_text: str) -> bool:
    q = question_text.strip().lower()
    return any(re.search(pattern, q) for pattern in WEAK_QUESTION_PATTERNS)


def _fallback_exam(topic_plan: list[str], question_count: int, language: str) -> GeneratedExam:
    topics = [t.strip() for t in topic_plan if t and t.strip()]
    if not topics:
        if language == "arabic":
            topics = [
                "المفهوم الرئيسي في المحاضرة",
                "فكرة أساسية",
                "مثال مهم",
                "تمييز مفاهيمي",
                "خطأ شائع",
                "تطبيق عملي",
            ]
        else:
            topics = [
                "Main lecture topic",
                "Important lecture concept",
                "Key example from lecture",
                "Conceptual distinction in lecture",
                "Common mistake in lecture",
                "Applied idea from lecture",
            ]

    questions = []
    for i in range(question_count):
        topic = topics[i % len(topics)]

        if language == "arabic":
            questions.append(
                {
                    "type": "mcq",
                    "question": f"أي العبارات التالية هي الأدق بخصوص {topic} وفقًا للمحاضرة؟",
                    "choices": [
                        f"يُعرض {topic} في المحاضرة كمفهوم أو خطوة مهمة",
                        f"يُعتبر {topic} غير مرتبط بالمحاضرة تمامًا",
                        f"تؤكد المحاضرة أن {topic} لا يؤثر أبدًا في النتيجة",
                        f"لا تذكر المحاضرة {topic} إطلاقًا",
                    ],
                    "answer": f"يُعرض {topic} في المحاضرة كمفهوم أو خطوة مهمة",
                }
            )
        else:
            questions.append(
                {
                    "type": "mcq",
                    "question": f"Which of the following is most accurate about {topic} according to the lecture?",
                    "choices": [
                        f"{topic} is described as an important concept or step",
                        f"{topic} is completely unrelated to the lecture",
                        f"{topic} is explicitly rejected in every case",
                        f"{topic} is never connected to the overall process",
                    ],
                    "answer": f"{topic} is described as an important concept or step",
                }
            )

    payload = clean_generated_exam_payload({"questions": questions[:question_count]})
    return GeneratedExam.model_validate(payload)


_SYSTEM_PROMPT = """You are a university professor writing an exam.

Generate EXACTLY {question_count} MCQ questions.

STRICT RULES:
1. Use ONLY the Lecture Context as the source of facts and subject matter
2. Use Previous Exam Context and Style Summary ONLY for:
   - tone
   - phrasing
   - difficulty
   - question style
3. Use the Topic Plan as a coverage guide:
   - each question should cover a DIFFERENT topic if possible
   - avoid repeating the same idea in multiple questions
4. Strongly prefer questions that test:
   - tracing a process or algorithm step-by-step
   - analyzing a scenario or edge case
   - comparing two outcomes or behaviors
   - identifying why a step succeeds or fails
   - input-dependent behavior
5. Avoid weak textbook starters such as:
   - "What is the primary purpose..."
   - "What is the primary step..."
   - "What is the time complexity..." unless the rest of the question is analytical
6. Prefer question openings like:
   - "Consider..."
   - "Suppose..."
   - "Which scenario..."
   - "If..."
   - "After..."
   - "Why..."
7. Output language requirement:
   - If requested language is english, write all questions and choices in English
   - If requested language is arabic, write all questions and choices in Arabic
8. Every question must:
   - have type = "mcq"
   - include exactly 4 choices
   - include the exact correct choice text in "answer"
9. Return ONLY valid JSON
10. Do not wrap the answer in markdown fences

Return JSON in this exact format:

{{
  "questions": [
    {{
      "type": "mcq",
      "question": "...",
      "choices": ["choice 1", "choice 2", "choice 3", "choice 4"],
      "answer": "exact correct choice text"
    }}
  ]
}}
"""

_HUMAN_PROMPT = """Requested language:
{language}

Question count:
{question_count}

Topic Plan:
{topic_plan}

Lecture Context:
{lecture_context}

Previous Exam Context (style only):
{exam_context}

Previous Exam Style Summary:
{exam_style}

Additional instruction:
{retry_instruction}
"""


def generate_exam(
    lecture_context_chunks: list[str],
    exam_context_chunks: list[str],
    exam_style: str,
    topic_plan: list[str] | None = None,
    focus_context: str = "",
    question_count: int = 6,
    language: str = "english",
) -> GeneratedExam:
    llm = get_llm()

    lecture_context = _join_chunks(lecture_context_chunks, 4200)
    exam_context = _join_chunks(exam_context_chunks, 1200)
    exam_style = (exam_style or "")[:500]

    topics = [t.strip() for t in (topic_plan or []) if t and t.strip()]
    if not topics:
        if language == "arabic":
            topics = [
                "المفهوم الرئيسي في المحاضرة",
                "فكرة أساسية",
                "مثال مهم",
                "تمييز مفاهيمي",
                "خطأ شائع",
                "تطبيق عملي",
            ]
        else:
            topics = [
                "Main lecture topic",
                "Important lecture concept",
                "Key example from lecture",
                "Conceptual distinction in lecture",
                "Common mistake in lecture",
                "Applied idea from lecture",
            ]

    topic_plan_text = "\n".join(f"- {t}" for t in topics[:max(question_count, len(topics))])

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", _SYSTEM_PROMPT),
            ("human", _HUMAN_PROMPT),
        ]
    )
    chain = prompt | llm

    retry_instructions = [
        "Generate a clear exam question set based on the lecture.",
        "Retry: make the questions more analytical or scenario-based, and avoid weak textbook wording.",
    ]

    for retry_instruction in retry_instructions:
        try:
            result = chain.invoke(
                {
                    "question_count": question_count,
                    "language": language,
                    "topic_plan": topic_plan_text,
                    "lecture_context": lecture_context,
                    "exam_context": exam_context,
                    "exam_style": exam_style,
                    "retry_instruction": retry_instruction,
                }
            )

            cleaned_text = _clean_json_text(result.content)
            parsed = json.loads(cleaned_text)
            cleaned_payload = clean_generated_exam_payload(parsed)

            questions = cleaned_payload.get("questions", [])
            if len(questions) < max(4, min(question_count, 4)):
                continue

            validated = []
            seen = set()

            for q in questions[:question_count]:
                is_valid, _ = validate_question_payload(q)
                if not is_valid:
                    continue

                q_text = q["question"].strip()
                if language == "english" and _looks_weak(q_text):
                    continue

                key = q_text.lower()
                if key in seen:
                    continue

                seen.add(key)
                validated.append(q)

            if len(validated) < min(question_count, 4):
                continue

            while len(validated) < question_count:
                validated.append(validated[len(validated) % len(validated)])

            return GeneratedExam.model_validate({"questions": validated[:question_count]})

        except Exception:
            continue

    return _fallback_exam(topics, question_count=question_count, language=language)
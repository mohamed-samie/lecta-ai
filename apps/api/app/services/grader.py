import re

from app.schemas.exam import GeneratedExam
from app.schemas.grading import (
    ExamSubmission,
    GradedQuestion,
    ExamGradingResult,
)


def _extract_weak_tags(question_text: str) -> list[str]:
    words = re.findall(r"[A-Za-z][A-Za-z\-]{3,}", question_text.lower())

    stopwords = {
        "which", "following", "best", "does", "what", "when", "with",
        "from", "this", "that", "your", "have", "will", "into", "about",
        "there", "where", "statement", "lecture", "question",
    }

    tags = []
    seen = set()

    for word in words:
        if word in stopwords:
            continue
        if word in seen:
            continue
        seen.add(word)
        tags.append(word)
        if len(tags) >= 3:
            break

    return tags or ["review_topic"]


def grade_mcq_exam(
    exam: GeneratedExam,
    submission: ExamSubmission,
) -> ExamGradingResult:
    questions = exam.questions
    answers_map = {a.question_index: a.answer.strip() for a in submission.answers}

    graded_questions = []
    total_score = 0.0
    max_score = float(len(questions))

    weak_topics = []

    for idx, q in enumerate(questions):
        student_answer = answers_map.get(idx, "").strip()
        correct_answer = q.answer.strip()

        is_correct = student_answer == correct_answer
        score = 1.0 if is_correct else 0.0

        if is_correct:
            explanation = "Correct answer."
            weak_tags = []
        else:
            explanation = f"Incorrect. Correct answer is: {correct_answer}"
            weak_tags = _extract_weak_tags(q.question)
            weak_topics.extend(weak_tags)

        total_score += score

        graded_questions.append(
            GradedQuestion(
                question_index=idx,
                question_type="mcq",
                question=q.question,
                student_answer=student_answer,
                correct_answer=correct_answer,
                is_correct=is_correct,
                awarded_score=score,
                max_score=1.0,
                explanation=explanation,
                weak_topic_tags=weak_tags,
            )
        )

    accuracy = (total_score / max_score) * 100 if max_score > 0 else 0.0
    weak_summary = list(dict.fromkeys(weak_topics))[:5]

    return ExamGradingResult(
        session_id=submission.session_id,
        total_score=total_score,
        max_score=max_score,
        accuracy=round(accuracy, 2),
        graded_questions=graded_questions,
        weak_areas_summary=weak_summary,
    )
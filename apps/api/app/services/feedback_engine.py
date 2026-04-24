from langchain_core.prompts import ChatPromptTemplate

from app.schemas.grading import ExamGradingResult
from app.services.llm import get_llm


def generate_feedback(grading_result: ExamGradingResult) -> dict:
    llm = get_llm()

    weak_areas = grading_result.weak_areas_summary or []
    weak_areas_text = "\n".join(f"- {item}" for item in weak_areas) if weak_areas else "None"

    incorrect_questions = [
        {
            "question": q.question,
            "student_answer": q.student_answer,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation,
        }
        for q in grading_result.graded_questions
        if not q.is_correct
    ]

    incorrect_questions_text = "\n\n".join(
        [
            f"Question: {item['question']}\n"
            f"Student Answer: {item['student_answer']}\n"
            f"Correct Answer: {item['correct_answer']}\n"
            f"Explanation: {item['explanation']}"
            for item in incorrect_questions
        ]
    )

    if not incorrect_questions_text:
        incorrect_questions_text = "The student answered all questions correctly."

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
You are an academic learning coach.

Your task is to generate personalized feedback for a student after an exam.

Requirements:
- Be concise, supportive, and practical
- Summarize performance level
- Explain the main weak areas
- Suggest what the student should revise next
- Give short targeted advice
- Return ONLY valid JSON
- Do not wrap the output in markdown fences

Return JSON in this exact format:

{{
  "performance_summary": "...",
  "encouragement": "...",
  "weak_areas_explanation": ["...", "..."],
  "revision_recommendations": ["...", "...", "..."]
}}
"""
            ),
            (
                "human",
                """
Exam score:
- Total Score: {total_score}
- Max Score: {max_score}
- Accuracy: {accuracy}%

Weak Areas:
{weak_areas_text}

Incorrect Questions:
{incorrect_questions_text}
"""
            ),
        ]
    )

    chain = prompt | llm
    result = chain.invoke(
        {
            "total_score": grading_result.total_score,
            "max_score": grading_result.max_score,
            "accuracy": grading_result.accuracy,
            "weak_areas_text": weak_areas_text,
            "incorrect_questions_text": incorrect_questions_text[:5000],
        }
    )

    content = result.content.strip()

    if content.startswith("```json"):
        content = content[len("```json"):].strip()
    elif content.startswith("```"):
        content = content[len("```"):].strip()

    if content.endswith("```"):
        content = content[:-3].strip()

    import json

    try:
        return json.loads(content)
    except Exception:
        return {
            "performance_summary": "Feedback generation failed, but grading was completed successfully.",
            "encouragement": "Keep practicing and review your incorrect answers carefully.",
            "weak_areas_explanation": weak_areas[:3] if weak_areas else [],
            "revision_recommendations": [
                "Review the topics you answered incorrectly.",
                "Focus on the lecture concepts that appeared in the exam.",
                "Practice similar MCQ questions again.",
            ],
        }
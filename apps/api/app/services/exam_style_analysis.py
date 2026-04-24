import re


def analyze_exam_style(previous_exam_text: str) -> str:
    """
    Lightweight heuristic style analysis.
    No LLM call.

    Returns a compact style description for prompt conditioning.
    """
    text = previous_exam_text.strip()
    if not text:
        return "Style: concise university exam, MCQ-oriented."

    lowered = text.lower()

    mcq_markers = sum(
        marker in lowered
        for marker in ["a)", "b)", "c)", "d)", "a.", "b.", "c.", "d."]
    )

    question_count = len(re.findall(r"\?", text))
    avg_question_length = max(1, len(text) // max(1, question_count or 1))

    tone = []
    tone.append("MCQ-heavy" if mcq_markers >= 4 else "mixed-format")
    tone.append("concise" if avg_question_length < 180 else "detailed")
    tone.append("university-level")

    return (
        "Professor style summary: "
        + ", ".join(tone)
        + ". Prefer direct exam phrasing and plausible distractors."
    )
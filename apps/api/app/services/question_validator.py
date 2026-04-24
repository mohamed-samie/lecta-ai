import re
from typing import Any


BAD_PATTERNS = [
    r"\[fallback",
    r"\.\.\.\.\.",
    r"……",
    r"lorem ipsum",
]

# Generic question openers that produce near-zero signal
# These are the patterns seen in the collapsed output
GENERIC_STARTS = [
    "what is the definition of",
    "what is meant by",
]

# Weak openers that indicate meta/placeholder generation
# Checked against the normalized question text
WEAK_OPENERS = [
    "which of the following is most accurate about",
    "which statement best reflects",
    "which statement best describes",
    "which of the following best reflects",
    "which of the following best describes",
    "which of the following is correct about",
    "which of the following is true about",
    "according to the lecture, which statement about",
    "according to the lecture, which of the following",
    "which of the following correctly describes",
    "what is the primary purpose of",
    "what is the primary step",
    "what is the main purpose of",
    "what is the most important",
]

# Weak choice patterns — if most choices follow this template, the question is a fallback
_WEAK_CHOICE_PATTERNS = [
    r"is described as an important concept or step",
    r"is completely unrelated to the lecture",
    r"is explicitly rejected in every case",
    r"is never connected to the overall process",
    r"is presented as a valid concept or step",
    r"rejects .+ as irrelevant in all cases",
    r"states that .+ never affects the outcome",
    r"does not mention .+ at all",
    r"presents .+ as a valid concept",
]


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def _has_bad_pattern(text: str) -> bool:
    lowered = text.lower()
    return any(re.search(pattern, lowered) for pattern in BAD_PATTERNS)


def _has_weak_opener(question_text: str) -> bool:
    """Return True if the question starts with a known weak/meta opener."""
    normalized = _normalize(question_text)
    return any(normalized.startswith(opener) for opener in WEAK_OPENERS)


def _choices_are_placeholder(choices: list[str]) -> bool:
    """
    Return True if the choices look like fallback template choices.
    Triggers if 3 or more choices match weak choice patterns.
    """
    match_count = 0
    for choice in choices:
        c_lower = choice.lower()
        for pattern in _WEAK_CHOICE_PATTERNS:
            if re.search(pattern, c_lower):
                match_count += 1
                break
    return match_count >= 3


def validate_question_payload(question: dict[str, Any]) -> tuple[bool, str]:
    """
    Relaxed rule-based validation for MVP stability.

    Goal:
    - reject clearly broken payloads
    - reject fallback/placeholder-style questions
    - accept decent questions even if they are not perfect
    - avoid triggering fallback too aggressively on real questions
    """
    if not isinstance(question, dict):
        return False, "question is not a dict"

    required_fields = ["type", "question", "choices", "answer"]
    for field in required_fields:
        if field not in question:
            return False, f"missing field: {field}"

    if question["type"] != "mcq":
        return False, "question type is not mcq"

    q_text = str(question["question"]).strip()
    answer = str(question["answer"]).strip()
    choices = question["choices"]

    if not q_text:
        return False, "empty question text"

    if _has_bad_pattern(q_text):
        return False, "bad pattern in question text"

    # Reject meta/placeholder questions
    if _has_weak_opener(q_text):
        return False, "question uses a weak/meta opener"

    if not isinstance(choices, list):
        return False, "choices is not a list"

    cleaned_choices = [str(c).strip() for c in choices if str(c).strip()]
    if len(cleaned_choices) != 4:
        return False, "question does not have exactly 4 valid choices"

    # reject only exact duplicates, not semantically similar choices
    normalized_choices = [c.strip().lower() for c in cleaned_choices]
    if len(set(normalized_choices)) < 4:
        return False, "choices are duplicated"

    if answer not in cleaned_choices:
        matched = next((c for c in cleaned_choices if _normalize(c) == _normalize(answer)), None)
        if not matched:
            return False, "answer is not present in choices"

    combined_text = q_text + " " + " ".join(cleaned_choices)
    if _has_bad_pattern(combined_text):
        return False, "bad pattern in combined question payload"

    # Reject if choices look like the last-resort fallback template
    if _choices_are_placeholder(cleaned_choices):
        return False, "choices match fallback placeholder pattern"

    return True, "ok"
import re
from collections import Counter


def analyze_lecture(lecture_text: str) -> str:
    """
    Lightweight heuristic lecture analysis.
    No LLM call.

    Returns a short structured summary that can help retrieval and generation
    without consuming Groq tokens.
    """
    text = lecture_text.strip()
    if not text:
        return "No lecture content available."

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)

    # Take a short excerpt for context
    excerpt = text[:1200]

    # Extract simple keyword hints
    words = re.findall(r"[A-Za-z][A-Za-z\-]{3,}", text.lower())
    stopwords = {
        "this", "that", "with", "from", "into", "there", "their", "which",
        "where", "when", "what", "have", "will", "would", "been", "were",
        "your", "about", "algorithm", "lecture", "example", "using",
        "than", "then", "them", "they", "also", "such", "these", "those",
        "sort", "method", "equation", "analysis",
    }

    filtered = [w for w in words if w not in stopwords]
    common = [w for w, _ in Counter(filtered).most_common(8)]

    summary_parts = [
        "Lecture excerpt:",
        excerpt,
    ]

    if common:
        summary_parts += [
            "",
            "Frequent lecture terms:",
            ", ".join(common),
        ]

    return "\n".join(summary_parts)
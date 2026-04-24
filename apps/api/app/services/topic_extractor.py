import json
import re
from collections import Counter

from langchain_core.prompts import ChatPromptTemplate
from app.services.llm import get_llm


def _clean_json_text(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```.*?\n", "", text)
        text = re.sub(r"\n```$", "", text)
    return text.strip()


# Patterns that indicate a topic is a structural fragment, not a concept
_NOISE_PATTERNS = [
    r"^section\s*\d",          # "Section 5", "Section 3.2"
    r"^chapter\s*\d",          # "Chapter 2"
    r"^figure\s*\d",           # "Figure 1"
    r"^table\s*\d",            # "Table 3"
    r"^step\s*\d",             # "Step 1"
    r"^part\s*\d",             # "Part 2"
    r"^slide\s*\d",            # "Slide 4"
    r"^page\s*\d",             # "Page 10"
    r"^\d+[\.\)]\s*",          # "1. something", "2) something"
    r"^[ivxlcdm]+\.\s",        # Roman numeral list items
]

# Exact or near-exact structural labels that add no content
_NOISE_EXACT = {
    "algorithm steps",
    "algorithm step",
    "visualization",
    "visual sort here",
    "introduction",
    "summary",
    "conclusion",
    "overview",
    "review",
    "example",
    "examples",
    "exercises",
    "exercise",
    "definition",
    "definitions",
    "notes",
    "note",
    "references",
    "reference",
    "appendix",
    "background",
    "motivation",
    "outline",
    "agenda",
    "recap",
    "objective",
    "objectives",
    "learning objectives",
    "key points",
    "key terms",
    "terminology",
}

# Topics that are just code symbols, punctuation, or very short fragments
_MIN_TOPIC_LEN = 8
_MAX_TOPIC_LEN = 80


def _is_noisy_topic(topic: str) -> bool:
    """Return True if this topic string is a structural fragment, not a concept."""
    t = topic.strip()

    if len(t) < _MIN_TOPIC_LEN or len(t) > _MAX_TOPIC_LEN:
        return True

    # Pure symbol / code fragments
    if re.match(r"^[\W\d_]+$", t):
        return True

    # Mostly non-alphabetic (e.g. "O(n log n)", "n/2 + 1")
    alpha_ratio = sum(c.isalpha() for c in t) / max(len(t), 1)
    if alpha_ratio < 0.4:
        return True

    t_lower = t.lower().strip()

    # Exact structural noise
    if t_lower in _NOISE_EXACT:
        return True

    # Pattern-based structural noise
    for pattern in _NOISE_PATTERNS:
        if re.match(pattern, t_lower):
            return True

    # Raw sub-phrases that are just prepositional fragments
    # e.g. "elements into two subarrays", "elements smaller than or equal the pivot"
    # These start with a lowercase noun fragment followed by a preposition
    if re.match(r"^[a-z].*\b(into|from|of|with|than|or|and|the|by|for|in|on|at)\b", t_lower):
        # only flag as noisy if it reads like a mid-sentence fragment (no verb)
        has_verb_hint = bool(re.search(r"\b(is|are|was|were|has|have|does|do|can|will|should|must|means|refers|defines|indicates|determines|affects|causes|results|produces|allows|requires|uses|makes|gives|represents)\b", t_lower))
        if not has_verb_hint:
            return True

    return False


def _filter_topics(topics: list[str]) -> list[str]:
    """Remove noisy/structural topics, deduplicate, preserve order."""
    seen: set[str] = set()
    result: list[str] = []
    for t in topics:
        t_stripped = t.strip()
        if _is_noisy_topic(t_stripped):
            continue
        key = t_stripped.lower()
        if key in seen:
            continue
        seen.add(key)
        result.append(t_stripped)
    return result


def _extract_local_topics(text: str, max_topics: int = 6) -> list[str]:
    """
    Cheap heuristic fallback from lecture text itself.
    Better than generic placeholders.
    """
    lines = [line.strip(" -•:\t") for line in text.splitlines() if line.strip()]
    candidates = []

    for line in lines:
        if 8 <= len(line) <= 80:
            candidates.append(line)

    phrases = re.findall(r"\b([A-Z]?[A-Za-z]+(?:\s+[A-Z]?[A-Za-z]+){0,4})\b", text)
    cleaned = []
    for p in phrases:
        p = p.strip(" -•:\t,.")
        if 8 <= len(p) <= 60:
            cleaned.append(p)

    counts = Counter(cleaned)

    topics: list[str] = []
    seen: set[str] = set()

    for item in candidates:
        key = item.lower()
        if key not in seen and not _is_noisy_topic(item):
            seen.add(key)
            topics.append(item)
        if len(topics) >= max_topics:
            return topics[:max_topics]

    for phrase, _ in counts.most_common(20):
        key = phrase.lower()
        if key not in seen and not _is_noisy_topic(phrase):
            seen.add(key)
            topics.append(phrase)
        if len(topics) >= max_topics:
            break

    if not topics:
        topics = [
            "Main lecture topic",
            "Important lecture concept",
            "Key example from lecture",
            "Conceptual distinction in lecture",
            "Common mistake in lecture",
            "Applied idea from lecture",
        ]

    return topics[:max_topics]


def extract_topic_plan(
    lecture_summary: str,
    lecture_context_chunks: list[str],
    max_topics: int = 6,
) -> list[str]:
    """
    Hybrid topic extractor:
    - tries one low-cost LLM call
    - falls back to lecture-derived local extraction
    - avoids generic placeholder topic plans
    - post-filters structural noise before returning
    """
    llm = get_llm()
    context = "\n\n".join(lecture_context_chunks[:25])[:3000]

    prompt = ChatPromptTemplate.from_messages([
        ("system", """Extract 5-6 specific, exam-worthy topics from the lecture.

Rules:
- Topics must be concrete concepts, methods, or ideas — not section headers
- Avoid generic labels like "main concept", "important idea", or "algorithm steps"
- Avoid incomplete phrases like "elements into two subarrays"
- Avoid section numbers like "Section 5" or "Step 3"
- Prefer named concepts, processes, mechanisms, distinctions, or named operations
- Each topic should be distinct and testable in an exam question
- Each topic should be a noun phrase between 3 and 8 words

Return ONLY JSON:
{
  "topics": ["topic1", "topic2"]
}
"""),
        ("human", "{context}")
    ])

    chain = prompt | llm

    try:
        result = chain.invoke({"context": context})
        cleaned = _clean_json_text(result.content)
        parsed = json.loads(cleaned)
        topics = parsed.get("topics", [])
        topics = [t.strip() for t in topics if isinstance(t, str) and len(t.strip()) > 5]

        # Post-filter: remove structural noise from LLM output
        topics = _filter_topics(topics)

        bad_generic = {
            "core concept from lecture",
            "key algorithm behavior",
            "important reasoning step",
            "common misconception",
            "time complexity reasoning",
            "applied scenario",
        }

        if topics and not all(t.lower() in bad_generic for t in topics):
            return topics[:max_topics]

    except Exception:
        pass

    source_text = context or lecture_summary
    raw = _extract_local_topics(source_text, max_topics=max_topics * 2)
    filtered = _filter_topics(raw)
    return filtered[:max_topics]
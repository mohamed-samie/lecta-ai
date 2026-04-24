def build_lecture_queries(
    lecture_summary: str,
    exam_style: str,
    exam_context_chunks: list[str],
    topic_plan: list[str] | None = None,
) -> list[str]:
    """
    Build semantic retrieval queries for diverse lecture context.

    Design:
    - topic-first retrieval for coverage
    - lecture-summary retrieval for breadth
    - light style/phrasing hint from previous exam
    - domain-agnostic (no subject assumptions)
    """
    queries: list[str] = []

    # 1) Topic-specific queries first
    if topic_plan:
        for topic in topic_plan:
            topic = topic.strip()
            if topic:
                queries.append(topic)

    # 2) Generic breadth queries
    queries += [
        "important concepts and core ideas from the lecture",
        "applied reasoning, interpretation, and critical thinking from the lecture",
        "subtle distinctions, comparisons, and non-obvious points from the lecture",
        "examples, implications, exceptions, and edge cases from the lecture",
        "common misunderstandings or confusing parts from the lecture",
    ]

    # 3) Lecture summary anchor
    if lecture_summary and lecture_summary.strip():
        queries.append(lecture_summary[:300])

    # 4) Very light style hint from previous exam/style analysis
    # This should influence phrasing retrieval slightly, not content selection.
    if exam_style and exam_style.strip():
        queries.append(f"exam-style phrasing similar to: {exam_style[:120]}")

    if exam_context_chunks:
        exam_context_hint = " ".join(exam_context_chunks)[:160].strip()
        if exam_context_hint:
            queries.append(f"professor-style question wording like: {exam_context_hint}")

    # deduplicate while preserving order
    seen = set()
    deduped = []
    for q in queries:
        normalized = q.strip().lower()
        if normalized and normalized not in seen:
            seen.add(normalized)
            deduped.append(q.strip())

    return deduped
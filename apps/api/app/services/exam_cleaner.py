def clean_generated_exam_payload(payload: dict) -> dict:
    questions = payload.get("questions", [])
    cleaned_questions = []

    for q in questions:
        q_type = str(q.get("type", "")).strip().lower()
        question = str(q.get("question", "")).strip()
        answer = str(q.get("answer", "")).strip()

        if not question or not answer:
            continue

        if q_type != "mcq":
            continue

        raw_choices = q.get("choices") or []
        choices = []

        for item in raw_choices:
            item = str(item).strip()
            if item and item not in choices:
                choices.append(item)

        choices = choices[:4]

        if len(choices) != 4:
            continue

        # normalize answers like A / B / C / D
        answer_map = {
            "A": 0,
            "B": 1,
            "C": 2,
            "D": 3,
        }

        upper_answer = answer.upper().strip()

        if upper_answer in answer_map:
            idx = answer_map[upper_answer]
            if idx < len(choices):
                answer = choices[idx]

        if answer not in choices:
            matched = next((c for c in choices if c.lower() == answer.lower()), None)
            if matched:
                answer = matched
            else:
                continue

        cleaned_questions.append(
            {
                "type": "mcq",
                "question": question,
                "choices": choices,
                "answer": answer,
            }
        )

    return {"questions": cleaned_questions}
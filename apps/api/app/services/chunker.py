import re


def chunk_text(text: str, max_chars: int = 600, overlap: int = 1) -> list[str]:
    """
    Split text on sentence boundaries instead of raw character count.
    Produces cleaner chunks that respect semantic units, improving embedding quality.
    overlap = number of sentences to carry over into the next chunk for context continuity.
    """
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    sentences = [s.strip() for s in sentences if s.strip()]

    chunks = []
    current_sentences: list[str] = []
    current_len = 0

    for sentence in sentences:
        sentence_len = len(sentence)

        if current_len + sentence_len > max_chars and current_sentences:
            chunks.append(" ".join(current_sentences))
            # keep last `overlap` sentences for context continuity
            current_sentences = current_sentences[-overlap:] if overlap else []
            current_len = sum(len(s) for s in current_sentences)

        current_sentences.append(sentence)
        current_len += sentence_len

    if current_sentences:
        chunks.append(" ".join(current_sentences))

    return chunks


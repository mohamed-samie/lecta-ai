from sentence_transformers import SentenceTransformer

_model = SentenceTransformer("all-MiniLM-L6-v2")


def embed_text(text: str) -> list[float]:
    embedding = _model.encode(text)
    return embedding.tolist()


def embed_chunks(chunks: list[str]) -> list[dict]:
    embedded_chunks = []

    for chunk in chunks:
        embedded_chunks.append(
            {
                "text": chunk,
                "embedding": embed_text(chunk),
            }
        )

    return embedded_chunks
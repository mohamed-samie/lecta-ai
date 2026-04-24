import numpy as np

from app.services.embedder import embed_text


def cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    a = np.array(vec1)
    b = np.array(vec2)

    denom = np.linalg.norm(a) * np.linalg.norm(b)
    if denom == 0:
        return 0.0

    return float(np.dot(a, b) / denom)


def retrieve_top_k(
    query: str,
    embedded_chunks: list[dict],
    k: int = 3,
) -> list[dict]:
    query_embedding = embed_text(query)

    scored_chunks = []

    for item in embedded_chunks:
        score = cosine_similarity(query_embedding, item["embedding"])
        scored_chunks.append(
            {
                "text": item["text"],
                "embedding": item["embedding"],
                "score": score,
            }
        )

    scored_chunks.sort(key=lambda x: x["score"], reverse=True)
    return scored_chunks[:k]


def retrieve_diverse_context(
    queries: list[str],
    embedded_chunks: list[dict],
    k_per_query: int = 2,
    max_total: int = 6,
) -> list[str]:
    """
    Retrieve diverse lecture chunks using multiple semantic queries.
    """
    all_results: list[str] = []

    for query in queries:
        top_chunks = retrieve_top_k(
            query=query,
            embedded_chunks=embedded_chunks,
            k=k_per_query,
        )
        all_results.extend([item["text"] for item in top_chunks])

    seen = set()
    unique_results: list[str] = []

    for text in all_results:
        normalized = text.strip()
        if normalized and normalized not in seen:
            seen.add(normalized)
            unique_results.append(normalized)

    return unique_results[:max_total]
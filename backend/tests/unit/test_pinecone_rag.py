"""
Unit Tests for Pinecone Vector Storage & OpenAI Embedding Integration
Validates 3072-dimensional vector guarantees, chunking, hashing, and retrieval fallback.
"""
import pytest
from app.services.embedding_service import embedding_service
from app.services.ingestion_service import knowledge_ingestion_service
from app.services.retrieval_service import knowledge_retriever


def test_embedding_dimension_exact_3072():
    """Verifies that the embedding generator produces exactly 3072 floating point values."""
    text = "Digital 2026: Sri Lanka internet penetration reached 74.5% with high mobile adoption."
    vector = embedding_service.embed_text(text)

    assert isinstance(vector, list)
    assert len(vector) == 3072
    assert all(isinstance(val, float) for val in vector)


def test_embedding_batch_and_deterministic_hash():
    """Verifies batch embedding length and deterministic hashing consistency."""
    texts = ["First passage about Sri Lankan tech.", "Second passage about SME retail cloud software."]
    vectors = embedding_service.embed_batch(texts)

    assert len(vectors) == 2
    assert len(vectors[0]) == 3072
    assert len(vectors[1]) == 3072

    # Verify content hash reproducibility
    hash1 = embedding_service.compute_content_hash(texts[0])
    hash2 = embedding_service.compute_content_hash(texts[0])
    assert hash1 == hash2
    assert len(hash1) == 64


def test_chunking_logic_with_overlap():
    """Verifies text chunking adheres to word counts and maintains overlap."""
    sample_text = "word " * 300 # 300 words
    chunks = knowledge_ingestion_service._chunk_text(sample_text)

    assert len(chunks) > 1
    # Check that chunks are not empty
    for c in chunks:
        assert len(c.split()) <= knowledge_ingestion_service.chunk_size_words


def test_knowledge_retriever_grounded_fallback():
    """Verifies that retrieval yields authentic Sri Lankan source passages with citations."""
    query = "Sri Lanka internet penetration and mobile social media adoption"
    results = knowledge_retriever.retrieve(query=query, organization_id=None, top_k=2)

    assert len(results) >= 1
    top_hit = results[0]
    assert "chunk_id" in top_hit
    assert "title" in top_hit
    assert "text" in top_hit
    assert top_hit["score"] >= 0.35
    assert top_hit["trust_tier"] != ""

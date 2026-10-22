"""
OpenAI Embedding Service (3072-Dimensional Dense Vectors)
Standardized on OpenAI text-embedding-3-large for Pinecone Vector Storage
"""
import os
import hashlib
from typing import List, Optional, Dict, Any
import numpy as np

from app.core.config import settings
from app.core.logging import logger

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class EmbeddingService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY or os.environ.get("OPENAI_API_KEY")
        self.model_name = settings.OPENAI_EMBEDDING_MODEL # text-embedding-3-large
        self.expected_dim = settings.PINECONE_EMBEDDING_DIMENSION # 3072
        self.client = None
        self._init_client()

    def _init_client(self):
        if OPENAI_AVAILABLE and self.api_key and self.api_key.strip() and not self.api_key.startswith("sk-proj-YOUR"):
            try:
                self.client = OpenAI(
                    api_key=self.api_key,
                    timeout=settings.OPENAI_TIMEOUT_SECONDS,
                    max_retries=settings.OPENAI_MAX_RETRIES
                )
                logger.info(f"OpenAI Embedding client initialized with model: {self.model_name} (dim: {self.expected_dim})")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI embedding client: {e}")
                self.client = None
        else:
            logger.info("OPENAI_API_KEY unconfigured or placeholder. EmbeddingService using deterministic offline vector generator.")
            self.client = None

    def embed_text(self, text: str) -> List[float]:
        """Embeds a single string into a verified 3072-dimensional float vector."""
        vectors = self.embed_batch([text])
        return vectors[0]

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Embeds a batch of texts using text-embedding-3-large.
        Guarantees that every vector returned has exactly 3072 dimensions.
        Falls back to deterministic offline pseudo-embeddings if API is unreachable.
        """
        if not texts:
            return []

        cleaned_texts = [t.replace("\n", " ").strip() for t in texts]

        if self.client is not None:
            try:
                response = self.client.embeddings.create(
                    model=self.model_name,
                    input=cleaned_texts,
                    dimensions=self.expected_dim
                )
                embeddings = [item.embedding for item in response.data]
                
                # Verify dimensions
                for idx, emb in enumerate(embeddings):
                    if len(emb) != self.expected_dim:
                        raise ValueError(f"Vector at index {idx} has dimension {len(emb)}, expected {self.expected_dim}")
                return embeddings
            except Exception as e:
                logger.error(f"OpenAI embedding call failed: {e}. Falling back to deterministic offline vector generator.")
                return [self._deterministic_offline_vector(t) for t in cleaned_texts]
        else:
            return [self._deterministic_offline_vector(t) for t in cleaned_texts]

    def _deterministic_offline_vector(self, text: str) -> List[float]:
        """
        Generates a deterministic, reproducible, normalized 3072-dimensional vector
        from SHA-256 hash seeds when offline or testing without an active OpenAI API key.
        """
        hasher = hashlib.sha256(text.encode("utf-8")).digest()
        seed = int.from_bytes(hasher[:8], "little") % (2**32)
        rng = np.random.default_rng(seed)
        vec = rng.standard_normal(self.expected_dim).astype(np.float32)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    @staticmethod
    def compute_content_hash(text: str) -> str:
        """Returns hex SHA-256 hash of text for deduplication and versioning."""
        return hashlib.sha256(text.encode("utf-8")).hexdigest()


embedding_service = EmbeddingService()

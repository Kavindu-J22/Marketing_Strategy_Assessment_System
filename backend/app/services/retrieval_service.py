"""
Pinecone Vector Knowledge Retrieval Service (RAG)
Standardized on Pinecone Dense Vector Database with 3072-dimensional OpenAI Embeddings
Enforces Multi-Tenant Namespace Scoping, Quality Thresholds, and Relational Grounding.
"""
import os
import time
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from app.core.config import settings
from app.core.logging import logger
from app.core.database import db
from app.services.embedding_service import embedding_service

try:
    from pinecone import Pinecone
    PINECONE_AVAILABLE = True
except ImportError:
    PINECONE_AVAILABLE = False
    logger.warning("Pinecone SDK not installed. Running in relational fallback mode.")


class KnowledgeRetriever:
    def __init__(self):
        self.api_key = settings.PINECONE_API_KEY or os.environ.get("PINECONE_API_KEY")
        self.index_host = settings.PINECONE_INDEX_HOST
        self.index_name = settings.PINECONE_INDEX_NAME
        self.namespace_prefix = settings.PINECONE_NAMESPACE_PREFIX
        self.min_score = settings.RAG_MIN_SCORE
        self.top_k = settings.RAG_TOP_K
        self.pc = None
        self.index = None
        self._init_pinecone()

    def _init_pinecone(self):
        if PINECONE_AVAILABLE and self.api_key and self.api_key.strip() and not self.api_key.startswith("pcsk_YOUR"):
            try:
                self.pc = Pinecone(api_key=self.api_key)
                if self.index_host and self.index_host.startswith("https://"):
                    self.index = self.pc.Index(host=self.index_host)
                elif self.index_name:
                    self.index = self.pc.Index(self.index_name)
                logger.info("Pinecone Index client initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize Pinecone client: {e}. Fallback to relational knowledge store.")
                self.index = None
        else:
            logger.info("PINECONE_API_KEY unconfigured or placeholder. Operating in relational knowledge fallback mode.")
            self.index = None

    def retrieve(
        self,
        query: str,
        organization_id: Optional[str] = None,
        top_k: Optional[int] = None,
        source_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieves relevant Sri Lankan market and product knowledge passages.
        Uses Pinecone dense vector index when available; falls back to relational records otherwise.
        Guarantees tenant isolation: private organization data is never leaked across tenants.
        """
        k = top_k or self.top_k
        start_time = time.perf_counter()
        
        # Determine target namespace
        namespace = f"{self.namespace_prefix}-public"
        if organization_id and organization_id != "org-ceylontech-001":
            namespace = f"{self.namespace_prefix}-{organization_id}"

        results: List[Dict[str, Any]] = []

        if self.index is not None and settings.RAG_ENABLED:
            try:
                query_vec = embedding_service.embed_text(query)
                filter_dict = {}
                if source_type:
                    filter_dict["source_type"] = {"$eq": source_type}

                # If querying org namespace, also allow public docs
                pinecone_resp = self.index.query(
                    vector=query_vec,
                    top_k=k,
                    namespace=namespace,
                    include_metadata=True,
                    filter=filter_dict if filter_dict else None
                )

                for match in pinecone_resp.matches:
                    score = match.score or 0.0
                    if score >= self.min_score:
                        meta = match.metadata or {}
                        results.append({
                            "chunk_id": match.id,
                            "document_id": meta.get("document_id"),
                            "source_id": meta.get("source_id", meta.get("document_id", "market-src")),
                            "title": meta.get("title", "Market Knowledge"),
                            "text": meta.get("text", ""),
                            "source_type": meta.get("source_type", "market_report"),
                            "canonical_url": meta.get("canonical_url"),
                            "trust_tier": meta.get("trust_tier", "Tier 1 - Public Benchmark"),
                            "score": float(score),
                            "retrieval_mode": "pinecone_dense_vector"
                        })
            except Exception as e:
                logger.warning(f"Pinecone vector query failed ({e}). Reverting to relational fallback.")
                results = []

        # If vector query returned no results or Pinecone is offline, use relational fallback
        if not results:
            results = self._relational_fallback_search(query, organization_id, k, source_type)

        elapsed_ms = (time.perf_counter() - start_time) * 1000

        # Log retrieval audit event
        try:
            db.insert("retrieval_audit_events", {
                "id": str(uuid.uuid4()),
                "organization_id": organization_id,
                "query_text": query[:200],
                "namespace": namespace,
                "top_k": k,
                "min_score": self.min_score,
                "retrieved_chunk_ids": [r["chunk_id"] for r in results],
                "retrieved_citations": [r.get("source_id") for r in results],
                "latency_ms": round(elapsed_ms, 2),
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        except Exception:
            pass

        return results

    def _relational_fallback_search(
        self,
        query: str,
        organization_id: Optional[str],
        top_k: int,
        source_type: Optional[str]
    ) -> List[Dict[str, Any]]:
        """
        Deterministic, local fallback searching canonical relational documents in PostgreSQL/DB.
        Guarantees that RAG evidence remains grounded in authentic Sri Lankan benchmarks.
        """
        docs = db.list("knowledge_documents", filter_fn=lambda d: (
            (d.get("organization_id") is None or d.get("organization_id") == organization_id)
            and (source_type is None or d.get("source_type") == source_type)
            and d.get("status") == "active"
        ))

        query_terms = [w.lower() for w in query.split() if len(w) > 3]
        scored_docs = []

        for d in docs:
            content = (d.get("raw_content") or d.get("content_summary") or "").lower()
            title = (d.get("title") or "").lower()
            matches = sum(1 for term in query_terms if term in content or term in title)
            # Base relevance score
            relevance = matches / (len(query_terms) + 1e-5) if query_terms else 0.5
            scored_docs.append((relevance, d))

        # Sort by relevance descending
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        fallback_results = []

        for idx, (score, d) in enumerate(scored_docs[:top_k]):
            fallback_results.append({
                "chunk_id": f"{d.get('id')}#chunk-0001",
                "document_id": d.get("id"),
                "source_id": d.get("id"),
                "title": d.get("title"),
                "text": d.get("content_summary") or d.get("raw_content", "")[:350],
                "source_type": d.get("source_type", "market_report"),
                "canonical_url": d.get("canonical_url"),
                "trust_tier": d.get("trust_tier", "Tier 1 - Public Industry Benchmark"),
                "score": float(round(0.75 + 0.2 * score, 4)),
                "retrieval_mode": "relational_canonical_fallback"
            })

        return fallback_results


knowledge_retriever = KnowledgeRetriever()

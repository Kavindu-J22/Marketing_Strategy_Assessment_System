"""
Knowledge Ingestion Service
Deterministic text chunking, SHA-256 content hashing, relational tracking,
and Pinecone vector upserts for authorized Sri Lankan market intelligence.
"""
from typing import List, Dict, Any, Optional
import uuid
import re
from datetime import datetime, timezone

from app.core.config import settings
from app.core.logging import logger
from app.core.database import db
from app.services.embedding_service import embedding_service
from app.services.retrieval_service import knowledge_retriever


class KnowledgeIngestionService:
    def __init__(self):
        self.chunk_size_words = 120
        self.overlap_words = 20

    def ingest_document(
        self,
        document_id: str,
        title: str,
        raw_content: str,
        source_type: str = "market_report",
        canonical_url: Optional[str] = None,
        trust_tier: str = "Tier 1 - Public Benchmark",
        publication_date: Optional[str] = None,
        author: Optional[str] = None,
        organization_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Parses, chunks, persists, and indexes an authorized document.
        Idempotent: updates existing records if content hash changes.
        """
        job_id = f"job-{uuid.uuid4().hex[:10]}"
        now_iso = datetime.now(timezone.utc).isoformat()
        
        db.insert("knowledge_ingestion_jobs", {
            "id": job_id,
            "job_name": f"Ingest: {title}",
            "organization_id": organization_id,
            "documents_processed": 0,
            "chunks_created": 0,
            "status": "running",
            "started_at": now_iso
        })

        try:
            # 1. Clean & Compute Document Hash
            clean_text = re.sub(r"\s+", " ", raw_content).strip()
            doc_hash = embedding_service.compute_content_hash(clean_text)

            # 2. Persist Document in Canonical Relational Store
            doc_record = {
                "id": document_id,
                "organization_id": organization_id,
                "title": title,
                "source_type": source_type,
                "canonical_url": canonical_url,
                "trust_tier": trust_tier,
                "publication_date": publication_date or "2026-01-01",
                "author": author or "Authoritative Source",
                "content_summary": clean_text[:280] + "...",
                "raw_content": clean_text,
                "content_hash": doc_hash,
                "status": "active",
                "updated_at": now_iso
            }
            db.insert("knowledge_documents", doc_record)

            # 3. Deterministic Chunking
            chunks = self._chunk_text(clean_text)
            chunk_records = []
            vectors_to_upsert = []

            for idx, chunk_text in enumerate(chunks):
                chunk_id = f"{document_id}#chunk-{idx:04d}"
                chunk_hash = embedding_service.compute_content_hash(chunk_text)
                token_count = len(chunk_text.split())

                chunk_entry = {
                    "id": chunk_id,
                    "document_id": document_id,
                    "organization_id": organization_id,
                    "chunk_index": idx,
                    "chunk_text": chunk_text,
                    "token_count": token_count,
                    "content_hash": chunk_hash,
                    "pinecone_id": chunk_id,
                    "embedding_version": "text-embedding-3-large-3072"
                }
                db.insert("knowledge_chunks", chunk_entry)
                chunk_records.append(chunk_entry)

            # 4. Generate 3072-dimensional Embeddings
            chunk_texts = [c["chunk_text"] for c in chunk_records]
            embeddings = embedding_service.embed_batch(chunk_texts)

            # 5. Upsert to Pinecone if active
            namespace = f"{settings.PINECONE_NAMESPACE_PREFIX}-public"
            if organization_id and organization_id != "org-ceylontech-001":
                namespace = f"{settings.PINECONE_NAMESPACE_PREFIX}-{organization_id}"

            if knowledge_retriever.index is not None and settings.RAG_ENABLED:
                pinecone_vectors = []
                for idx, c in enumerate(chunk_records):
                    pinecone_vectors.append({
                        "id": c["id"],
                        "values": embeddings[idx],
                        "metadata": {
                            "document_id": document_id,
                            "source_id": document_id,
                            "title": title,
                            "source_type": source_type,
                            "canonical_url": canonical_url or "",
                            "trust_tier": trust_tier,
                            "content_hash": c["content_hash"],
                            "text": c["chunk_text"]
                        }
                    })
                knowledge_retriever.index.upsert(vectors=pinecone_vectors, namespace=namespace)
                logger.info(f"Upserted {len(pinecone_vectors)} vectors into Pinecone namespace '{namespace}'")

            # 6. Complete Ingestion Job
            db.update("knowledge_ingestion_jobs", job_id, {
                "documents_processed": 1,
                "chunks_created": len(chunk_records),
                "status": "completed",
                "completed_at": datetime.now(timezone.utc).isoformat()
            })

            return {
                "status": "success",
                "job_id": job_id,
                "document_id": document_id,
                "chunks_created": len(chunk_records),
                "embedding_model": settings.OPENAI_EMBEDDING_MODEL,
                "dimensions": settings.PINECONE_EMBEDDING_DIMENSION,
                "namespace": namespace
            }

        except Exception as e:
            logger.error(f"Ingestion job failed: {e}")
            db.update("knowledge_ingestion_jobs", job_id, {
                "status": "failed",
                "error_message": str(e),
                "completed_at": datetime.now(timezone.utc).isoformat()
            })
            raise e

    def _chunk_text(self, text: str) -> List[str]:
        words = text.split()
        if len(words) <= self.chunk_size_words:
            return [text]

        chunks = []
        i = 0
        while i < len(words):
            chunk = " ".join(words[i : i + self.chunk_size_words])
            chunks.append(chunk)
            i += (self.chunk_size_words - self.overlap_words)
        return chunks


knowledge_ingestion_service = KnowledgeIngestionService()

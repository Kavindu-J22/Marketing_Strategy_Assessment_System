"""
Knowledge Base & RAG Management Endpoints
Supports Vector Search, Document Ingestion, and Source Citation Review
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from app.core.database import db
from app.core.security import get_current_user, require_role, AuthUser
from app.services.retrieval_service import knowledge_retriever
from app.services.ingestion_service import knowledge_ingestion_service

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base & RAG Retrieval"])


class SearchQueryRequest(BaseModel):
    query: str
    top_k: int = Field(default=4, ge=1, le=10)
    source_type: Optional[str] = None


class DocumentIngestRequest(BaseModel):
    document_id: str
    title: str
    raw_content: str
    source_type: str = "market_report"
    canonical_url: Optional[str] = None
    trust_tier: str = "Tier 1 - Public Benchmark"
    publication_date: Optional[str] = None
    author: Optional[str] = None
    is_public: bool = True


@router.post("/search")
def search_knowledge(
    req: SearchQueryRequest,
    current_user: AuthUser = Depends(get_current_user)
):
    """
    Retrieves grounded passages from Pinecone vector store (or canonical relational fallback)
    with strict tenant isolation.
    """
    results = knowledge_retriever.retrieve(
        query=req.query,
        organization_id=current_user.organization_id,
        top_k=req.top_k,
        source_type=req.source_type
    )
    return {
        "query": req.query,
        "count": len(results),
        "results": results
    }


@router.get("/sources")
def list_knowledge_sources(
    current_user: AuthUser = Depends(get_current_user)
):
    """
    Lists authorized public and organization-specific documents.
    """
    docs = db.list("knowledge_documents", filter_fn=lambda d: (
        d.get("organization_id") is None or d.get("organization_id") == current_user.organization_id
    ))
    return {
        "organization_id": current_user.organization_id,
        "total_sources": len(docs),
        "sources": docs
    }


@router.post("/ingest")
def ingest_knowledge_document(
    req: DocumentIngestRequest,
    current_user: AuthUser = Depends(require_role(["admin", "researcher"]))
):
    """
    Admin/Researcher endpoint to chunk, hash, embed, and upsert a document into Pinecone & PostgreSQL.
    """
    org_id = None if req.is_public else current_user.organization_id
    try:
        result = knowledge_ingestion_service.ingest_document(
            document_id=req.document_id,
            title=req.title,
            raw_content=req.raw_content,
            source_type=req.source_type,
            canonical_url=req.canonical_url,
            trust_tier=req.trust_tier,
            publication_date=req.publication_date,
            author=req.author,
            organization_id=org_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")


@router.get("/jobs/{job_id}")
def get_ingestion_job(
    job_id: str,
    current_user: AuthUser = Depends(get_current_user)
):
    """
    Fetches the status and statistics of an ingestion job.
    """
    job = db.get("knowledge_ingestion_jobs", job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Ingestion job not found")
    return job

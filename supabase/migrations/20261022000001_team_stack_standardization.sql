-- ==============================================================================
-- Migration: 20261022000001_team_stack_standardization.sql
-- Project: Marketing Strategy Assessment System
-- Framework: A Product and Service Management Consulting Framework
-- Description: Standardized Knowledge Base, RAG Chunk Registry, and Identity Links
-- ==============================================================================

-- 1. EMBEDDING VERSIONS REGISTRY
CREATE TABLE IF NOT EXISTS public.embedding_versions (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'text-embedding-3-large-3072'
    provider VARCHAR(50) NOT NULL DEFAULT 'OpenAI',
    model_name VARCHAR(100) NOT NULL,
    dimensions INTEGER NOT NULL DEFAULT 3072,
    metric VARCHAR(20) NOT NULL DEFAULT 'cosine',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Seed current embedding standard
INSERT INTO public.embedding_versions (id, provider, model_name, dimensions, metric, is_active)
VALUES ('text-embedding-3-large-3072', 'OpenAI', 'text-embedding-3-large', 3072, 'cosine', true)
ON CONFLICT (id) DO NOTHING;

-- 2. KNOWLEDGE DOCUMENTS (Canonical Relational Registry)
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
    id VARCHAR(100) PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE, -- NULL = Public Sri Lankan market source
    title TEXT NOT NULL,
    source_type VARCHAR(50) NOT NULL DEFAULT 'market_report', -- 'market_report', 'policy_document', 'product_spec', 'research_paper'
    canonical_url TEXT,
    trust_tier VARCHAR(50) NOT NULL DEFAULT 'Tier 1 - Public Benchmark',
    publication_date DATE,
    author TEXT,
    content_summary TEXT,
    raw_content TEXT,
    content_hash VARCHAR(64) NOT NULL, -- SHA-256
    status VARCHAR(30) NOT NULL DEFAULT 'active', -- 'active', 'archived', 'pending_ingestion'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. KNOWLEDGE CHUNKS (Relational Metadata for Pinecone Vectors)
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
    id VARCHAR(120) PRIMARY KEY, -- e.g. doc-id#chunk-0001
    document_id VARCHAR(100) NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE, -- Scoped for tenant isolation
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    token_count INTEGER NOT NULL,
    content_hash VARCHAR(64) NOT NULL, -- SHA-256 of chunk_text
    pinecone_id VARCHAR(120) NOT NULL,
    embedding_version VARCHAR(50) NOT NULL REFERENCES public.embedding_versions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT uq_doc_chunk_idx UNIQUE (document_id, chunk_index)
);

-- 4. KNOWLEDGE INGESTION JOBS
CREATE TABLE IF NOT EXISTS public.knowledge_ingestion_jobs (
    id VARCHAR(100) PRIMARY KEY,
    job_name TEXT NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    documents_processed INTEGER NOT NULL DEFAULT 0,
    chunks_created INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. RETRIEVAL AUDIT EVENTS (RAG Query Observability)
CREATE TABLE IF NOT EXISTS public.retrieval_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    query_text TEXT NOT NULL,
    namespace VARCHAR(100) NOT NULL,
    top_k INTEGER NOT NULL,
    min_score NUMERIC(5,4),
    retrieved_chunk_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    retrieved_citations JSONB NOT NULL DEFAULT '[]'::jsonb,
    latency_ms NUMERIC(8,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 6. ORGANIZATION AUTH LINKS (Better Auth Identity Interop)
CREATE TABLE IF NOT EXISTS public.organization_auth_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    better_auth_user_id TEXT NOT NULL,
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'better-auth',
    system_role user_role_enum NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT uq_org_better_auth_user UNIQUE (organization_id, better_auth_user_id)
);

-- 7. PERFORMANCE & TENANT ISOLATION INDEXES
CREATE INDEX IF NOT EXISTS idx_kdocs_org ON public.knowledge_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_kdocs_type ON public.knowledge_documents(source_type);
CREATE INDEX IF NOT EXISTS idx_kchunks_doc ON public.knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_kchunks_org ON public.knowledge_chunks(organization_id);
CREATE INDEX IF NOT EXISTS idx_kchunks_pinecone ON public.knowledge_chunks(pinecone_id);
CREATE INDEX IF NOT EXISTS idx_retrieval_org ON public.retrieval_audit_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_auth_links_user ON public.organization_auth_links(better_auth_user_id);

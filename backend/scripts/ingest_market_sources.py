"""
Reproducible Market Source Ingestion CLI Script
Ingests authorized Sri Lankan market intelligence into PostgreSQL and Pinecone.
"""
import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.config import settings
from app.core.logging import logger
from app.services.ingestion_service import knowledge_ingestion_service

AUTHORIZED_SOURCES = [
    {
        "document_id": "doc-datareportal-sl-2026",
        "title": "Digital 2026: Sri Lanka National Digital Connectivity Benchmark",
        "source_type": "market_report",
        "canonical_url": "https://datareportal.com/reports/digital-2026-sri-lanka",
        "trust_tier": "Tier 1 - Public Industry Benchmark",
        "publication_date": "2026-02-01",
        "author": "Kepios / DataReportal",
        "raw_content": (
            "According to DataReportal Digital 2026 Sri Lanka, total internet users reached 16.4 million, "
            "representing an internet penetration rate of 74.5% of the total population. Active social media "
            "user identities grew to 8.10 million. Facebook remains the dominant social network with 7.30 million "
            "users, serving as the default customer discovery channel for small and medium enterprises. "
            "YouTube reaches 6.90 million adults, serving as a primary destination for educational video tutorials "
            "and software walkthroughs. Mobile cellular connections stood at 32.8 million, or 148% of the population, "
            "reflecting widespread smartphone usage and multi-SIM behaviors across Western, Central, and Southern provinces. "
            "Digital marketing campaigns in Sri Lanka achieve highest conversion when optimized for low-bandwidth mobile devices "
            "and localized in Sinhala and Tamil alongside English."
        )
    },
    {
        "document_id": "doc-icta-strategy-2030",
        "title": "National Digital Economy Strategy 2030",
        "source_type": "policy_document",
        "canonical_url": "https://www.icta.lk/icta-assets/uploads/2023/05/Annex-1-National-Digital-Strategy-2030.pdf",
        "trust_tier": "Tier 1 - Government Policy Document",
        "publication_date": "2023-05-15",
        "author": "Information and Communication Technology Agency (ICTA) Sri Lanka",
        "raw_content": (
            "The Information and Communication Technology Agency (ICTA) National Digital Strategy 2030 outlines the "
            "roadmap to achieve a $5 Billion digital export contribution and accelerate tech adoption across 100,000 "
            "local micro, small, and medium enterprises. High-priority focus areas include the modernization of retail, "
            "agriculture, logistics, and tourism through cloud software. Major adoption hurdles cited by enterprise owners "
            "include unfamiliarity with technical software jargon, fear of vendor lock-in, and uncertain software return on investment. "
            "Marketing communication from tech providers must therefore emphasize practical operational time savings, "
            "transparent Rupee (LKR) pricing, and dependable local customer support."
        )
    },
    {
        "document_id": "doc-edb-export-2025",
        "title": "Sri Lanka Export Performance & ICT/BPM Sector Overview",
        "source_type": "policy_document",
        "canonical_url": "https://www.srilankabusiness.com/news/sri-lankas-export-performance-exceeded-us-17.2-billion-in-2025.html",
        "trust_tier": "Tier 1 - Government Trade Authority",
        "publication_date": "2026-01-15",
        "author": "Sri Lanka Export Development Board (EDB)",
        "raw_content": (
            "The Sri Lanka Export Development Board (EDB) highlights the ICT and Business Process Management (BPM) industry "
            "as one of the highest net foreign exchange earning sectors of the national economy. Over 500 tech startups and "
            "emerging scale-ups develop specialized solutions ranging from retail enterprise resource planning (ERP) to "
            "fintech and supply chain automation. When expanding beyond domestic regional markets into export destinations, "
            "B2B companies rely predominantly on LinkedIn thought leadership, targeted Google Search intent marketing, and "
            "authoritative case study content to build brand credibility with corporate decision makers."
        )
    }
]


def run_ingestion():
    print("=" * 70)
    print("Starting Authorized Market Knowledge Ingestion...")
    print(f"Embedding Model: {settings.OPENAI_EMBEDDING_MODEL} (Dimensions: {settings.PINECONE_EMBEDDING_DIMENSION})")
    print(f"Target Namespace Prefix: {settings.PINECONE_NAMESPACE_PREFIX}")
    print("=" * 70)

    total_chunks = 0
    for doc in AUTHORIZED_SOURCES:
        print(f"\nIngesting: {doc['title']}...")
        res = knowledge_ingestion_service.ingest_document(
            document_id=doc["document_id"],
            title=doc["title"],
            raw_content=doc["raw_content"],
            source_type=doc["source_type"],
            canonical_url=doc["canonical_url"],
            trust_tier=doc["trust_tier"],
            publication_date=doc["publication_date"],
            author=doc["author"],
            organization_id=None # Public
        )
        print(f"  -> Success! Created {res['chunks_created']} chunks (Job ID: {res['job_id']})")
        total_chunks += res["chunks_created"]

    print("\n" + "=" * 70)
    print(f"Ingestion Complete: {len(AUTHORIZED_SOURCES)} documents, {total_chunks} total chunks indexed.")
    print("=" * 70)


if __name__ == "__main__":
    run_ingestion()

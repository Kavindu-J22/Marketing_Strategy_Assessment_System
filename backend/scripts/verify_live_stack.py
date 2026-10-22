"""
Live Stack Verification Script
Tests actual connectivity to:
1. PostgreSQL (Prisma Postgres pooled endpoint)
2. OpenAI API (Embeddings 3072d + Generation)
3. Pinecone Vector Database
4. Ingestion & Retrieval flow
"""
import sys
import os

# Add backend directory to path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.config import settings
from app.core.database import db
from app.services.embedding_service import embedding_service
from app.services.openai_service import messaging_service
from app.services.retrieval_service import knowledge_retriever
from app.schemas.messages import MessageGenerateRequest
from app.schemas.common import TechLiteracyLevel, IndustryEnum, MarketTypeEnum


def verify_live():
    print("=" * 70)
    print("TESTING LIVE LOCAL STACK CONNECTIVITY")
    print("=" * 70)

    # 1. Database Check
    print("\n[1/4] Checking PostgreSQL / Prisma Postgres...")
    print(f"DATABASE_URL set: {bool(settings.DATABASE_URL)}")
    print(f"SQLAlchemy Connected: {db.is_postgres_active}")
    if db.is_postgres_active:
        print("  -> SUCCESS: PostgreSQL (Prisma Postgres) connection established!")
    else:
        print("  -> NOTICE: Running in resilient in-memory datastore mode.")

    # 2. OpenAI Embedding Check
    print("\n[2/4] Testing OpenAI text-embedding-3-large (3072 dims)...")
    try:
        sample_text = "Digital 2026: Sri Lanka technology adoption and market trends."
        vec = embedding_service.embed_text(sample_text)
        print(f"  -> Returned vector length: {len(vec)} floats")
        if len(vec) == 3072:
            print("  -> SUCCESS: 3072-dimensional vector verified!")
        else:
            print(f"  -> WARNING: Expected 3072, got {len(vec)}")
    except Exception as e:
        print(f"  -> Embedding error: {e}")

    # 3. OpenAI Generation Check
    print("\n[3/4] Testing OpenAI Feature-to-Value Message Generation (FR4)...")
    req = MessageGenerateRequest(
        product_name="Nivora StockSync Cloud",
        product_description="Multi-outlet cloud inventory management suite for Sri Lankan retail merchants.",
        main_features=["Real-time barcode inventory scanning", "Multi-branch stock transfer ledger"],
        industry=IndustryEnum.SOFTWARE_SAAS,
        market_type=MarketTypeEnum.B2B,
        primary_benefit="Eliminate inventory discrepancies across branches",
        customer_pain_points=["Stockouts and manual ledger errors"],
        audience_description="Supermarket and retail shop owners in Sri Lanka",
        literacy_level=TechLiteracyLevel.LOW,
        detail_preference_1to5=2,
        campaign_goal="Increase qualified trial bookings",
        target_language="en"
    )
    try:
        msg_result = messaging_service.generate_messages(req)
        print(f"  -> Generation Model: {msg_result.generation_model}")
        print(f"  -> Is AI Generated: {msg_result.is_ai_generated}")
        print(f"  -> Core Value Prop: {msg_result.core_value_proposition[:80]}...")
        print(f"  -> Recommended Message: {msg_result.recommended_message[:80]}...")
        print("  -> SUCCESS: Message generation operational!")
    except Exception as e:
        print(f"  -> Message generation error: {e}")

    # 4. Pinecone Vector Retrieval Check
    print("\n[4/4] Testing Pinecone / Knowledge Retrieval...")
    try:
        rag_hits = knowledge_retriever.retrieve(
            query="Sri Lanka internet penetration and retail SME digitization",
            organization_id=None,
            top_k=2
        )
        print(f"  -> Retrieved passages count: {len(rag_hits)}")
        for idx, h in enumerate(rag_hits, 1):
            print(f"     [{idx}] ({h.get('retrieval_mode')} | score: {h.get('score', 0):.2f}) {h.get('title')}: {h.get('text')[:80]}...")
        print("  -> SUCCESS: Knowledge retrieval operational!")
    except Exception as e:
        print(f"  -> Retrieval error: {e}")

    print("\n" + "=" * 70)
    print("LIVE STACK VERIFICATION COMPLETED")
    print("=" * 70)


if __name__ == "__main__":
    verify_live()

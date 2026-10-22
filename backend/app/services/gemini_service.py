"""
Feature-to-Value Message Generation Service (Legacy Wrapper)
Deprecated: Replaced by app.services.openai_service (MarketingMessageService)
Maintained strictly for backward compatibility with existing tests or legacy imports.
"""
from app.core.logging import logger
from app.services.openai_service import MarketingMessageService, messaging_service

logger.info("Importing legacy gemini_service; forwarding to OpenAI MarketingMessageService.")

# Backward compatibility alias
GeminiMessagingService = MarketingMessageService

"""
Audience Technical Literacy Prediction Endpoints (FR3)
"""
from fastapi import APIRouter, Depends
from app.schemas.audience import AudiencePredictRequest, AudiencePredictionResult
from app.ml.inference import classifier_service
from app.core.security import get_current_user, AuthUser

router = APIRouter(prefix="/audience", tags=["Audience Literacy Classifier"])

@router.post("/predict", response_model=AudiencePredictionResult)
def predict_audience_literacy(
    req: AudiencePredictRequest,
    current_user: AuthUser = Depends(get_current_user)
):
    return classifier_service.predict(req)

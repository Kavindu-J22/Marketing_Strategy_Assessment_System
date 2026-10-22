"""
Audience Technical Literacy Classifier Inference Service (FR3)
Loads PyTorch Multimodal Fusion Network and Classical TF-IDF Logistic Regression.
"""
import os
import joblib
import numpy as np
from typing import Dict, Any, List, Optional
from app.schemas.audience import AudiencePredictRequest, AudiencePredictionResult
from app.schemas.common import TechLiteracyLevel, DataProvenanceEnum
from app.core.logging import logger

CLASS_NAMES = ["Low", "Medium", "High"]

def rule_baseline(q10: int, q11: int) -> str:
    s = q10 + q11
    if s <= 4:
        return "Low"
    elif s >= 8:
        return "High"
    return "Medium"


class AudienceClassifierService:
    def __init__(self, artifacts_dir: str = "ml/artifacts"):
        self.artifacts_dir = artifacts_dir
        self.lr_pipeline = None
        self.fusion_model = None
        self.fusion_preprocessor = None
        self._load_artifacts()

    def _load_artifacts(self):
        # 1. Classical ML Pipeline
        lr_path = os.path.join(self.artifacts_dir, "tfidf_logistic_regression.joblib")
        if os.path.exists(lr_path):
            try:
                self.lr_pipeline = joblib.load(lr_path)
                logger.info(f"Loaded Logistic Regression artifact from {lr_path}")
            except Exception as e:
                logger.warning(f"Could not load LR artifact: {e}")

        # 2. PyTorch Multimodal Fusion Model
        prep_path = os.path.join(self.artifacts_dir, "fusion_preprocessor.joblib")
        weights_path = os.path.join(self.artifacts_dir, "fusion_model.pt")
        if os.path.exists(prep_path) and os.path.exists(weights_path):
            try:
                import sys
                workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
                if workspace_root not in sys.path:
                    sys.path.insert(0, workspace_root)
                import torch
                import torch.nn as nn
                from ml.training.train_fusion import MultimodalFusionNet

                self.fusion_preprocessor = joblib.load(prep_path)
                model = MultimodalFusionNet(
                    text_dim=self.fusion_preprocessor["text_dim"],
                    struct_dim=self.fusion_preprocessor["struct_dim"]
                )
                model.load_state_dict(torch.load(weights_path, map_location=torch.device("cpu")))
                model.eval()
                self.fusion_model = model
                logger.info(f"Loaded PyTorch Multimodal Fusion model from {weights_path}")
            except Exception as e:
                logger.warning(f"Could not load PyTorch Fusion model: {e}")

    def predict(self, req: AudiencePredictRequest) -> AudiencePredictionResult:
        model_pref = req.model_preference or "auto"

        # Explicit Rule Baseline
        if model_pref == "rule":
            pred = rule_baseline(req.technology_comfort_1to5, req.technical_terms_familiarity_1to5)
            probs = {c: (0.80 if c == pred else 0.10) for c in CLASS_NAMES}
            return AudiencePredictionResult(
                predicted_class=TechLiteracyLevel(pred),
                probabilities=probs,
                confidence_score=0.80,
                uncertainty_caveat="Rule-based heuristic; does not incorporate audience text or market context.",
                is_abstain_recommended=False,
                model_type="Rule-Based Threshold Baseline (Q10+Q11)",
                model_version="v1.0-rule",
                dataset_provenance=DataProvenanceEnum.SYNTHETIC_DEMO,
                is_empirically_validated=False,
                reason_codes=[f"Comfort {req.technology_comfort_1to5}/5 and Terms {req.technical_terms_familiarity_1to5}/5 sum to {req.technology_comfort_1to5 + req.technical_terms_familiarity_1to5}"]
            )

        # PyTorch Multimodal Fusion Model
        if (model_pref in ["auto", "fusion"]) and (self.fusion_model is not None) and (self.fusion_preprocessor is not None):
            try:
                import torch
                import torch.nn as nn
                import pandas as pd

                df_row = pd.DataFrame([{
                    "industry": req.industry.value,
                    "market_type": req.market_type.value,
                    "customer_role": req.customer_role,
                    "age_group": req.age_group.value,
                    "location": req.location,
                    "customer_audience_text": req.customer_audience_text,
                    "technology_comfort_1to5": req.technology_comfort_1to5,
                    "technical_terms_familiarity_1to5": req.technical_terms_familiarity_1to5
                }])

                text_feat = self.fusion_preprocessor["tfidf"].transform(df_row["customer_audience_text"]).toarray()
                cat_feat = self.fusion_preprocessor["ohe"].transform(df_row[self.fusion_preprocessor["cat_cols"]])
                num_feat = self.fusion_preprocessor["scaler"].transform(df_row[self.fusion_preprocessor["num_cols"]])
                struct_feat = np.hstack([cat_feat, num_feat])

                with torch.no_grad():
                    logits = self.fusion_model(
                        torch.tensor(text_feat, dtype=torch.float32),
                        torch.tensor(struct_feat, dtype=torch.float32)
                    )
                    probs_t = nn.Softmax(dim=1)(logits).numpy()[0]

                pred_idx = int(np.argmax(probs_t))
                pred_label = CLASS_NAMES[pred_idx]
                conf = float(probs_t[pred_idx])
                probs = {CLASS_NAMES[i]: round(float(probs_t[i]), 4) for i in range(3)}

                reasons = []
                if req.technology_comfort_1to5 <= 2:
                    reasons.append("Low self-reported technology comfort significantly pulls prediction toward Low literacy.")
                elif req.technology_comfort_1to5 >= 4:
                    reasons.append("High digital tool comfort increases likelihood of Medium or High literacy.")
                if req.customer_role in ["IT professional", "Manager"]:
                    reasons.append(f"Target role '{req.customer_role}' typically indicates higher technical fluency.")

                return AudiencePredictionResult(
                    predicted_class=TechLiteracyLevel(pred_label),
                    probabilities=probs,
                    confidence_score=conf,
                    uncertainty_caveat="Trained on synthetic research data. Reflects synthetic simulation priors, not field-verified customer proficiency.",
                    is_abstain_recommended=(conf < 0.45),
                    model_type="PyTorch Multimodal Fusion Network (Text + Categorical + Numeric)",
                    model_version="v1.0-fusion",
                    dataset_provenance=DataProvenanceEnum.SYNTHETIC_DEMO,
                    is_empirically_validated=False,
                    reason_codes=reasons
                )
            except Exception as e:
                logger.error(f"Fusion model inference failed: {e}. Falling back to Classical ML.")

        # Classical ML: TF-IDF + Logistic Regression
        if self.lr_pipeline is not None:
            import pandas as pd
            df_row = pd.DataFrame([{
                "industry": req.industry.value,
                "market_type": req.market_type.value,
                "customer_role": req.customer_role,
                "age_group": req.age_group.value,
                "location": req.location,
                "customer_audience_text": req.customer_audience_text,
                "technology_comfort_1to5": req.technology_comfort_1to5,
                "technical_terms_familiarity_1to5": req.technical_terms_familiarity_1to5
            }])
            pred_label = str(self.lr_pipeline.predict(df_row)[0])
            prob_arr = self.lr_pipeline.predict_proba(df_row)[0]
            classes = list(self.lr_pipeline.classes_)
            probs = {c: round(float(prob_arr[classes.index(c)]), 4) for c in CLASS_NAMES}
            conf = probs[pred_label]

            return AudiencePredictionResult(
                predicted_class=TechLiteracyLevel(pred_label),
                probabilities=probs,
                confidence_score=conf,
                uncertainty_caveat="Trained on synthetic research scenarios. Represents model estimation on simulated features.",
                is_abstain_recommended=(conf < 0.45),
                model_type="TF-IDF + ColumnTransformer Logistic Regression",
                model_version="v1.0-tfidf-lr",
                dataset_provenance=DataProvenanceEnum.SYNTHETIC_DEMO,
                is_empirically_validated=False,
                reason_codes=[f"Confidence: {conf:.2f} based on audience description keywords and structured scores."]
            )

        # Fallback to Rule
        pred = rule_baseline(req.technology_comfort_1to5, req.technical_terms_familiarity_1to5)
        return AudiencePredictionResult(
            predicted_class=TechLiteracyLevel(pred),
            probabilities={c: (0.75 if c == pred else 0.125) for c in CLASS_NAMES},
            confidence_score=0.75,
            uncertainty_caveat="Rule fallback baseline.",
            is_abstain_recommended=False,
            model_type="Rule Baseline Fallback",
            model_version="v1.0-fallback",
            dataset_provenance=DataProvenanceEnum.SYNTHETIC_DEMO,
            is_empirically_validated=False,
            reason_codes=["Calculated from technology comfort and terminology scores."]
        )


classifier_service = AudienceClassifierService()

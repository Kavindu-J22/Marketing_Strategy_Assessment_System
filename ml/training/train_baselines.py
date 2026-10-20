"""
Train and Evaluate Baseline Models
- Rule-based baseline (Threshold on Q10 + Q11)
- Classical ML: TF-IDF + OneHot + Scaled Numeric with Logistic Regression and Linear SVM
- Structured-only tabular baseline (Random Forest / Gradient Boosting)
- Text-only TF-IDF baseline
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, classification_report

SEED = 20261020
DATA_PATH = "Dataset/Audience_Classifier_ML_5000.csv"
ARTIFACTS_DIR = "ml/artifacts"
EVALUATION_DIR = "ml/evaluation"

os.makedirs(ARTIFACTS_DIR, exist_ok=True)
os.makedirs(EVALUATION_DIR, exist_ok=True)

def rule_baseline(q10: int, q11: int) -> str:
    s = q10 + q11
    if s <= 4:
        return "Low"
    elif s >= 8:
        return "High"
    return "Medium"

def evaluate_predictions(y_true, y_pred, y_prob=None, model_name="Model"):
    classes = ["Low", "Medium", "High"]
    acc = accuracy_score(y_true, y_pred)
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(y_true, y_pred, average="macro", zero_division=0)
    p_weighted, r_weighted, f1_weighted, _ = precision_recall_fscore_support(y_true, y_pred, average="weighted", zero_division=0)
    p_cls, r_cls, f1_cls, support_cls = precision_recall_fscore_support(y_true, y_pred, labels=classes, zero_division=0)
    cm = confusion_matrix(y_true, y_pred, labels=classes).tolist()
    
    per_class = {}
    for i, c in enumerate(classes):
        per_class[c] = {
            "precision": round(float(p_cls[i]), 4),
            "recall": round(float(r_cls[i]), 4),
            "f1": round(float(f1_cls[i]), 4),
            "support": int(support_cls[i])
        }
        
    metrics = {
        "model_name": model_name,
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "accuracy": round(float(acc), 4),
        "macro_precision": round(float(p_macro), 4),
        "macro_recall": round(float(r_macro), 4),
        "macro_f1": round(float(f1_macro), 4),
        "weighted_f1": round(float(f1_weighted), 4),
        "per_class": per_class,
        "confusion_matrix": {
            "labels": classes,
            "matrix": cm
        }
    }
    return metrics

def main():
    print(f"Loading dataset from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    
    # Verify split integrity
    train_df = df[df["ml_split"] == "train"].copy()
    val_df = df[df["ml_split"] == "validation"].copy()
    test_df = df[df["ml_split"] == "test"].copy()
    
    print(f"Train samples: {len(train_df)}, Val samples: {len(val_df)}, Test samples: {len(test_df)}")
    
    target_col = "technical_literacy_reference_label_SIMULATED"
    text_col = "customer_audience_text"
    cat_cols = ["industry", "market_type", "customer_role", "age_group", "location"]
    num_cols = ["technology_comfort_1to5", "technical_terms_familiarity_1to5"]
    
    y_train = train_df[target_col].values
    y_val = val_df[target_col].values
    y_test = test_df[target_col].values
    
    results = {}
    
    # 1. RULE-BASED BASELINE
    print("\n--- Evaluating 1. Rule-Based Baseline ---")
    val_rule_preds = [rule_baseline(q10, q11) for q10, q11 in zip(val_df["technology_comfort_1to5"], val_df["technical_terms_familiarity_1to5"])]
    test_rule_preds = [rule_baseline(q10, q11) for q10, q11 in zip(test_df["technology_comfort_1to5"], test_df["technical_terms_familiarity_1to5"])]
    
    rule_metrics = evaluate_predictions(y_test, test_rule_preds, model_name="Rule-Based Baseline (Q10+Q11 Thresholds)")
    print(f"Rule Baseline Test Accuracy: {rule_metrics['accuracy']:.4f}, Macro-F1: {rule_metrics['macro_f1']:.4f}")
    results["rule_baseline"] = rule_metrics
    
    # 2. CLASSICAL ML: TF-IDF + STRUCTURED LOGISTIC REGRESSION
    print("\n--- Training 2. TF-IDF + Structured Logistic Regression ---")
    preprocessor = ColumnTransformer(
        transformers=[
            ("text", TfidfVectorizer(max_features=500, stop_words="english", ngram_range=(1, 2)), text_col),
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
            ("num", StandardScaler(), num_cols)
        ]
    )
    
    lr_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", LogisticRegression(C=1.0, max_iter=1000, random_state=SEED, class_weight="balanced"))
    ])
    
    lr_pipeline.fit(train_df, y_train)
    val_lr_preds = lr_pipeline.predict(val_df)
    test_lr_preds = lr_pipeline.predict(test_df)
    test_lr_probs = lr_pipeline.predict_proba(test_df)
    
    lr_metrics = evaluate_predictions(y_test, test_lr_preds, y_prob=test_lr_probs, model_name="TF-IDF + Structured Logistic Regression")
    print(f"Logistic Regression Test Accuracy: {lr_metrics['accuracy']:.4f}, Macro-F1: {lr_metrics['macro_f1']:.4f}")
    results["tfidf_logistic_regression"] = lr_metrics
    
    # Save Pipeline Artifact
    lr_artifact_path = os.path.join(ARTIFACTS_DIR, "tfidf_logistic_regression.joblib")
    joblib.dump(lr_pipeline, lr_artifact_path)
    print(f"Saved artifact to {lr_artifact_path}")
    
    # 3. TEXT-ONLY ABLATION
    print("\n--- Training 3. Text-Only TF-IDF Logistic Regression Ablation ---")
    text_pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=500, stop_words="english", ngram_range=(1, 2))),
        ("classifier", LogisticRegression(C=1.0, max_iter=1000, random_state=SEED, class_weight="balanced"))
    ])
    text_pipeline.fit(train_df[text_col], y_train)
    test_text_preds = text_pipeline.predict(test_df[text_col])
    text_metrics = evaluate_predictions(y_test, test_text_preds, model_name="Text-Only TF-IDF Ablation")
    print(f"Text-Only Test Accuracy: {text_metrics['accuracy']:.4f}, Macro-F1: {text_metrics['macro_f1']:.4f}")
    results["text_only_ablation"] = text_metrics
    
    # 4. STRUCTURED-ONLY TABULAR ABLATION
    print("\n--- Training 4. Structured-Only Random Forest Ablation ---")
    struct_preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
            ("num", StandardScaler(), num_cols)
        ]
    )
    rf_pipeline = Pipeline([
        ("preprocessor", struct_preprocessor),
        ("classifier", RandomForestClassifier(n_estimators=100, max_depth=10, random_state=SEED))
    ])
    rf_pipeline.fit(train_df, y_train)
    test_rf_preds = rf_pipeline.predict(test_df)
    rf_metrics = evaluate_predictions(y_test, test_rf_preds, model_name="Structured-Only Random Forest Ablation")
    print(f"Structured-Only Test Accuracy: {rf_metrics['accuracy']:.4f}, Macro-F1: {rf_metrics['macro_f1']:.4f}")
    results["structured_only_ablation"] = rf_metrics

    # Save Baseline Evaluation Summary
    metrics_path = os.path.join(EVALUATION_DIR, "baseline_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nAll baseline metrics saved to {metrics_path}")

if __name__ == "__main__":
    main()

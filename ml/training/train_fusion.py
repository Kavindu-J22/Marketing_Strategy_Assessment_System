"""
Train Multimodal Neural Fusion Model in PyTorch
Combines audience text representation with structured categorical and numeric features.
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timezone
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

SEED = 20261020
torch.manual_seed(SEED)
np.random.seed(SEED)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

DATA_PATH = "Dataset/Audience_Classifier_ML_5000.csv"
ARTIFACTS_DIR = "ml/artifacts"
EVALUATION_DIR = "ml/evaluation"

CLASS_MAP = {"Low": 0, "Medium": 1, "High": 2}
REV_CLASS_MAP = {0: "Low", 1: "Medium", 2: "High"}


class MultimodalFusionNet(nn.Module):
    def __init__(self, text_dim: int, struct_dim: int, num_classes: int = 3):
        super().__init__()
        # Text branch
        self.text_net = nn.Sequential(
            nn.Linear(text_dim, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.25),
            nn.Linear(256, 128),
            nn.ReLU()
        )
        # Structured branch
        self.struct_net = nn.Sequential(
            nn.Linear(struct_dim, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.15),
            nn.Linear(64, 32),
            nn.ReLU()
        )
        # Fusion head
        self.fusion_head = nn.Sequential(
            nn.Linear(128 + 32, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, num_classes)
        )

    def forward(self, text_x, struct_x):
        text_feat = self.text_net(text_x)
        struct_feat = self.struct_net(struct_x)
        fused = torch.cat([text_feat, struct_feat], dim=1)
        logits = self.fusion_head(fused)
        return logits


class MultimodalDataset(Dataset):
    def __init__(self, text_feats, struct_feats, labels):
        self.text_feats = torch.tensor(text_feats, dtype=torch.float32)
        self.struct_feats = torch.tensor(struct_feats, dtype=torch.float32)
        self.labels = torch.tensor(labels, dtype=torch.long)

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        return self.text_feats[idx], self.struct_feats[idx], self.labels[idx]


def evaluate_model(model, dataloader):
    model.eval()
    all_preds = []
    all_targets = []
    all_probs = []
    softmax = nn.Softmax(dim=1)
    
    with torch.no_grad():
        for text_b, struct_b, target_b in dataloader:
            text_b = text_b.to(device)
            struct_b = struct_b.to(device)
            logits = model(text_b, struct_b)
            probs = softmax(logits)
            preds = torch.argmax(probs, dim=1)
            
            all_preds.extend(preds.cpu().numpy())
            all_targets.extend(target_b.numpy())
            all_probs.extend(probs.cpu().numpy())
            
    classes = ["Low", "Medium", "High"]
    target_names = [REV_CLASS_MAP[t] for t in all_targets]
    pred_names = [REV_CLASS_MAP[p] for p in all_preds]
    
    acc = accuracy_score(target_names, pred_names)
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(target_names, pred_names, average="macro", zero_division=0)
    p_weighted, r_weighted, f1_weighted, _ = precision_recall_fscore_support(target_names, pred_names, average="weighted", zero_division=0)
    p_cls, r_cls, f1_cls, support_cls = precision_recall_fscore_support(target_names, pred_names, labels=classes, zero_division=0)
    cm = confusion_matrix(target_names, pred_names, labels=classes).tolist()
    
    per_class = {}
    for i, c in enumerate(classes):
        per_class[c] = {
            "precision": round(float(p_cls[i]), 4),
            "recall": round(float(r_cls[i]), 4),
            "f1": round(float(f1_cls[i]), 4),
            "support": int(support_cls[i])
        }
        
    return {
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


def main():
    print(f"Loading data from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    
    train_df = df[df["ml_split"] == "train"].copy()
    val_df = df[df["ml_split"] == "validation"].copy()
    test_df = df[df["ml_split"] == "test"].copy()
    
    target_col = "technical_literacy_reference_label_SIMULATED"
    text_col = "customer_audience_text"
    cat_cols = ["industry", "market_type", "customer_role", "age_group", "location"]
    num_cols = ["technology_comfort_1to5", "technical_terms_familiarity_1to5"]
    
    y_train = [CLASS_MAP[l] for l in train_df[target_col].values]
    y_val = [CLASS_MAP[l] for l in val_df[target_col].values]
    y_test = [CLASS_MAP[l] for l in test_df[target_col].values]
    
    # Preprocessing strictly fit on training data only
    tfidf = TfidfVectorizer(max_features=600, stop_words="english", ngram_range=(1, 2))
    train_text = tfidf.fit_transform(train_df[text_col]).toarray()
    val_text = tfidf.transform(val_df[text_col]).toarray()
    test_text = tfidf.transform(test_df[text_col]).toarray()
    
    ohe = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    train_cat = ohe.fit_transform(train_df[cat_cols])
    val_cat = ohe.transform(val_df[cat_cols])
    test_cat = ohe.transform(test_df[cat_cols])
    
    scaler = StandardScaler()
    train_num = scaler.fit_transform(train_df[num_cols])
    val_num = scaler.transform(val_df[num_cols])
    test_num = scaler.transform(test_df[num_cols])
    
    train_struct = np.hstack([train_cat, train_num])
    val_struct = np.hstack([val_cat, val_num])
    test_struct = np.hstack([test_cat, test_num])
    
    # Save preprocessors
    preprocessor = {
        "tfidf": tfidf,
        "ohe": ohe,
        "scaler": scaler,
        "cat_cols": cat_cols,
        "num_cols": num_cols,
        "text_col": text_col,
        "text_dim": train_text.shape[1],
        "struct_dim": train_struct.shape[1]
    }
    prep_path = os.path.join(ARTIFACTS_DIR, "fusion_preprocessor.joblib")
    joblib.dump(preprocessor, prep_path)
    print(f"Saved preprocessing pipeline to {prep_path}")
    
    # DataLoaders
    train_loader = DataLoader(MultimodalDataset(train_text, train_struct, y_train), batch_size=32, shuffle=True)
    val_loader = DataLoader(MultimodalDataset(val_text, val_struct, y_val), batch_size=64, shuffle=False)
    test_loader = DataLoader(MultimodalDataset(test_text, test_struct, y_test), batch_size=64, shuffle=False)
    
    model = MultimodalFusionNet(text_dim=train_text.shape[1], struct_dim=train_struct.shape[1]).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=2)
    
    epochs = 20
    best_val_loss = float("inf")
    best_model_state = None
    
    print("\nStarting Multimodal Fusion Model Training...")
    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        for text_b, struct_b, target_b in train_loader:
            text_b = text_b.to(device)
            struct_b = struct_b.to(device)
            target_b = target_b.to(device)
            
            optimizer.zero_grad()
            logits = model(text_b, struct_b)
            loss = criterion(logits, target_b)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * text_b.size(0)
            
        train_loss /= len(train_loader.dataset)
        
        # Validation
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for text_b, struct_b, target_b in val_loader:
                text_b = text_b.to(device)
                struct_b = struct_b.to(device)
                target_b = target_b.to(device)
                logits = model(text_b, struct_b)
                loss = criterion(logits, target_b)
                val_loss += loss.item() * text_b.size(0)
        val_loss /= len(val_loader.dataset)
        scheduler.step(val_loss)
        
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            best_model_state = model.state_dict().copy()
            improved = "*"
        else:
            improved = ""
            
        print(f"Epoch {epoch:02d}/{epochs:02d} | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} {improved}")
        
    # Load best weights
    model.load_state_dict(best_model_state)
    weights_path = os.path.join(ARTIFACTS_DIR, "fusion_model.pt")
    torch.save(best_model_state, weights_path)
    print(f"\nSaved best model weights to {weights_path}")
    
    # Final evaluation on held-out test set
    test_metrics = evaluate_model(model, test_loader)
    test_metrics["model_name"] = "PyTorch Multimodal Fusion Network (Text + Structured)"
    test_metrics["evaluated_at"] = datetime.now(timezone.utc).isoformat()
    test_metrics["device"] = str(device)
    test_metrics["provenance"] = "Synthetic holdout (N=500, 100 held-out company profiles)"
    
    print(f"\n--- Final Test Set Evaluation ---")
    print(f"Test Accuracy: {test_metrics['accuracy']:.4f}")
    print(f"Test Macro F1: {test_metrics['macro_f1']:.4f}")
    print(f"Test Weighted F1: {test_metrics['weighted_f1']:.4f}")
    print(f"Per-Class Metrics: {test_metrics['per_class']}")
    print(f"Confusion Matrix:\n{np.array(test_metrics['confusion_matrix']['matrix'])}")
    
    eval_path = os.path.join(EVALUATION_DIR, "fusion_metrics.json")
    with open(eval_path, "w") as f:
        json.dump(test_metrics, f, indent=2)
    print(f"Saved test evaluation report to {eval_path}")

if __name__ == "__main__":
    main()

# ============================================================
#  FOG DETECTOR --> Freeze of gait CNN
#  DAPHNET dataset, ankle sensor only (columns 0,1,2) --> not full datat 
# ============================================================

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader

# Settings
DATA_FOLDER = "daphnet"   # folder containing  .txt files
WINDOW_SIZE = 64         # 128 samples @ 64Hz = 2 seconds
STEP_SIZE   = 32          # 50% overlap b/w windows
BATCH_SIZE  = 32
EPOCHS      = 50
LEARNING_RATE = 0.0005

# Load ankle columnes
def load_daphnet(folder):
    print("Loading data...")
    X_all, y_all = [], []

    files = list(Path(folder).glob("*.txt"))
    if len(files) == 0:
        raise FileNotFoundError(
            f"No .txt files found in '{folder}'. "
            "Make sure the daphnet folder is in the same directory as this script."
        )

    for f in files:
        df = pd.read_csv(f, sep=" ", header=None)
        df = df[df[10] != 0]                          # drop unlabeled rows
        X_all.append(df.iloc[:, :3].values)            # ankle only: cols 0,1,2
        y_all.append((df[10].values == 2).astype(int))  # 1 = FOG, 0 = normal

    X = np.vstack(X_all).astype(np.float32)
    y = np.concatenate(y_all)

    print(f"  Loaded {len(files)} patient files")
    print(f"  Total samples: {len(X)}")
    print(f"  FOG samples: {y.sum()} ({100*y.mean():.1f}%)")
    return X, y


# Slice into windows
def make_windows(X, y, size=WINDOW_SIZE, step=STEP_SIZE):
    print("Creating windows...")
    windows, labels = [], []

    for i in range(0, len(X) - size, step):
        window = X[i : i + size]
        label  = 1 if y[i : i + size].mean() > 0.5 else 0
        windows.append(window)
        labels.append(label)

    Xw = np.array(windows, dtype=np.float32)
    yw = np.array(labels)

    print(f"  Total windows: {len(Xw)}")
    print(f"  FOG windows:   {yw.sum()} ({100*yw.mean():.1f}%)")
    return Xw, yw


# normalize
def normalize(X_train, X_val, X_test):
    mean = X_train.mean(axis=(0, 1), keepdims=True)
    std  = X_train.std(axis=(0, 1), keepdims=True) + 1e-8
    return (X_train - mean) / std, (X_val - mean) / std, (X_test - mean) / std


# CNN model
class FOGCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            # Block 1
            nn.Conv1d(3, 32, kernel_size=7, padding=3),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.MaxPool1d(2),

            # Block 2
            nn.Conv1d(32, 64, kernel_size=5, padding=2),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.MaxPool1d(2),

            # Block 3
            nn.Conv1d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.AdaptiveAvgPool1d(1),

            # Classifier
            nn.Flatten(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(64, 2)
        )

    def forward(self, x):
        return self.net(x)


# Train
def train(model, loader, optimizer, loss_fn, device):
    model.train()
    total_loss, correct, total = 0, 0, 0
    for xb, yb in loader:
        xb, yb = xb.to(device), yb.to(device)
        optimizer.zero_grad()
        out  = model(xb)
        loss = loss_fn(out, yb)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
        correct    += (out.argmax(1) == yb).sum().item()
        total      += len(yb)
    return total_loss / len(loader), correct / total


# Eval
def evaluate(model, loader, loss_fn, device):
    model.eval()
    total_loss, correct, total = 0, 0, 0
    all_preds, all_labels = [], []
    with torch.no_grad():
        for xb, yb in loader:
            xb, yb = xb.to(device), yb.to(device)
            out  = model(xb)
            loss = loss_fn(out, yb)
            total_loss += loss.item()
            preds = out.argmax(1)
            correct    += (preds == yb).sum().item()
            total      += len(yb)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(yb.cpu().numpy())
    return total_loss / len(loader), correct / total, all_preds, all_labels


# Plot training curves
def plot_history(train_losses, val_losses, train_accs, val_accs):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

    ax1.plot(train_losses, label="Train loss")
    ax1.plot(val_losses,   label="Val loss")
    ax1.set_title("Loss over epochs")
    ax1.set_xlabel("Epoch")
    ax1.legend()

    ax2.plot(train_accs, label="Train accuracy")
    ax2.plot(val_accs,   label="Val accuracy")
    ax2.set_title("Accuracy over epochs")
    ax2.set_xlabel("Epoch")
    ax2.legend()

    plt.tight_layout()
    plt.savefig("training_curves.png")
    print("\nTraining curves saved to training_curves.png")
    plt.show()


# Main
def main():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}\n")

    # Load and window the data
    X, y = load_daphnet(DATA_FOLDER)
    Xw, yw = make_windows(X, y)

    # Split into train / val / test
    X_train, X_temp, y_train, y_temp = train_test_split(
        Xw, yw, test_size=0.3, stratify=yw, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, stratify=y_temp, random_state=42)

    print(f"\nSplit: {len(X_train)} train / {len(X_val)} val / {len(X_test)} test\n")

    # Normalize
    X_train, X_val, X_test = normalize(X_train, X_val, X_test)

    # Convert to tensors — shape must be (N, channels, timesteps)
    def to_tensor(X, y):
        Xt = torch.tensor(X).permute(0, 2, 1)  # (N, 128, 3) → (N, 3, 128)
        yt = torch.tensor(y, dtype=torch.long)
        return TensorDataset(Xt, yt)

    train_loader = DataLoader(to_tensor(X_train, y_train), batch_size=BATCH_SIZE, shuffle=True)
    val_loader   = DataLoader(to_tensor(X_val,   y_val),   batch_size=BATCH_SIZE)
    test_loader  = DataLoader(to_tensor(X_test,  y_test),  batch_size=BATCH_SIZE)

    # Class weights to handle imbalance (FOG is rare)
    counts  = torch.bincount(torch.tensor(y_train))
    weights = (1.0 / counts.float()).to(device)

    # Build model
    model     = FOGCNN().to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)
    loss_fn   = nn.CrossEntropyLoss(weight=weights)

    print("Starting training...\n")
    train_losses, val_losses = [], []
    train_accs,   val_accs   = [], []

    for epoch in range(EPOCHS):
        tr_loss, tr_acc = train(model, train_loader, optimizer, loss_fn, device)
        vl_loss, vl_acc, _, _ = evaluate(model, val_loader, loss_fn, device)

        train_losses.append(tr_loss)
        val_losses.append(vl_loss)
        train_accs.append(tr_acc)
        val_accs.append(vl_acc)

        print(f"Epoch {epoch+1:2d}/{EPOCHS}  "
              f"train loss: {tr_loss:.4f}  acc: {tr_acc:.3f}  |  "
              f"val loss: {vl_loss:.4f}  acc: {vl_acc:.3f}")

    # Final test evaluation
    print("\n── Test Results ──────────────────────────")
    _, _, preds, labels = evaluate(model, test_loader, loss_fn, device)
    print(classification_report(labels, preds, target_names=["Normal", "FOG"]))

    cm = confusion_matrix(labels, preds)
    print("Confusion matrix:")
    print(f"  Predicted:  Normal  FOG")
    print(f"  Normal:     {cm[0,0]:5d}  {cm[0,1]:4d}")
    print(f"  FOG:        {cm[1,0]:5d}  {cm[1,1]:4d}")

    # Save model
    torch.save(model.state_dict(), "fog_model.pth")
    print("\nModel saved to fog_model.pth")

    # Plot curves
    plot_history(train_losses, val_losses, train_accs, val_accs)

if __name__ == "__main__":
    main()
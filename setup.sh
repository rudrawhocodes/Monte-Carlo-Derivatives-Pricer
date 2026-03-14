#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "========================================="
echo " Monte Carlo Derivatives Pricing Engine"
echo " Setup Script"
echo "========================================="
echo ""

# ── Backend ──────────────────────────────────
echo "[1/3] Setting up Python backend..."
cd "$ROOT/backend"

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "  Created virtual environment."
fi

source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
echo "  Backend dependencies installed."

# ── Frontend ─────────────────────────────────
echo ""
echo "[2/3] Setting up Next.js frontend..."
cd "$ROOT/frontend"
npm install
echo "  Frontend dependencies installed."

# ── Done ─────────────────────────────────────
echo ""
echo "[3/3] Setup complete!"
echo ""
echo "To run the application:"
echo ""
echo "  Terminal 1 — Backend:"
echo "    cd backend && source venv/bin/activate"
echo "    uvicorn main:app --reload --port 8000"
echo ""
echo "  Terminal 2 — Frontend:"
echo "    cd frontend"
echo "    npm run dev"
echo ""
echo "  Then open http://localhost:3000"
echo "========================================="

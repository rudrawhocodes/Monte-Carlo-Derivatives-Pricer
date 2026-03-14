# Monte Carlo Derivatives Pricing Engine

## Variance Reduction & Indian Index Options

A production-grade quantitative finance web application that simulates stock/index price paths using **Geometric Brownian Motion**, prices European options via **Monte Carlo simulation** with **Antithetic Variates** variance reduction, and fetches live market data from **Yahoo Finance** for major Indian indices.

---

## Quick Start

```bash
# One-command setup
chmod +x setup.sh && ./setup.sh
```

### Manual Setup

**Backend (Python 3.10+):**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend (Node 18+):**

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

---

## Architecture

```
monte-carlo-pricer/
├── backend/
│   ├── main.py               # FastAPI application & endpoints
│   ├── market_data.py         # Yahoo Finance integration
│   ├── gbm_simulation.py     # Numba-accelerated GBM paths
│   ├── pricing_engine.py     # MC pricing, Greeks, Black-Scholes
│   ├── variance_reduction.py # Antithetic variates implementation
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (dark theme)
│   │   ├── page.tsx           # Main dashboard page
│   │   └── globals.css        # Glass-panel styling
│   ├── components/
│   │   ├── charts/            # Plotly.js interactive charts
│   │   └── controls/          # Control panel, results, header
│   ├── lib/api.ts             # Backend API client
│   └── types/index.ts         # TypeScript interfaces
└── setup.sh
```

## Supported Indices

| Index           | Yahoo Ticker |
| --------------- | ------------ |
| NIFTY 50        | ^NSEI        |
| BANK NIFTY      | ^NSEBANK     |
| SENSEX          | ^BSESN       |
| NIFTY 100       | ^CNX100      |
| NIFTY MIDCAP 50 | ^NSEMDCP50   |

## API Endpoints

| Method | Path           | Description                       |
| ------ | -------------- | --------------------------------- |
| GET    | `/indices`     | List supported indices            |
| GET    | `/market-data` | Fetch live price & volatility     |
| POST   | `/price`       | Run full MC pricing pipeline      |
| POST   | `/export-csv`  | Download results as CSV           |
| GET    | `/health`      | Health check                      |

## Technology Stack

- **Backend:** Python, FastAPI, NumPy, SciPy, Numba (JIT), yfinance
- **Frontend:** Next.js 14, TypeScript, TailwindCSS, Plotly.js, Framer Motion

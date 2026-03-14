"""
Monte Carlo Derivatives Pricing Engine — FastAPI Backend
"""

import csv
import io
import sys
import time
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from market_data import fetch_market_data, SUPPORTED_INDICES, MarketDataResponse
from pricing_engine import run_full_pricing

# ── Pre-warm Numba ───────────────────────────────────────────────────
# First call compiles the JIT functions; do it at import time.
print("Warming up Numba JIT compilation…", file=sys.stderr)
_t0 = time.time()
run_full_pricing(
    s0=100, K=100, r=0.05, sigma=0.2, T=1.0,
    n_paths=1000, n_path_steps=50, is_call=True, n_display_paths=10, seed=0,
)
print(f"JIT warm-up done in {time.time() - _t0:.1f}s", file=sys.stderr)

# ── App ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Monte Carlo Derivatives Pricing Engine",
    description="GBM-based Monte Carlo pricer for Indian index options with variance reduction",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ───────────────────────────────────────────────────────────
class PricingRequest(BaseModel):
    s0: float = Field(..., gt=0, description="Spot price")
    K: float = Field(..., gt=0, description="Strike price")
    r: float = Field(0.07, description="Risk-free rate (annualised)")
    sigma: float = Field(..., gt=0, description="Volatility (annualised)")
    T: float = Field(..., gt=0, description="Time to maturity in years")
    n_paths: int = Field(100_000, ge=1000, le=2_000_000)
    n_path_steps: int = Field(252, ge=10, le=1000)
    is_call: bool = True
    n_display_paths: int = Field(200, ge=10, le=500)
    seed: Optional[int] = 42


# ── Endpoints ────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "engine": "Monte Carlo Derivatives Pricing Engine v1.0"}


@app.get("/indices")
def list_indices():
    return {"indices": list(SUPPORTED_INDICES.keys()), "tickers": SUPPORTED_INDICES}


@app.get("/market-data", response_model=MarketDataResponse)
def get_market_data(
    index_name: str = Query(..., description="Index name, e.g. 'NIFTY 50'"),
    period: str = Query("1y", description="History period (1mo, 3mo, 6mo, 1y, 2y)"),
):
    try:
        return fetch_market_data(index_name, period)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.post("/price")
def price_option(req: PricingRequest):
    t0 = time.time()
    result = run_full_pricing(
        s0=req.s0,
        K=req.K,
        r=req.r,
        sigma=req.sigma,
        T=req.T,
        n_paths=req.n_paths,
        n_path_steps=req.n_path_steps,
        is_call=req.is_call,
        n_display_paths=req.n_display_paths,
        seed=req.seed if req.seed is not None else 42,
    )
    result["computation_time_ms"] = round((time.time() - t0) * 1000, 1)
    return result


@app.post("/export-csv")
def export_csv(req: PricingRequest):
    """Run simulation and return results as a downloadable CSV."""
    result = run_full_pricing(
        s0=req.s0,
        K=req.K,
        r=req.r,
        sigma=req.sigma,
        T=req.T,
        n_paths=req.n_paths,
        n_path_steps=req.n_path_steps,
        is_call=req.is_call,
        n_display_paths=req.n_display_paths,
        seed=req.seed if req.seed is not None else 42,
    )

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Metric", "Value"])
    writer.writerow(["Naive MC Price", result["naive_mc"]["price"]])
    writer.writerow(["Naive MC Std Error", result["naive_mc"]["std_error"]])
    writer.writerow(["Naive MC 95% CI Lower", result["naive_mc"]["ci_95"][0]])
    writer.writerow(["Naive MC 95% CI Upper", result["naive_mc"]["ci_95"][1]])
    writer.writerow(["Antithetic MC Price", result["antithetic_mc"]["price"]])
    writer.writerow(["Antithetic MC Std Error", result["antithetic_mc"]["std_error"]])
    writer.writerow(["Antithetic MC 95% CI Lower", result["antithetic_mc"]["ci_95"][0]])
    writer.writerow(["Antithetic MC 95% CI Upper", result["antithetic_mc"]["ci_95"][1]])
    writer.writerow(["Black-Scholes Price", result["black_scholes"]])
    for key, val in result["greeks"].items():
        writer.writerow([f"Greek – {key.capitalize()}", val])

    # Terminal prices
    writer.writerow([])
    writer.writerow(["Terminal Prices"])
    for p in result["terminal_prices"]:
        writer.writerow([p])

    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=mc_pricing_results.csv"},
    )


@app.get("/health")
def health():
    return {"status": "healthy"}

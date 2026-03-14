"""
Pricing Engine Module — European option pricing with Greeks estimation.
"""

import numpy as np
from scipy.stats import norm

from gbm_simulation import (
    simulate_gbm_paths,
    simulate_terminal_prices,
    simulate_terminal_antithetic,
)
from variance_reduction import (
    naive_mc_price,
    antithetic_mc_price,
    convergence_data,
)


# ── Black-Scholes analytical (benchmark) ────────────────────────────
def black_scholes_price(
    s0: float,
    K: float,
    r: float,
    sigma: float,
    T: float,
    is_call: bool,
) -> float:
    d1 = (np.log(s0 / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    if is_call:
        return float(s0 * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2))
    return float(K * np.exp(-r * T) * norm.cdf(-d2) - s0 * norm.cdf(-d1))


# ── Greeks via finite differences ────────────────────────────────────
def estimate_greeks(
    s0: float,
    K: float,
    r: float,
    sigma: float,
    T: float,
    n_paths: int,
    is_call: bool,
    seed: int = 42,
) -> dict:
    """Estimate Delta, Gamma, Vega, Theta, Rho via central finite differences."""
    ds = s0 * 0.01
    d_sigma = 0.01
    dt = 1.0 / 365
    dr = 0.001

    base, _ = antithetic_mc_price(s0, K, r, sigma, T, n_paths, is_call, seed)

    # Delta & Gamma
    p_up, _ = antithetic_mc_price(s0 + ds, K, r, sigma, T, n_paths, is_call, seed)
    p_dn, _ = antithetic_mc_price(s0 - ds, K, r, sigma, T, n_paths, is_call, seed)
    delta = (p_up - p_dn) / (2 * ds)
    gamma = (p_up - 2 * base + p_dn) / (ds ** 2)

    # Vega
    p_vup, _ = antithetic_mc_price(s0, K, r, sigma + d_sigma, T, n_paths, is_call, seed)
    p_vdn, _ = antithetic_mc_price(s0, K, r, sigma - d_sigma, T, n_paths, is_call, seed)
    vega = (p_vup - p_vdn) / (2 * d_sigma)

    # Theta (negative bump in T)
    if T - dt > 0:
        p_t, _ = antithetic_mc_price(s0, K, r, sigma, T - dt, n_paths, is_call, seed)
        theta = (p_t - base) / dt  # per-day
    else:
        theta = 0.0

    # Rho
    p_rup, _ = antithetic_mc_price(s0, K, r + dr, sigma, T, n_paths, is_call, seed)
    p_rdn, _ = antithetic_mc_price(s0, K, r - dr, sigma, T, n_paths, is_call, seed)
    rho = (p_rup - p_rdn) / (2 * dr)

    return {
        "delta": round(float(delta), 6),
        "gamma": round(float(gamma), 6),
        "vega": round(float(vega), 4),
        "theta": round(float(theta), 4),
        "rho": round(float(rho), 4),
    }


def run_full_pricing(
    s0: float,
    K: float,
    r: float,
    sigma: float,
    T: float,
    n_paths: int,
    n_path_steps: int,
    is_call: bool,
    n_display_paths: int = 200,
    seed: int = 42,
) -> dict:
    """
    Full pricing pipeline:
      - naive MC price
      - antithetic MC price
      - Black-Scholes benchmark
      - sample paths for visualisation
      - terminal price distribution
      - convergence data
      - Greeks
    """

    # 1) Prices
    naive_price, naive_se = naive_mc_price(s0, K, r, sigma, T, n_paths, is_call, seed)
    anti_price, anti_se = antithetic_mc_price(s0, K, r, sigma, T, n_paths, is_call, seed)
    bs_price = black_scholes_price(s0, K, r, sigma, T, is_call)

    # 2) Sample paths for chart (cap at n_display_paths)
    path_count = min(n_display_paths, n_paths)
    paths = simulate_gbm_paths(s0, r, sigma, T, n_path_steps, path_count, seed)
    # Downsample steps if too many for frontend
    max_chart_steps = 200
    if n_path_steps > max_chart_steps:
        step = n_path_steps // max_chart_steps
        paths = paths[:, ::step]
    paths_list = paths.tolist()

    # 3) Terminal prices for histogram
    terminal = simulate_terminal_prices(s0, r, sigma, T, min(n_paths, 50_000), seed)
    terminal_list = terminal.tolist()

    # 4) Payoff distribution
    if is_call:
        payoffs = np.maximum(terminal - K, 0)
    else:
        payoffs = np.maximum(K - terminal, 0)
    payoffs_list = payoffs.tolist()

    # 5) Convergence data
    conv = convergence_data(
        s0, K, r, sigma, T,
        max_paths=min(n_paths, 200_000),
        is_call=is_call,
        steps=40,
        seed=seed,
    )

    # 6) Greeks
    greeks_n = min(n_paths, 100_000)
    greeks = estimate_greeks(s0, K, r, sigma, T, greeks_n, is_call, seed)

    # 7) Confidence interval (95%)
    ci_naive = (
        round(float(naive_price - 1.96 * naive_se), 4),
        round(float(naive_price + 1.96 * naive_se), 4),
    )
    ci_anti = (
        round(float(anti_price - 1.96 * anti_se), 4),
        round(float(anti_price + 1.96 * anti_se), 4),
    )

    return {
        "naive_mc": {
            "price": round(float(naive_price), 4),
            "std_error": round(float(naive_se), 6),
            "ci_95": ci_naive,
        },
        "antithetic_mc": {
            "price": round(float(anti_price), 4),
            "std_error": round(float(anti_se), 6),
            "ci_95": ci_anti,
        },
        "black_scholes": round(float(bs_price), 4),
        "greeks": greeks,
        "paths": paths_list,
        "terminal_prices": terminal_list,
        "payoffs": payoffs_list,
        "convergence": conv,
        "parameters": {
            "s0": s0,
            "K": K,
            "r": r,
            "sigma": sigma,
            "T": T,
            "n_paths": n_paths,
            "is_call": is_call,
        },
    }

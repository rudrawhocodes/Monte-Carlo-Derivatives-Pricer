"""
Variance Reduction Module — Antithetic Variates implementation
and comparison utilities.
"""

import numpy as np
from numba import njit, prange


@njit(cache=True)
def _payoff(st: float, K: float, is_call: bool) -> float:
    if is_call:
        return max(st - K, 0.0)
    return max(K - st, 0.0)


@njit(parallel=True, cache=True)
def naive_mc_price(
    s0: float,
    K: float,
    r: float,
    sigma: float,
    T: float,
    n_paths: int,
    is_call: bool,
    seed: int = 42,
) -> tuple:
    """Standard Monte Carlo pricer.  Returns (price, std_error)."""
    drift = (r - 0.5 * sigma ** 2) * T
    vol = sigma * np.sqrt(T)
    discount = np.exp(-r * T)

    payoffs = np.empty(n_paths)
    np.random.seed(seed)

    for i in prange(n_paths):
        z = np.random.standard_normal()
        st = s0 * np.exp(drift + vol * z)
        payoffs[i] = _payoff(st, K, is_call)

    mean_payoff = payoffs.mean()
    std_payoff = payoffs.std()
    price = discount * mean_payoff
    std_error = discount * std_payoff / np.sqrt(n_paths)
    return price, std_error


@njit(parallel=True, cache=True)
def antithetic_mc_price(
    s0: float,
    K: float,
    r: float,
    sigma: float,
    T: float,
    n_paths: int,
    is_call: bool,
    seed: int = 42,
) -> tuple:
    """Antithetic variates Monte Carlo pricer.  Returns (price, std_error)."""
    drift = (r - 0.5 * sigma ** 2) * T
    vol = sigma * np.sqrt(T)
    discount = np.exp(-r * T)

    half = n_paths // 2
    payoffs = np.empty(half)
    np.random.seed(seed)

    for i in prange(half):
        z = np.random.standard_normal()
        st1 = s0 * np.exp(drift + vol * z)
        st2 = s0 * np.exp(drift + vol * (-z))
        p1 = _payoff(st1, K, is_call)
        p2 = _payoff(st2, K, is_call)
        payoffs[i] = 0.5 * (p1 + p2)

    mean_payoff = payoffs.mean()
    std_payoff = payoffs.std()
    price = discount * mean_payoff
    std_error = discount * std_payoff / np.sqrt(half)
    return price, std_error


def convergence_data(
    s0: float,
    K: float,
    r: float,
    sigma: float,
    T: float,
    max_paths: int,
    is_call: bool,
    steps: int = 50,
    seed: int = 42,
) -> dict:
    """
    Compute option price estimates at increasing simulation counts
    for both naive and antithetic MC.  Used for convergence plots.
    """
    path_counts = np.unique(
        np.logspace(2, np.log10(max_paths), steps).astype(np.int64)
    ).tolist()

    naive_prices = []
    antithetic_prices = []
    naive_errors = []
    antithetic_errors = []

    for n in path_counts:
        np_val, ne_val = naive_mc_price(s0, K, r, sigma, T, n, is_call, seed)
        ap_val, ae_val = antithetic_mc_price(s0, K, r, sigma, T, n, is_call, seed)
        naive_prices.append(float(np_val))
        antithetic_prices.append(float(ap_val))
        naive_errors.append(float(ne_val))
        antithetic_errors.append(float(ae_val))

    return {
        "path_counts": [int(x) for x in path_counts],
        "naive_prices": naive_prices,
        "antithetic_prices": antithetic_prices,
        "naive_errors": naive_errors,
        "antithetic_errors": antithetic_errors,
    }

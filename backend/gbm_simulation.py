"""
GBM Simulation Module — Geometric Brownian Motion
Numba-accelerated stochastic path generation.
"""

import numpy as np
from numba import njit, prange


@njit(parallel=True, cache=True)
def simulate_gbm_paths(
    s0: float,
    r: float,
    sigma: float,
    T: float,
    n_steps: int,
    n_paths: int,
    seed: int = 42,
) -> np.ndarray:
    """
    Simulate GBM paths using the log-normal discretisation.

    S_(t+dt) = S_t * exp((r - 0.5*sigma^2)*dt + sigma*sqrt(dt)*Z)

    Returns shape (n_paths, n_steps + 1).
    """
    dt = T / n_steps
    drift = (r - 0.5 * sigma ** 2) * dt
    vol = sigma * np.sqrt(dt)

    paths = np.empty((n_paths, n_steps + 1))
    np.random.seed(seed)

    for i in prange(n_paths):
        paths[i, 0] = s0
        for j in range(1, n_steps + 1):
            z = np.random.standard_normal()
            paths[i, j] = paths[i, j - 1] * np.exp(drift + vol * z)

    return paths


@njit(parallel=True, cache=True)
def simulate_terminal_prices(
    s0: float,
    r: float,
    sigma: float,
    T: float,
    n_paths: int,
    seed: int = 42,
) -> np.ndarray:
    """
    Simulate only terminal prices (single-step) for option pricing.
    Much faster than generating full paths when paths aren't needed.
    """
    drift = (r - 0.5 * sigma ** 2) * T
    vol = sigma * np.sqrt(T)

    st = np.empty(n_paths)
    np.random.seed(seed)

    for i in prange(n_paths):
        z = np.random.standard_normal()
        st[i] = s0 * np.exp(drift + vol * z)

    return st


@njit(parallel=True, cache=True)
def simulate_terminal_antithetic(
    s0: float,
    r: float,
    sigma: float,
    T: float,
    n_paths: int,
    seed: int = 42,
) -> np.ndarray:
    """
    Antithetic variates: for every Z, also use -Z.
    Returns 2 * n_paths terminal prices (paired).
    """
    drift = (r - 0.5 * sigma ** 2) * T
    vol = sigma * np.sqrt(T)

    half = n_paths
    st = np.empty(2 * half)
    np.random.seed(seed)

    for i in prange(half):
        z = np.random.standard_normal()
        st[2 * i] = s0 * np.exp(drift + vol * z)
        st[2 * i + 1] = s0 * np.exp(drift + vol * (-z))

    return st

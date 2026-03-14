export interface MarketData {
  index_name: string;
  ticker: string;
  current_price: number;
  historical_volatility: number;
  last_updated: string;
  period_used: string;
  data_points: number;
  price_history: number[];
  date_labels: string[];
}

export interface PricingRequest {
  s0: number;
  K: number;
  r: number;
  sigma: number;
  T: number;
  n_paths: number;
  n_path_steps: number;
  is_call: boolean;
  n_display_paths: number;
  seed: number;
}

export interface MCResult {
  price: number;
  std_error: number;
  ci_95: [number, number];
}

export interface Greeks {
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
  rho: number;
}

export interface ConvergenceData {
  path_counts: number[];
  naive_prices: number[];
  antithetic_prices: number[];
  naive_errors: number[];
  antithetic_errors: number[];
}

export interface PricingResult {
  naive_mc: MCResult;
  antithetic_mc: MCResult;
  black_scholes: number;
  greeks: Greeks;
  paths: number[][];
  terminal_prices: number[];
  payoffs: number[];
  convergence: ConvergenceData;
  parameters: {
    s0: number;
    K: number;
    r: number;
    sigma: number;
    T: number;
    n_paths: number;
    is_call: boolean;
  };
  computation_time_ms: number;
}

export interface IndicesResponse {
  indices: string[];
  tickers: Record<string, string>;
}

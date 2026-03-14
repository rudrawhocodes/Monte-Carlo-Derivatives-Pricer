"use client";

import { useState, useCallback } from "react";
import type { PricingRequest, PricingResult, MarketData } from "@/types";
import { fetchMarketData, runPricing, exportCSV } from "@/lib/api";
import ControlPanel from "@/components/controls/ControlPanel";
import PricePathsChart from "@/components/charts/PricePathsChart";
import TerminalDistChart from "@/components/charts/TerminalDistChart";
import ConvergenceChart from "@/components/charts/ConvergenceChart";
import PayoffDistChart from "@/components/charts/PayoffDistChart";
import VarianceCompChart from "@/components/charts/VarianceCompChart";
import ResultsPanel from "@/components/controls/ResultsPanel";
import Header from "@/components/controls/Header";

const DEFAULT_PARAMS: PricingRequest = {
  s0: 22000,
  K: 22000,
  r: 0.07,
  sigma: 0.15,
  T: 0.25,
  n_paths: 100000,
  n_path_steps: 252,
  is_call: true,
  n_display_paths: 200,
  seed: 42,
};

export default function Home() {
  const [params, setParams] = useState<PricingRequest>(DEFAULT_PARAMS);
  const [result, setResult] = useState<PricingResult | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [marketLoading, setMarketLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState("NIFTY 50");

  const handleFetchMarket = useCallback(async () => {
    setMarketLoading(true);
    setError(null);
    try {
      const data = await fetchMarketData(selectedIndex);
      setMarketData(data);
      setParams((prev) => ({
        ...prev,
        s0: data.current_price,
        K: Math.round(data.current_price / 50) * 50,
        sigma: parseFloat(data.historical_volatility.toFixed(4)),
      }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch market data");
    } finally {
      setMarketLoading(false);
    }
  }, [selectedIndex]);

  const handleRunPricing = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await runPricing(params);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Pricing failed");
    } finally {
      setLoading(false);
    }
  }, [params]);

  const handleExport = useCallback(async () => {
    try {
      await exportCSV(params);
    } catch {
      setError("CSV export failed");
    }
  }, [params]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 p-3 lg:p-4 max-w-[1920px] mx-auto w-full">
        {error && (
          <div className="mb-3 px-3 py-2 bg-zinc-900 border border-rose-900/50 text-rose-400 text-xs font-mono flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-zinc-500 hover:text-zinc-300 text-xs"
            >
              DISMISS
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
          <div className="xl:col-span-3 space-y-3">
            <ControlPanel
              params={params}
              setParams={setParams}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              onFetchMarket={handleFetchMarket}
              onRunPricing={handleRunPricing}
              onExport={handleExport}
              marketData={marketData}
              marketLoading={marketLoading}
              loading={loading}
            />
          </div>

          <div className="xl:col-span-9 space-y-3">
            {result && <ResultsPanel result={result} />}

            {loading && (
              <div className="bg-zinc-900 border border-zinc-800 p-8 flex flex-col items-center justify-center">
                <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin mb-3" />
                <p className="text-zinc-400 text-xs font-mono tracking-wider uppercase">
                  Running simulation
                </p>
                <p className="text-zinc-600 text-[10px] font-mono mt-1 tabular-nums">
                  {params.n_paths.toLocaleString()} paths / {params.n_path_steps} steps
                </p>
              </div>
            )}

            {result && !loading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="lg:col-span-2">
                  <PricePathsChart paths={result.paths} s0={params.s0} T={params.T} />
                </div>
                <TerminalDistChart
                  terminalPrices={result.terminal_prices}
                  strike={params.K}
                />
                <PayoffDistChart payoffs={result.payoffs} isCall={params.is_call} />
                <ConvergenceChart convergence={result.convergence} />
                <VarianceCompChart convergence={result.convergence} />
              </div>
            )}

            {!result && !loading && (
              <div className="bg-zinc-900 border border-zinc-800 p-16 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mb-1">
                  Pricing Engine Idle
                </p>
                <p className="text-[11px] text-zinc-600 max-w-xs">
                  Select an index, fetch market data, configure parameters, and
                  execute the simulation.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-900 px-4 py-2 text-center text-[10px] text-zinc-600 font-mono tracking-wide">
        MC PRICER &middot; GBM + ANTITHETIC VARIATES &middot; YAHOO FINANCE (~15M DELAYED)
      </footer>
    </div>
  );
}

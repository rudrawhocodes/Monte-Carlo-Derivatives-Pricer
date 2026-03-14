"use client";

import { Dispatch, SetStateAction } from "react";
import type { PricingRequest, MarketData } from "@/types";

const INDICES = [
  "NIFTY 50",
  "BANK NIFTY",
  "SENSEX",
  "NIFTY 100",
  "NIFTY MIDCAP 50",
];

interface Props {
  params: PricingRequest;
  setParams: Dispatch<SetStateAction<PricingRequest>>;
  selectedIndex: string;
  setSelectedIndex: (v: string) => void;
  onFetchMarket: () => void;
  onRunPricing: () => void;
  onExport: () => void;
  marketData: MarketData | null;
  marketLoading: boolean;
  loading: boolean;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ControlPanel({
  params,
  setParams,
  selectedIndex,
  setSelectedIndex,
  onFetchMarket,
  onRunPricing,
  onExport,
  marketData,
  marketLoading,
  loading,
}: Props) {
  const update = <K extends keyof PricingRequest>(
    key: K,
    value: PricingRequest[K]
  ) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const simLabels: Record<number, string> = {
    1000: "1K",
    10000: "10K",
    50000: "50K",
    100000: "100K",
    250000: "250K",
    500000: "500K",
    1000000: "1M",
  };
  const simSteps = Object.keys(simLabels).map(Number);

  return (
    <div className="space-y-3">
      {/* Market Data */}
      <div className="bg-zinc-900 border border-zinc-800 p-3 space-y-3">
        <h2 className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
          Market Data
        </h2>

        <Field label="Index">
          <select
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(e.target.value)}
            className="w-full"
          >
            {INDICES.map((idx) => (
              <option key={idx} value={idx}>
                {idx}
              </option>
            ))}
          </select>
        </Field>

        <button
          onClick={onFetchMarket}
          disabled={marketLoading}
          className="w-full py-1.5 rounded-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-mono tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {marketLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 border border-zinc-500 border-t-zinc-300 rounded-full animate-spin" />
              FETCHING
            </span>
          ) : (
            "FETCH DATA"
          )}
        </button>

        {marketData && (
          <div className="text-[11px] font-mono tabular-nums space-y-0.5 pt-1 border-t border-zinc-800">
            <div className="flex justify-between">
              <span className="text-zinc-500">Spot</span>
              <span className="text-zinc-100">
                {marketData.current_price.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Vol (ann.)</span>
              <span className="text-zinc-100">
                {(marketData.historical_volatility * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Updated</span>
              <span className="text-zinc-400 text-[10px]">
                {marketData.last_updated}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Parameters */}
      <div className="bg-zinc-900 border border-zinc-800 p-3 space-y-3">
        <h2 className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
          Parameters
        </h2>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Spot (S0)">
            <input
              type="number"
              step="50"
              value={params.s0}
              onChange={(e) => update("s0", parseFloat(e.target.value) || 0)}
              className="w-full"
            />
          </Field>
          <Field label="Strike (K)">
            <input
              type="number"
              step="50"
              value={params.K}
              onChange={(e) => update("K", parseFloat(e.target.value) || 0)}
              className="w-full"
            />
          </Field>
          <Field label="Rate (r)">
            <input
              type="number"
              step="0.005"
              value={params.r}
              onChange={(e) => update("r", parseFloat(e.target.value) || 0)}
              className="w-full"
            />
          </Field>
          <Field label="Vol (sigma)">
            <input
              type="number"
              step="0.01"
              value={params.sigma}
              onChange={(e) => update("sigma", parseFloat(e.target.value) || 0)}
              className="w-full"
            />
          </Field>
          <Field label="Maturity (T)">
            <input
              type="number"
              step="0.05"
              value={params.T}
              onChange={(e) => update("T", parseFloat(e.target.value) || 0)}
              className="w-full"
            />
          </Field>
          <Field label="Steps">
            <input
              type="number"
              step="10"
              value={params.n_path_steps}
              onChange={(e) =>
                update("n_path_steps", parseInt(e.target.value) || 252)
              }
              className="w-full"
            />
          </Field>
        </div>

        {/* Option Type */}
        <Field label="Type">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => update("is_call", true)}
              className={`py-1.5 rounded-sm text-xs font-mono tracking-wider transition-colors border ${
                params.is_call
                  ? "bg-emerald-950/50 text-emerald-500 border-emerald-800/50"
                  : "bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300"
              }`}
            >
              CALL
            </button>
            <button
              onClick={() => update("is_call", false)}
              className={`py-1.5 rounded-sm text-xs font-mono tracking-wider transition-colors border ${
                !params.is_call
                  ? "bg-rose-950/50 text-rose-500 border-rose-800/50"
                  : "bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300"
              }`}
            >
              PUT
            </button>
          </div>
        </Field>

        {/* Simulations Slider */}
        <Field label={`Paths: ${params.n_paths.toLocaleString()}`}>
          <input
            type="range"
            min={0}
            max={simSteps.length - 1}
            step={1}
            value={simSteps.indexOf(
              simSteps.reduce((prev, curr) =>
                Math.abs(curr - params.n_paths) < Math.abs(prev - params.n_paths)
                  ? curr
                  : prev
              )
            )}
            onChange={(e) => update("n_paths", simSteps[parseInt(e.target.value)])}
            className="w-full"
          />
          <div className="flex justify-between text-[9px] text-zinc-600 font-mono mt-0.5">
            {simSteps.map((s) => (
              <span key={s}>{simLabels[s]}</span>
            ))}
          </div>
        </Field>
      </div>

      {/* Actions */}
      <div className="space-y-1.5">
        <button
          onClick={onRunPricing}
          disabled={loading || !params.s0 || !params.K}
          className="w-full py-2 rounded-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 text-xs font-semibold tracking-widest uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 border border-zinc-500 border-t-zinc-300 rounded-full animate-spin" />
              COMPUTING
            </span>
          ) : (
            "RUN SIMULATION"
          )}
        </button>

        <button
          onClick={onExport}
          disabled={loading}
          className="w-full py-1.5 rounded-sm border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 text-[10px] font-mono tracking-wider transition-colors"
        >
          EXPORT CSV
        </button>
      </div>
    </div>
  );
}

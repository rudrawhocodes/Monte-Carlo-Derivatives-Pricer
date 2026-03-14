"use client";

import type { PricingResult } from "@/types";

interface Props {
  result: PricingResult;
}

export default function ResultsPanel({ result }: Props) {
  const vrPct =
    ((result.naive_mc.std_error - result.antithetic_mc.std_error) /
      result.naive_mc.std_error) *
    100;

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <h2 className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
          Pricing Output
        </h2>
        <span className="text-[10px] text-zinc-600 font-mono tabular-nums">
          {result.computation_time_ms}ms
        </span>
      </div>

      {/* Primary Prices */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-800">
        <div className="bg-zinc-900 p-3">
          <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase mb-1">
            Naive MC
          </p>
          <p className="text-2xl font-mono tabular-nums text-zinc-100 leading-none">
            {result.naive_mc.price.toFixed(2)}
          </p>
          <p className="text-[10px] font-mono tabular-nums text-zinc-600 mt-1">
            SE {result.naive_mc.std_error.toFixed(4)}
          </p>
        </div>

        <div className="bg-zinc-900 p-3">
          <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase mb-1">
            Antithetic MC
          </p>
          <p className="text-2xl font-mono tabular-nums text-emerald-500 leading-none">
            {result.antithetic_mc.price.toFixed(2)}
          </p>
          <p className="text-[10px] font-mono tabular-nums text-zinc-600 mt-1">
            SE {result.antithetic_mc.std_error.toFixed(4)}
          </p>
        </div>

        <div className="bg-zinc-900 p-3">
          <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase mb-1">
            Black-Scholes
          </p>
          <p className="text-2xl font-mono tabular-nums text-zinc-100 leading-none">
            {result.black_scholes.toFixed(2)}
          </p>
          <p className="text-[10px] font-mono tabular-nums text-zinc-600 mt-1">
            Analytical
          </p>
        </div>

        <div className="bg-zinc-900 p-3">
          <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase mb-1">
            Var. Reduction
          </p>
          <p className="text-2xl font-mono tabular-nums text-emerald-500 leading-none">
            {vrPct.toFixed(1)}%
          </p>
          <p className="text-[10px] font-mono tabular-nums text-zinc-600 mt-1">
            SE improvement
          </p>
        </div>
      </div>

      {/* CIs + Greeks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
            95% Confidence Intervals
          </p>
          <div className="grid grid-cols-2 gap-px bg-zinc-800">
            <div className="bg-zinc-900 p-2">
              <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">Naive</p>
              <p className="text-xs font-mono tabular-nums text-zinc-300">
                [{result.naive_mc.ci_95[0].toFixed(2)}, {result.naive_mc.ci_95[1].toFixed(2)}]
              </p>
            </div>
            <div className="bg-zinc-900 p-2">
              <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">Antithetic</p>
              <p className="text-xs font-mono tabular-nums text-emerald-500">
                [{result.antithetic_mc.ci_95[0].toFixed(2)}, {result.antithetic_mc.ci_95[1].toFixed(2)}]
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
            Greeks (Finite Diff.)
          </p>
          <div className="grid grid-cols-5 gap-px bg-zinc-800">
            {Object.entries(result.greeks).map(([name, value]) => (
              <div key={name} className="bg-zinc-900 p-2 text-center">
                <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">
                  {name}
                </p>
                <p className="text-[11px] font-mono tabular-nums text-zinc-300">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

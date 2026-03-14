"use client";

import dynamic from "next/dynamic";
import type { ConvergenceData } from "@/types";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const CHART_FONT = { family: "JetBrains Mono, monospace", size: 10, color: "#52525b" };
const GRID_COLOR = "#27272a";

interface Props {
  convergence: ConvergenceData;
}

export default function ConvergenceChart({ convergence }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-3">
      <h3 className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mb-2">
        MC Convergence
      </h3>
      <Plot
        data={[
          {
            x: convergence.path_counts,
            y: convergence.naive_prices,
            type: "scatter" as const,
            mode: "lines" as const,
            line: { width: 1.5, color: "#71717a" },
            name: "Naive",
          },
          {
            x: convergence.path_counts,
            y: convergence.antithetic_prices,
            type: "scatter" as const,
            mode: "lines" as const,
            line: { width: 1.5, color: "#10b981" },
            name: "Antithetic",
          },
        ]}
        layout={{
          height: 280,
          margin: { t: 8, r: 16, b: 36, l: 48 },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: CHART_FONT,
          xaxis: {
            title: { text: "Simulations", font: CHART_FONT },
            type: "log",
            gridcolor: GRID_COLOR,
            linecolor: GRID_COLOR,
          },
          yaxis: {
            title: { text: "Price", font: CHART_FONT },
            gridcolor: GRID_COLOR,
            linecolor: GRID_COLOR,
          },
          showlegend: true,
          legend: {
            x: 0.65, y: 0.95,
            bgcolor: "rgba(9,9,11,0.8)",
            bordercolor: "#27272a",
            borderwidth: 1,
            font: { ...CHART_FONT, size: 9 },
          },
        }}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: "100%", height: 280 }}
      />
    </div>
  );
}

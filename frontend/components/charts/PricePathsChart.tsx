"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const CHART_FONT = { family: "JetBrains Mono, monospace", size: 10, color: "#52525b" };
const GRID_COLOR = "#27272a";

interface Props {
  paths: number[][];
  s0: number;
  T: number;
}

export default function PricePathsChart({ paths, s0, T }: Props) {
  const data = useMemo(() => {
    const steps = paths[0]?.length ?? 0;
    const x = Array.from({ length: steps }, (_, i) =>
      ((i / (steps - 1)) * T).toFixed(3)
    );

    const maxShow = Math.min(paths.length, 200);
    const step = Math.max(1, Math.floor(paths.length / maxShow));

    const traces: Plotly.Data[] = [];
    for (let i = 0; i < paths.length && traces.length < maxShow; i += step) {
      traces.push({
        x,
        y: paths[i],
        type: "scatter" as const,
        mode: "lines" as const,
        line: { width: 0.5, color: "rgba(161,161,170,0.12)" },
        hoverinfo: "skip" as const,
        showlegend: false,
      });
    }

    const meanPath = Array.from({ length: steps }, (_, j) => {
      let sum = 0;
      for (let i = 0; i < paths.length; i++) sum += paths[i][j];
      return sum / paths.length;
    });

    traces.push({
      x,
      y: meanPath,
      type: "scatter" as const,
      mode: "lines" as const,
      line: { width: 1.5, color: "#a1a1aa" },
      name: "Mean",
    });

    traces.push({
      x: [x[0], x[x.length - 1]],
      y: [s0, s0],
      type: "scatter" as const,
      mode: "lines" as const,
      line: { width: 1, color: "#f43f5e", dash: "dot" },
      name: `S0 ${s0}`,
    });

    return traces;
  }, [paths, s0, T]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-3">
      <h3 className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mb-2">
        Simulated Price Paths
      </h3>
      <Plot
        data={data}
        layout={{
          height: 340,
          margin: { t: 8, r: 24, b: 36, l: 56 },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: CHART_FONT,
          xaxis: {
            title: { text: "T (years)", font: CHART_FONT },
            gridcolor: GRID_COLOR,
            zerolinecolor: GRID_COLOR,
            linecolor: GRID_COLOR,
          },
          yaxis: {
            title: { text: "Price", font: CHART_FONT },
            gridcolor: GRID_COLOR,
            zerolinecolor: GRID_COLOR,
            linecolor: GRID_COLOR,
          },
          showlegend: true,
          legend: {
            x: 0.01,
            y: 0.99,
            bgcolor: "rgba(9,9,11,0.8)",
            bordercolor: "#27272a",
            borderwidth: 1,
            font: { ...CHART_FONT, size: 9 },
          },
        }}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: "100%", height: 340 }}
      />
    </div>
  );
}

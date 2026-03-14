"use client";

import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const CHART_FONT = { family: "JetBrains Mono, monospace", size: 10, color: "#52525b" };
const GRID_COLOR = "#27272a";

interface Props {
  terminalPrices: number[];
  strike: number;
}

export default function TerminalDistChart({ terminalPrices, strike }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-3">
      <h3 className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mb-2">
        Terminal Price Distribution
      </h3>
      <Plot
        data={[
          {
            x: terminalPrices,
            type: "histogram" as const,
            nbinsx: 80,
            marker: {
              color: "rgba(113,113,122,0.4)",
              line: { color: "rgba(113,113,122,0.6)", width: 0.5 },
            },
            name: "S_T",
          } as any,
          {
            x: [strike, strike],
            y: [0, terminalPrices.length * 0.06],
            type: "scatter" as const,
            mode: "lines" as const,
            line: { color: "#f43f5e", width: 1, dash: "dot" },
            name: `K = ${strike}`,
          },
        ]}
        layout={{
          height: 280,
          margin: { t: 8, r: 16, b: 36, l: 48 },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: CHART_FONT,
          xaxis: {
            title: { text: "S_T", font: CHART_FONT },
            gridcolor: GRID_COLOR,
            linecolor: GRID_COLOR,
          },
          yaxis: {
            title: { text: "Freq", font: CHART_FONT },
            gridcolor: GRID_COLOR,
            linecolor: GRID_COLOR,
          },
          showlegend: true,
          legend: {
            x: 0.75, y: 0.95,
            bgcolor: "rgba(9,9,11,0.8)",
            bordercolor: "#27272a",
            borderwidth: 1,
            font: { ...CHART_FONT, size: 9 },
          },
          bargap: 0.02,
        }}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: "100%", height: 280 }}
      />
    </div>
  );
}

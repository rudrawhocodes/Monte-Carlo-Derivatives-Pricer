"use client";

import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const CHART_FONT = { family: "JetBrains Mono, monospace", size: 10, color: "#52525b" };
const GRID_COLOR = "#27272a";

interface Props {
  payoffs: number[];
  isCall: boolean;
}

export default function PayoffDistChart({ payoffs, isCall }: Props) {
  const nonZero = payoffs.filter((p) => p > 0);
  const itm = ((nonZero.length / payoffs.length) * 100).toFixed(1);

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
          Payoff Distribution
        </h3>
        <span className="text-[10px] font-mono tabular-nums text-zinc-600">
          ITM {itm}% &middot; {isCall ? "CALL" : "PUT"}
        </span>
      </div>
      <Plot
        data={[
          {
            x: payoffs,
            type: "histogram" as const,
            nbinsx: 60,
            marker: {
              color: isCall
                ? "rgba(16,185,129,0.35)"
                : "rgba(244,63,94,0.35)",
              line: {
                color: isCall
                  ? "rgba(16,185,129,0.6)"
                  : "rgba(244,63,94,0.6)",
                width: 0.5,
              },
            },
            name: "Payoff",
          } as any,
        ]}
        layout={{
          height: 280,
          margin: { t: 8, r: 16, b: 36, l: 48 },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: CHART_FONT,
          xaxis: {
            title: { text: "Payoff", font: CHART_FONT },
            gridcolor: GRID_COLOR,
            linecolor: GRID_COLOR,
          },
          yaxis: {
            title: { text: "Freq", font: CHART_FONT },
            gridcolor: GRID_COLOR,
            linecolor: GRID_COLOR,
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

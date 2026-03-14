import type {
  MarketData,
  PricingRequest,
  PricingResult,
  IndicesResponse,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error ${res.status}`);
  }
  return res.json();
}

export async function fetchIndices(): Promise<IndicesResponse> {
  return request<IndicesResponse>("/indices");
}

export async function fetchMarketData(
  indexName: string,
  period = "1y"
): Promise<MarketData> {
  const params = new URLSearchParams({ index_name: indexName, period });
  return request<MarketData>(`/market-data?${params}`);
}

export async function runPricing(
  params: PricingRequest
): Promise<PricingResult> {
  return request<PricingResult>("/price", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function getExportUrl(params: PricingRequest): string {
  return `${API_BASE}/export-csv`;
}

export async function exportCSV(params: PricingRequest): Promise<void> {
  const res = await fetch(`${API_BASE}/export-csv`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mc_pricing_results.csv";
  a.click();
  URL.revokeObjectURL(url);
}

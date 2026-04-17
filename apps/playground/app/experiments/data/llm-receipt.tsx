import React, { useMemo, useState } from "react";
import { Receipt, Code, Calculator, Info } from "lucide-react";

// --- 1. PRICING TABLE (Per 1,000 Tokens) ---
// Prices are estimated for demonstration purposes based on typical 2025/2026 rates.
const PRICING = {
  "Claude 3.5 Haiku": { input: 0.25, output: 1.25, cacheRead: 0.025 },
  "Claude 3.5 Sonnet": { input: 3.0, output: 15.0, cacheRead: 0.3 },
  "GPT-4o": { input: 2.5, output: 10.0, cacheRead: 1.25 },
  "GPT-4o-mini": { input: 0.15, output: 0.6, cacheRead: 0.075 },
  "Gemini 1.5 Flash": { input: 0.075, output: 0.3, cacheRead: 0.02 },
  "Gemini 1.5 Pro": { input: 1.25, output: 5.0, cacheRead: 0.35 },
};

// --- 2. RAW MOCK DATA ---
// This is what your chat application would log internally.
const RAW_SESSION_LOGS = [
  {
    id: "msg_001",
    model: "Claude 3.5 Haiku",
    provider: "Anthropic",
    inputTokens: 450,
    outputTokens: 120,
    cachedTokens: 0,
    ttft: "0.4s",
    tps: 110,
  },
  {
    id: "msg_002",
    model: "GPT-4o",
    provider: "OpenRouter",
    inputTokens: 1200,
    outputTokens: 650,
    cachedTokens: 450,
    ttft: "0.9s",
    tps: 75,
  },
  {
    id: "msg_003",
    model: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    inputTokens: 2500,
    outputTokens: 1100,
    cachedTokens: 1500,
    ttft: "1.2s",
    tps: 55,
  },
  {
    id: "msg_004",
    model: "Gemini 1.5 Flash",
    provider: "Google",
    inputTokens: 4200,
    outputTokens: 300,
    cachedTokens: 3000,
    ttft: "0.3s",
    tps: 140,
  },
];

// --- 3. UTILITY FUNCTIONS ---
const calculateSessionMetrics = (messages) => {
  let totalCost = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCachedTokens = 0;

  // 1. Calculate line items
  const processedItems = messages.map((msg) => {
    const pricing = PRICING[msg.model] || { input: 0, output: 0, cacheRead: 0 };

    // Calculate costs (divide by 1000 since pricing is per 1k tokens)
    const freshInputCost = ((msg.inputTokens - msg.cachedTokens) / 1000) * pricing.input;
    const cachedInputCost = (msg.cachedTokens / 1000) * pricing.cacheRead;
    const outputCost = (msg.outputTokens / 1000) * pricing.output;

    const itemTotalCost = freshInputCost + cachedInputCost + outputCost;

    totalCost += itemTotalCost;
    totalInputTokens += msg.inputTokens;
    totalOutputTokens += msg.outputTokens;
    totalCachedTokens += msg.cachedTokens;

    return {
      ...msg,
      cost: itemTotalCost,
    };
  });

  // 2. Calculate Blended Rate (Total Cost / Total Tokens per 1k)
  const totalTokens = totalInputTokens + totalOutputTokens;
  const blendedRatePer1k = totalTokens > 0 ? totalCost / (totalTokens / 1000) : 0;

  // 3. Calculate "What-If" Scenarios (Counterfactuals)
  const generateScenario = (modelName, label) => {
    const pricing = PRICING[modelName];
    if (!pricing) return null;

    // Simulate what the cost WOULD have been if the whole conversation used this model
    // Assuming the same cache hit ratio
    const freshInput = totalInputTokens - totalCachedTokens;
    const projectedCost =
      (freshInput / 1000) * pricing.input +
      (totalCachedTokens / 1000) * pricing.cacheRead +
      (totalOutputTokens / 1000) * pricing.output;

    return {
      label,
      model: modelName,
      projectedCost,
      diff: projectedCost - totalCost, // Negative means savings
    };
  };

  const whatIfScenarios = [
    generateScenario("Gemini 1.5 Flash", "Max Economy Path"),
    generateScenario("GPT-4o-mini", "Standard Economy"),
    generateScenario("GPT-4o", "Uniform Premium (GPT-4o)"),
  ].filter(Boolean);

  return {
    receiptId: `TXN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    summary: {
      totalCost,
      totalInputTokens,
      totalOutputTokens,
      totalCachedTokens,
      blendedRatePer1k,
    },
    lineItems: processedItems,
    whatIfScenarios,
  };
};

// --- 4. UI COMPONENTS ---
const ThermalReceipt = ({ data }) => {
  if (!data) return null;

  return (
    <div className="relative w-full max-w-md mx-auto bg-[#fcfbf9] text-slate-900 p-8 shadow-2xl font-mono text-sm border border-slate-200">
      {/* Top Jagged Edge */}
      <div
        className="absolute top-0 left-0 right-0 h-3 transform -translate-y-full flex"
        style={{
          backgroundImage: "radial-gradient(circle at 5px 0, transparent 4px, #fcfbf9 5px)",
          backgroundSize: "10px 10px",
          backgroundPosition: "bottom",
        }}
      ></div>

      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-dashed border-slate-300 pb-6">
        <h1 className="text-2xl font-black uppercase tracking-widest mb-2">LLM Router</h1>
        <p className="text-xs text-slate-500 font-bold uppercase">Session Telemetry</p>
        <p className="text-xs text-slate-500 mt-2">ID: {data.receiptId}</p>
        <p className="text-xs text-slate-500">{new Date(data.timestamp).toLocaleString()}</p>
      </div>

      {/* Line Items */}
      <div className="mb-6">
        <div className="flex justify-between font-bold mb-3 uppercase text-xs border-b border-slate-900 pb-1">
          <span>Call / Model</span>
          <span>Cost</span>
        </div>

        <div className="space-y-4">
          {data.lineItems.map((item, idx) => (
            <div key={item.id} className="relative">
              <div className="flex justify-between items-start">
                <span className="font-bold">
                  {String(idx + 1).padStart(2, "0")} {item.model}
                </span>
                <span className="font-bold">${item.cost.toFixed(4)}</span>
              </div>
              <div className="text-xs text-slate-600 pl-6 mt-1 flex justify-between">
                <span>via {item.provider}</span>
                <span>
                  {item.inputTokens} IN / {item.outputTokens} OUT
                </span>
              </div>
              {item.cachedTokens > 0 && (
                <div className="text-[10px] text-slate-500 pl-6 flex items-center gap-1">
                  <Calculator size={10} />
                  {item.cachedTokens} tokens read from cache
                </div>
              )}
              <div className="text-[10px] text-slate-400 pl-6 mt-1 flex gap-3">
                <span>TTFT: {item.ttft}</span>
                <span>TPS: {item.tps}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals Section */}
      <div className="border-t-2 border-dashed border-slate-300 pt-4 mb-6">
        <div className="flex justify-between text-xs mb-1">
          <span>Total Input Tokens</span>
          <span>{data.summary.totalInputTokens.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs mb-1">
          <span>Total Output Tokens</span>
          <span>{data.summary.totalOutputTokens.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>(Total Cached)</span>
          <span>({data.summary.totalCachedTokens.toLocaleString()})</span>
        </div>
        <div className="flex justify-between text-xs mb-4 text-slate-500">
          <span>Blended Rate</span>
          <span>${data.summary.blendedRatePer1k.toFixed(4)} / 1k</span>
        </div>

        <div className="flex justify-between items-end border-t border-slate-900 pt-2 mb-1">
          <span className="text-lg font-black uppercase">Total Billed</span>
          <span className="text-xl font-black">${data.summary.totalCost.toFixed(4)}</span>
        </div>
      </div>

      {/* What-If / Analytics */}
      <div className="bg-slate-100 p-4 border border-slate-300 rounded-sm">
        <h2 className="text-[11px] font-bold uppercase mb-3 flex items-center gap-2">
          <Info size={14} /> Counterfactual Analysis
        </h2>
        <div className="space-y-2">
          {data.whatIfScenarios.map((scenario, idx) => {
            const isSavings = scenario.diff < 0;
            return (
              <div
                key={idx}
                className="text-xs flex flex-col border-b border-slate-200 pb-2 last:border-0 last:pb-0"
              >
                <div className="flex justify-between">
                  <span className="font-semibold">{scenario.label}</span>
                  <span>${scenario.projectedCost.toFixed(4)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-slate-500">If routed to {scenario.model}</span>
                  <span className={`font-bold ${isSavings ? "text-green-600" : "text-rose-600"}`}>
                    {isSavings ? "Save" : "Add"} ${Math.abs(scenario.diff).toFixed(4)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Barcode Footer */}
      <div className="mt-10 flex flex-col items-center">
        {/* Fake Barcode */}
        <div className="h-10 w-full flex justify-center gap-[2px] opacity-80 mb-2">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-900 h-full"
              style={{ width: `${Math.random() * 4 + 1}px` }}
            ></div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest">End of Session</p>
      </div>

      {/* Bottom Jagged Edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-3 transform translate-y-full flex"
        style={{
          backgroundImage: "radial-gradient(circle at 5px 10px, transparent 4px, #fcfbf9 5px)",
          backgroundSize: "10px 10px",
          backgroundPosition: "top",
        }}
      ></div>
    </div>
  );
};

// --- 5. MAIN APP ---
export default function App() {
  const [viewMode, setViewMode] = useState("receipt");

  // Memoize the calculation so it only runs once per data set
  const sessionData = useMemo(() => calculateSessionMetrics(RAW_SESSION_LOGS), []);

  return (
    <div className="min-h-screen bg-slate-200 p-4 md:p-8 flex flex-col items-center font-sans">
      {/* Header / Controls */}
      <div className="max-w-4xl w-full flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">LLM Cost Router UI</h1>
          <p className="text-sm text-slate-600">Simulating utility functions & receipt rendering</p>
        </div>

        <div className="flex bg-slate-300 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("receipt")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${viewMode === "receipt" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            <Receipt size={16} /> Receipt View
          </button>
          <button
            onClick={() => setViewMode("data")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${viewMode === "data" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            <Code size={16} /> Raw JSON
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full flex justify-center pb-12">
        {viewMode === "receipt" ? (
          <ThermalReceipt data={sessionData} />
        ) : (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 rounded-xl p-6 shadow-xl overflow-auto h-[600px]">
              <h3 className="text-slate-400 text-xs font-bold uppercase mb-4 tracking-wider flex justify-between">
                <span>1. Input: Raw Logs</span>
                <span className="text-blue-400">Array</span>
              </h3>
              <pre className="text-green-400 font-mono text-xs whitespace-pre-wrap">
                {JSON.stringify(RAW_SESSION_LOGS, null, 2)}
              </pre>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 shadow-xl overflow-auto h-[600px]">
              <h3 className="text-slate-400 text-xs font-bold uppercase mb-4 tracking-wider flex justify-between">
                <span>2. Output: Utility Function Result</span>
                <span className="text-purple-400">Object</span>
              </h3>
              <pre className="text-purple-300 font-mono text-xs whitespace-pre-wrap">
                {JSON.stringify(sessionData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ... (imports)
import { useState, memo } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/api/client";
import { TokenizeResponse, TokenDetail, TokenStats } from "@/lib/types";
import { cn } from "@/lib/utils";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Copy from "lucide-react/dist/esm/icons/copy";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import { useEffect } from "react";

// (useDebouncedEffect unchanged)
function useDebouncedEffect(effect: () => void, deps: any[], delay: number) {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay);
    return () => clearTimeout(handler);
  }, [...deps, delay]);
}

export function TokenizerView() {
  const [text, setText] = useState("Hello world, this is the Tokenizer.");
  const [lastAnalysis, setLastAnalysis] = useState<TokenizeResponse | null>(
    null,
  );
  const [showStats, setShowStats] = useState(false);

  // Defer stats panel render to prioritize tokens
  useEffect(() => {
    if (lastAnalysis) {
      const timer = setTimeout(() => setShowStats(true), 50);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [lastAnalysis]);

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (input: string) => {
      if (!input.trim()) return null;
      return apiRequest<TokenizeResponse>("/tokenize", {
        method: "POST",
        body: JSON.stringify({ text: input }),
      });
    },
    onSuccess: (data) => {
      // Hide stats briefly when data updates (optional, but helps perceived perfs)
      setShowStats(false);
      setLastAnalysis(data);
    },
  });

  useDebouncedEffect(
    () => {
      mutate(text);
    },
    [text],
    500,
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Intro / Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Tokenizer Playground</h2>
        <p className="text-slate-300 text-lg">
          Type below to see real-time tokenization and statistics.
        </p>
      </div>

      {/* Input Area */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-slate-100 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
        <div className="relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-48 p-6 text-lg text-slate-800 placeholder:text-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-slate-900/5 font-sans leading-relaxed"
            placeholder="Enter text to tokenize..."
            spellCheck={false}
            aria-label="Input text for tokenization"
          />
          <div className="absolute bottom-4 right-4 flex items-center space-x-2">
            {isPending ? (
              <span className="flex items-center text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
                <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                Processing
              </span>
            ) : (
              <span className="text-xs text-slate-700 font-medium px-2 py-1">
                {text.length} chars
              </span>
            )}
          </div>
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded-lg bg-red-50 border border-red-100 flex items-start text-red-700">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium">Error processing text</h3>
            <p className="text-sm opacity-90">{String(error)}</p>
          </div>
        </div>
      ) : null}

      {/* Visualization Area */}
      {lastAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 view-transition">
          {/* Tokens */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Tokens</h3>
              <div className="flex space-x-2">
                <div className="flex items-center text-xs text-slate-300 space-x-3">
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-slate-100 border border-slate-200 mr-1.5" />{" "}
                    Word
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-orange-50 border border-orange-200 mr-1.5" />{" "}
                    Punctuation
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-red-50 border border-red-200 mr-1.5" />{" "}
                    Unknown
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm min-h-[300px]">
              <div className="flex flex-wrap gap-2 content-start">
                {lastAnalysis.token_details.map((token, idx) => (
                  <TokenPill key={`${token.id}-${idx}`} token={token} />
                ))}
              </div>
            </div>
          </div>

          {showStats && (
            <StatsPanel stats={lastAnalysis.stats} ids={lastAnalysis.ids} />
          )}
        </div>
      )}
    </div>
  );
}

const StatsPanel = memo(
  ({ stats, ids }: { stats: TokenStats | undefined; ids: number[] }) => {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white">Statistics</h3>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm divide-y divide-slate-100">
          <StatRow label="Vocabulary IDs" value={ids.length.toString()} />
          <StatRow
            label="Unique Tokens"
            value={stats?.unique_tokens.toString() || "0"}
          />
          <StatRow
            label="Unknown Tokens"
            value={stats?.unk_count.toString() || "0"}
            alert={stats?.unk_count ? stats.unk_count > 0 : false}
          />
          <StatRow
            label="Compression"
            value={`${stats?.compression_ratio || 0}x`}
          />
          <StatRow
            label="Character Count"
            value={stats?.char_count.toString() || "0"}
          />
        </div>

        <div className="bg-slate-900 rounded-xl p-6 text-slate-300 font-mono text-xs leading-relaxed overflow-hidden relative group">
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => navigator.clipboard.writeText(JSON.stringify(ids))}
              className="p-1.5 hover:bg-white/10 rounded"
              aria-label="Copy IDs"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
            {`[${ids.join(", ")}]`}
          </div>
        </div>
      </div>
    );
  },
);

const TokenPill = memo(({ token }: { token: TokenDetail }) => {
  let colorClass =
    "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";
  if (token.type === "unknown")
    colorClass = "bg-red-50 border-red-200 text-red-700 hover:bg-red-100";
  if (token.type === "punctuation")
    colorClass =
      "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100";
  if (token.type === "number")
    colorClass = "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100";

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center px-2 py-1.5 rounded-lg border text-sm font-medium transition-all duration-100 cursor-default select-none group relative",
        colorClass,
      )}
    >
      <span>{token.token.replace(/Ġ/g, " ")}</span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity duration-200 shadow-md">
        ID: {token.id}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
      </div>
    </div>
  );
});

const StatRow = memo(
  ({
    label,
    value,
    alert = false,
  }: {
    label: string;
    value: string;
    alert?: boolean;
  }) => {
    return (
      <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
        <span className="text-sm text-slate-600 font-medium">{label}</span>
        <span
          className={cn(
            "font-mono text-sm font-semibold",
            alert ? "text-red-600" : "text-slate-900",
          )}
        >
          {value}
        </span>
      </div>
    );
  },
);

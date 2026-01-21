import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/api/client";
import { VocabStatsResponse, VocabSearchResponse } from "@/lib/types";
import { useDebounce } from "@/hooks/useDebounce";
import Search from "lucide-react/dist/esm/icons/search";
import Hash from "lucide-react/dist/esm/icons/hash";
import Quote from "lucide-react/dist/esm/icons/quote";
import Type from "lucide-react/dist/esm/icons/type";
import AlignLeft from "lucide-react/dist/esm/icons/align-left";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { motion } from "framer-motion";

export function VocabExplorer() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  // Stats Query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["vocabStats"],
    queryFn: () => apiRequest<VocabStatsResponse>("/vocab/stats"),
  });

  // Search Query
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["vocabSearch", debouncedQuery],
    queryFn: () =>
      apiRequest<VocabSearchResponse>(
        `/vocab/search?q=${debouncedQuery}&limit=50`,
      ),
    enabled: true,
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Vocabulary Explorer</h2>
        <p className="text-slate-300 text-lg">
          Browse and search the tokenizer's vocabulary.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          Icon={Hash}
          label="Total Size"
          value={stats?.vocab_size}
          loading={statsLoading}
        />
        <StatCard
          Icon={Quote}
          label="Apostrophes"
          value={stats?.apostrophe_count}
          loading={statsLoading}
        />
        <StatCard
          Icon={Type}
          label="Numbers"
          value={stats?.number_count}
          loading={statsLoading}
        />
        <StatCard
          Icon={AlignLeft}
          label="Punctuation"
          value={stats?.punctuation_count}
          loading={statsLoading}
        />
      </div>

      {/* Search Area */}
      <div className="space-y-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-600" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none text-slate-900 placeholder:text-slate-700"
            placeholder="Search for a word..."
            aria-label="Search vocabulary"
          />
          {searchLoading && (
            <div className="absolute right-4 top-3.5">
              <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
            </div>
          )}
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">
              {debouncedQuery ? "Search Results" : "Top Words"}
            </h3>
            <span className="text-xs text-slate-600 uppercase tracking-wider font-semibold">
              Frequency ID
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {searchResults?.results.length === 0 && !searchLoading && (
              <div className="p-8 text-center text-slate-700">
                No tokens found matching "{debouncedQuery}"
              </div>
            )}

            {/* Fallback to stats top words if no query */}
            {!debouncedQuery &&
              stats?.top_words.map((word: { word: string; freq: number }) => (
                <TokenRow
                  key={word.word}
                  word={word.word}
                  freq={word.freq}
                  id={null}
                />
              ))}

            {/* Search Results */}
            {searchResults?.results.map(
              (result: { id: number; word: string; frequency: number }) => (
                <TokenRow
                  key={result.id}
                  word={result.word}
                  freq={result.frequency}
                  id={result.id}
                />
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  Icon: React.ElementType;
  label: string;
  value: number | undefined;
  loading: boolean;
}

function StatCard({ Icon, label, value, loading }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900">
        {loading ? (
          <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
        ) : (
          value?.toLocaleString() || "-"
        )}
      </div>
    </div>
  );
}

interface TokenRowProps {
  word: string;
  freq: number;
  id: number | null;
}

function TokenRow({ word, freq, id }: TokenRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <span className="font-mono text-sm bg-slate-100 px-2 py-0.5 rounded text-slate-700">
          {word.replace(/Ġ/g, " ")}
        </span>
        {id !== null && (
          <span className="text-xs text-slate-700">ID: {id}</span>
        )}
      </div>
      <div className="text-sm font-medium text-slate-700">
        {freq.toLocaleString()}
      </div>
    </motion.div>
  );
}

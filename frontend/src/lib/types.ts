export interface TokenDetail {
  token: string;
  id: number;
  type: string;
  index: number;
}

export interface TokenStats {
  total_tokens: number;
  unique_tokens: number;
  unk_count: number;
  compression_ratio: number;
  char_count: number;
}

export interface TokenizeResponse {
  tokens: string[];
  ids: number[];
  decoded: string;
  token_details: TokenDetail[];
  stats: TokenStats;
}

export interface VocabStatsResponse {
  vocab_size: number;
  apostrophe_count: number;
  hyphen_count: number;
  number_count: number;
  punctuation_count: number;
  examples: Record<string, string>;
  top_words: Array<{ word: string; freq: number }>;
}

export interface VocabSearchResult {
  word: string;
  id: number;
  frequency: number;
}

export interface VocabSearchResponse {
  results: VocabSearchResult[];
  query: string;
}

import { useState, lazy, Suspense } from "react";
import { Layout } from "./components/layout/Layout";

import Loader2 from "lucide-react/dist/esm/icons/loader-2";

// Lazy Load Views
const TokenizerView = lazy(() =>
  import("./views/TokenizerView").then((module) => ({
    default: module.TokenizerView,
  })),
);
const VocabExplorer = lazy(() =>
  import("./views/VocabExplorer").then((module) => ({
    default: module.VocabExplorer,
  })),
);

function LoadingSpinner() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center text-slate-600">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("tokenizer");

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="view-transition">
        <Suspense fallback={<LoadingSpinner />}>
          {activeTab === "tokenizer" && <TokenizerView />}
          {activeTab === "vocab" && <VocabExplorer />}
        </Suspense>
      </div>
    </Layout>
  );
}

export default App;

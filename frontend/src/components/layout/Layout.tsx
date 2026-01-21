import { useState } from "react";
import Menu from "lucide-react/dist/esm/icons/menu";
import X from "lucide-react/dist/esm/icons/x";
import Terminal from "lucide-react/dist/esm/icons/terminal";
import Book from "lucide-react/dist/esm/icons/book";
import Layers from "lucide-react/dist/esm/icons/layers";
import { cn } from "@/lib/utils";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";

type SidebarLink = {
  icon: React.ElementType;
  label: string;
  id: string;
};

const LINKS: SidebarLink[] = [
  { icon: Terminal, label: "Tokenizer", id: "tokenizer" },
  { icon: Book, label: "Vocabulary", id: "vocab" },
];

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans relative">
      {/* Animated Background */}
      <AnimatedGradientBackground Breathing={true} containerClassName="z-0" />

      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-slate-900 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-200"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative z-40 h-full border-r border-white/10 bg-black/20 backdrop-blur-xl shadow-none overflow-hidden transition-all duration-300 ease-out",
          sidebarOpen
            ? "translate-x-0 w-[240px]"
            : "-translate-x-full lg:translate-x-0 lg:w-0 lg:border-none",
        )}
      >
        <div className="flex flex-col h-full w-[240px]">
          {/* Header */}
          <div className="h-14 flex items-center justify-center border-b border-white/10">
            <Layers className="h-6 w-6 text-white" />
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1">
            {LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onTabChange(link.id);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  aria-label={`Navigate to ${link.label}`}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500/50",
                    isActive
                      ? "bg-white/10 text-white shadow-sm backdrop-blur-md border border-white/10"
                      : "text-slate-400 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 mr-3 transition-opacity",
                      isActive ? "opacity-100" : "opacity-70",
                    )}
                  />
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Footer stats or info could go here */}
          <div className="p-4 border-t border-white/10">
            <div className="text-[10px] text-slate-500 font-mono">
              v1.0.0 • Fast API
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative z-10">
        {/* Top Header (Mobile/Toggle) */}
        <header className="h-14 flex-none border-b border-white/10 bg-black/20 backdrop-blur-xl px-4 flex items-center justify-between z-20 sticky top-0">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-white/10 text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
              aria-label="Toggle Sidebar"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <div className="ml-4 h-5 w-px bg-white/10 lg:hidden" />

            {/* Title on Nav Bar */}
            <h1 className="ml-4 text-lg font-bold tracking-tight text-white hidden lg:block">
              Tokenizer
            </h1>
            <span className="ml-4 font-semibold text-slate-200 lg:hidden">
              {LINKS.find((l) => l.id === activeTab)?.label}
            </span>
          </div>
        </header>

        {/* Scrollable Area */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 scroll-smooth"
        >
          <div className="max-w-5xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

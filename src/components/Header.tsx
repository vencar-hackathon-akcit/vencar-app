import React from 'react';
import { Activity, ShieldCheck, Terminal, FileText, Cpu, Database, RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeTab: 'valuation' | 'waterfall' | 'comps' | 'residual' | 'fleet';
  setActiveTab: (tab: 'valuation' | 'waterfall' | 'comps' | 'residual' | 'fleet') => void;
  onOpenDossier: () => void;
  onOpenApi: () => void;
  onReset: () => void;
  isCalculating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenDossier,
  onOpenApi,
  onReset,
  isCalculating,
}) => {
  return (
    <header className="border-b border-[#29383D] bg-[#0B1015]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-3">
        {/* Top telemetry bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#29383D]/60 text-xs">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#121A20] border border-[#29383D] flex items-center justify-center text-[#00C7D4]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-sm sm:text-base">
                  AUTONOMOUS VALUATION ENGINE
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#17242A] text-[#00C7D4] border border-[#00C7D4]/30">
                  v4.91 QUANTSYS
                </span>
              </div>
              <p className="text-[11px] text-[#91A2A6] font-mono tracking-wide">
                DEALERSHIP INFRASTRUCTURE // DETERMINISTIC PRICING FEED
              </p>
            </div>
          </div>

          {/* Real-time Telemetry Status Signals */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#91A2A6]">
            <div className="flex items-center gap-1.5 bg-[#121A20] px-2.5 py-1 rounded border border-[#29383D]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B7F34A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B7F34A]"></span>
              </span>
              <span className="text-[#dee3ea]">LIVE BLOTTER:</span>
              <span className="text-[#B7F34A] font-semibold tabular-nums">48,190 TX/HR</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#121A20] px-2.5 py-1 rounded border border-[#29383D]">
              <Activity className="w-3 h-3 text-[#00C7D4]" />
              <span>LATENCY:</span>
              <span className="text-[#00C7D4] font-semibold tabular-nums">12ms</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#121A20] px-2.5 py-1 rounded border border-[#29383D]">
              <ShieldCheck className="w-3 h-3 text-[#B7F34A]" />
              <span className="text-[#dee3ea]">DETERMINISTIC GUARANTEE</span>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenDossier}
                className="h-8 px-3 rounded bg-[#17242A] border border-[#29383D] text-[#F2F6F5] hover:border-[#91A2A6] transition-colors flex items-center gap-1.5 font-medium text-xs cursor-pointer"
                title="Generate Audit Dossier"
              >
                <FileText className="w-3.5 h-3.5 text-[#00C7D4]" />
                <span className="hidden sm:inline">Appraisal</span> Dossier
              </button>

              <button
                onClick={onOpenApi}
                className="h-8 px-3 rounded bg-[#1677FF] text-white hover:bg-[#1677FF]/90 transition-colors flex items-center gap-1.5 font-semibold text-xs cursor-pointer shadow-sm"
                title="DMS & API Integration"
              >
                <Database className="w-3.5 h-3.5" />
                <span>API / DMS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between pt-2">
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('valuation')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'valuation'
                  ? 'bg-[#17242A] text-[#00C7D4] border border-[#00C7D4]/40 font-semibold'
                  : 'text-[#91A2A6] hover:text-[#F2F6F5] hover:bg-[#121A20]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Algorithmic Valuation
            </button>

            <button
              onClick={() => setActiveTab('waterfall')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'waterfall'
                  ? 'bg-[#17242A] text-[#00C7D4] border border-[#00C7D4]/40 font-semibold'
                  : 'text-[#91A2A6] hover:text-[#F2F6F5] hover:bg-[#121A20]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Waterfall Breakdown
            </button>

            <button
              onClick={() => setActiveTab('comps')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'comps'
                  ? 'bg-[#17242A] text-[#00C7D4] border border-[#00C7D4]/40 font-semibold'
                  : 'text-[#91A2A6] hover:text-[#F2F6F5] hover:bg-[#121A20]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Auction Comps Blotter
            </button>

            <button
              onClick={() => setActiveTab('residual')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'residual'
                  ? 'bg-[#17242A] text-[#00C7D4] border border-[#00C7D4]/40 font-semibold'
                  : 'text-[#91A2A6] hover:text-[#F2F6F5] hover:bg-[#121A20]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              36M Residual Decay
            </button>

            <button
              onClick={() => setActiveTab('fleet')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'fleet'
                  ? 'bg-[#17242A] text-[#00C7D4] border border-[#00C7D4]/40 font-semibold'
                  : 'text-[#91A2A6] hover:text-[#F2F6F5] hover:bg-[#121A20]'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Fleet & Batch Portfolio
            </button>
          </nav>

          <button
            onClick={onReset}
            className="hidden md:flex items-center gap-1 text-[11px] text-[#91A2A6] hover:text-[#F2F6F5] px-2 py-1 rounded hover:bg-[#121A20] transition-colors cursor-pointer"
            title="Reset model calculations to vehicle defaults"
          >
            <RefreshCw className={`w-3 h-3 ${isCalculating ? 'animate-spin text-[#00C7D4]' : ''}`} />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>
    </header>
  );
};

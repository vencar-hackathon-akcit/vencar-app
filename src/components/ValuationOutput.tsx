import React from 'react';
import { CalculatedValuation } from '../utils/valuationMath';
import { VehicleSpecs, VehicleInput } from '../types';
import { ShieldCheck, Download, ExternalLink, Zap, ArrowUpRight, ArrowDownRight, Clock, Target, AlertCircle } from 'lucide-react';

interface ValuationOutputProps {
  valuation: CalculatedValuation;
  specs: VehicleSpecs;
  input: VehicleInput;
  onOpenDossier: () => void;
  onOpenApi: () => void;
  isCalculating: boolean;
}

export const ValuationOutput: React.FC<ValuationOutputProps> = ({
  valuation,
  specs,
  input,
  onOpenDossier,
  onOpenApi,
  isCalculating,
}) => {
  const { distribution } = valuation;

  // Calculate percentage positions for distribution bar
  // Range from (Wholesale Floor * 0.95) to (Retail Ceiling * 1.05)
  const minRange = Math.round(distribution.wholesaleFloor * 0.94);
  const maxRange = Math.round(distribution.retailCeiling * 1.05);
  const totalSpan = maxRange - minRange;

  const floorPct = Math.max(0, Math.min(100, ((distribution.wholesaleFloor - minRange) / totalSpan) * 100));
  const avePct = Math.max(0, Math.min(100, ((distribution.algorithmicFairValue - minRange) / totalSpan) * 100));
  const retailPct = Math.max(0, Math.min(100, ((distribution.retailCeiling - minRange) / totalSpan) * 100));
  const benchmarkPct = Math.max(0, Math.min(100, ((distribution.marketBenchmark - minRange) / totalSpan) * 100));

  return (
    <div className="space-y-4">
      {/* Level 2 Elevation Main Valuation Card */}
      <div className="bg-[#17242A] border border-[#00C7D4]/40 rounded-lg p-5 sm:p-6 shadow-[0_12px_32px_rgba(0,0,0,0.45)] relative overflow-hidden">
        {/* Subtle decorative grid highlight */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#00C7D4]/10 via-transparent to-transparent pointer-events-none" />

        {/* Card Header & Telemetry Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#29383D]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#91A2A6] uppercase tracking-[0.08em]">
                DETERMINISTIC VALUATION OUTPUT
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C7D4] animate-pulse" />
            </div>
            <h3 className="text-sm font-semibold text-[#F2F6F5] mt-0.5">
              Instant Institutional Buyout Guarantee
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-[24px] px-2 rounded-full text-xs font-semibold flex items-center gap-1 bg-[#B7F34A]/12 text-[#B7F34A] border border-[#B7F34A]/30">
              <ShieldCheck className="w-3 h-3" />
              {valuation.confidenceScore}% Certainty Index
            </span>
          </div>
        </div>

        {/* Big Tabular Price Output */}
        <div className="py-4">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <div>
              <span className="text-[11px] uppercase font-semibold text-[#91A2A6] tracking-wider block">
                AVE FAIR VALUE APPRAISAL
              </span>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#F2F6F5] tabular-nums font-mono">
                ${distribution.algorithmicFairValue.toLocaleString()}
                <span className="text-xs sm:text-sm font-sans font-normal text-[#91A2A6] ml-2">
                  USD
                </span>
              </div>
            </div>

            {/* Delta vs Market Benchmark */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase font-semibold text-[#91A2A6] tracking-wider">
                DELTA VS MMR BENCHMARK
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`h-[24px] px-2 rounded-full text-xs font-semibold flex items-center gap-1 tabular-nums ${
                    valuation.deltaDollars >= 0
                      ? 'bg-[#B7F34A]/12 text-[#B7F34A] border border-[#B7F34A]/30'
                      : 'bg-[#FF665C]/12 text-[#FF665C] border border-[#FF665C]/30'
                  }`}
                >
                  {valuation.deltaDollars >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {valuation.deltaDollars >= 0 ? '+' : ''}$
                  {Math.abs(valuation.deltaDollars).toLocaleString()} ({valuation.deltaPercent > 0 ? '+' : ''}
                  {valuation.deltaPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Quick status chips row */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#29383D]/60 text-xs">
            <span className="h-[24px] px-2 rounded-full text-xs font-semibold flex items-center gap-1 bg-[#B7F34A]/12 text-[#B7F34A] border border-[#B7F34A]/30">
              <Zap className="w-3 h-3" />
              High Liquidity ({valuation.liquidityDays} Days Turn)
            </span>

            <span className="h-[24px] px-2 rounded-full text-xs font-semibold flex items-center gap-1 bg-[#FFB454]/12 text-[#FFB454] border border-[#FFB454]/30">
              MMR Reference: ${distribution.marketBenchmark.toLocaleString()}
            </span>

            {valuation.totalReconCost > 0 && (
              <span className="h-[24px] px-2 rounded-full text-xs font-semibold flex items-center gap-1 bg-[#FF665C]/12 text-[#FF665C] border border-[#FF665C]/30">
                Recon Wear: -${valuation.totalReconCost.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Pricing Comparison Sliders & Distribution Bar */}
        <div className="mt-2 pt-4 border-t border-[#29383D] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-[#91A2A6] uppercase tracking-[0.08em]">
              MARKET VALUE DISTRIBUTION BAND
            </span>
            <span className="text-[11px] font-mono text-[#dee3ea]">
              Floor to Retail Spread: ${(distribution.retailCeiling - distribution.wholesaleFloor).toLocaleString()}
            </span>
          </div>

          {/* Graphical Bar Track */}
          <div className="relative pt-6 pb-4">
            {/* Track Background */}
            <div className="w-full h-[6px] rounded-[3px] bg-[#121A20] relative">
              {/* Target Purchase Range Filled with Electric Cyan */}
              <div
                className="absolute top-0 bottom-0 bg-[#00C7D4] rounded-[3px]"
                style={{
                  left: `${floorPct}%`,
                  width: `${Math.max(4, retailPct - floorPct)}%`,
                }}
              />

              {/* AVE Algorithmic Marker (Pill indicator) */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#0B1015] border-2 border-[#00C7D4] shadow-md z-10 flex items-center justify-center"
                style={{ left: `${avePct}%` }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#00C7D4]" />
              </div>

              {/* Benchmark Hairline Indicator in Warm Amber (#FFB454) */}
              <div
                className="absolute -top-3 bottom-0 w-[2px] h-[18px] bg-[#FFB454] -translate-x-1/2 z-20 pointer-events-none"
                style={{ left: `${benchmarkPct}%` }}
              >
                {/* Adjacent Benchmark Numerical Label */}
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono font-semibold text-[#FFB454] whitespace-nowrap bg-[#0B1015] px-1 py-0.5 rounded border border-[#FFB454]/40">
                  MMR ${Math.round(distribution.marketBenchmark / 1000)}k
                </span>
              </div>
            </div>

            {/* Distribution Bounds Labels */}
            <div className="flex items-center justify-between text-[11px] font-mono text-[#91A2A6] mt-3">
              <div>
                <span className="text-[9px] uppercase block text-[#91A2A6]">Wholesale Floor</span>
                <span className="text-[#dee3ea] tabular-nums font-semibold">
                  ${distribution.wholesaleFloor.toLocaleString()}
                </span>
              </div>

              <div className="text-center">
                <span className="text-[9px] uppercase block text-[#00C7D4] font-semibold">AVE Fair Value</span>
                <span className="text-[#00C7D4] tabular-nums font-bold">
                  ${distribution.algorithmicFairValue.toLocaleString()}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[9px] uppercase block text-[#91A2A6]">Retail Ceiling</span>
                <span className="text-[#dee3ea] tabular-nums font-semibold">
                  ${distribution.retailCeiling.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="mt-4 pt-3 border-t border-[#29383D] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-[#91A2A6] font-mono flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#00C7D4]" />
            <span>Valuation Lock: Guaranteed 7 Days (Expires Nov 07, 2026)</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onOpenDossier}
              className="flex-1 sm:flex-initial h-[36px] px-3.5 rounded bg-[#17242A] border border-[#29383D] hover:border-[#91A2A6] text-[#F2F6F5] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#00C7D4]" />
              Export Appraisal
            </button>
            <button
              onClick={onOpenApi}
              className="flex-1 sm:flex-initial h-[36px] px-3.5 rounded bg-[#1677FF] hover:bg-[#1677FF]/90 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Push to DMS
            </button>
          </div>
        </div>
      </div>

      {/* 4 Data Metric Cards (Level 1: Graphite with Steel Border) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Liquidity Velocity */}
        <div className="bg-[#121A20] border border-[#29383D] rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-[#91A2A6] tracking-[0.08em]">
              LIQUIDITY VELOCITY
            </span>
            <Target className="w-3.5 h-3.5 text-[#00C7D4]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#F2F6F5] font-mono tabular-nums">
            {valuation.liquidityDays} Days
          </div>
          <div className="flex items-center gap-1">
            <span className="h-[20px] px-1.5 rounded-full text-[10px] font-semibold bg-[#B7F34A]/12 text-[#B7F34A] border border-[#B7F34A]/30">
              Top 8% Turnover
            </span>
          </div>
        </div>

        {/* Card 2: Dealer Net Spread */}
        <div className="bg-[#121A20] border border-[#29383D] rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-[#91A2A6] tracking-[0.08em]">
              DEALER MARGIN TARGET
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#B7F34A]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#F2F6F5] font-mono tabular-nums">
            ${valuation.dealerMarginDollars.toLocaleString()}
          </div>
          <div className="flex items-center gap-1">
            <span className="h-[20px] px-1.5 rounded-full text-[10px] font-semibold bg-[#B7F34A]/12 text-[#B7F34A] border border-[#B7F34A]/30">
              +{valuation.dealerMarginPct}% ROI Net
            </span>
          </div>
        </div>

        {/* Card 3: Auction Comp Spread */}
        <div className="bg-[#121A20] border border-[#29383D] rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-[#91A2A6] tracking-[0.08em]">
              AUCTION COMP SPREAD
            </span>
            <span className="text-xs font-mono text-[#00C7D4]">σ</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#F2F6F5] font-mono tabular-nums">
            {valuation.compSpreadSigma > 0 ? '+' : ''}
            {valuation.compSpreadSigma}σ
          </div>
          <div className="flex items-center gap-1">
            <span className="h-[20px] px-1.5 rounded-full text-[10px] font-semibold bg-[#FFB454]/12 text-[#FFB454] border border-[#FFB454]/30">
              {valuation.comps.length} Verified Sales
            </span>
          </div>
        </div>

        {/* Card 4: Reconditioning Penalty */}
        <div className="bg-[#121A20] border border-[#29383D] rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-[#91A2A6] tracking-[0.08em]">
              RECON WEAR PENALTY
            </span>
            <AlertCircle className="w-3.5 h-3.5 text-[#FF665C]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#F2F6F5] font-mono tabular-nums">
            -${valuation.totalReconCost.toLocaleString()}
          </div>
          <div className="flex items-center gap-1">
            <span
              className={`h-[20px] px-1.5 rounded-full text-[10px] font-semibold ${
                valuation.totalReconCost > 0
                  ? 'bg-[#FF665C]/12 text-[#FF665C] border border-[#FF665C]/30'
                  : 'bg-[#B7F34A]/12 text-[#B7F34A] border border-[#B7F34A]/30'
              }`}
            >
              {valuation.totalReconCost > 0 ? 'Deductions Applied' : 'Zero Recon Needed'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

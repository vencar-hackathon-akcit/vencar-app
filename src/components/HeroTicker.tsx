import React from 'react';
import { PRESET_VEHICLES } from '../data/mockVehicles';
import { TrendingUp, Car, Sparkles } from 'lucide-react';

interface HeroTickerProps {
  selectedVin: string;
  onSelectPreset: (vin: string) => void;
}

export const HeroTicker: React.FC<HeroTickerProps> = ({ selectedVin, onSelectPreset }) => {
  return (
    <div className="border-b border-[#29383D] bg-[#0B1015] py-3">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Market Telemetry Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-3">
          <div className="bg-[#121A20] border border-[#29383D] rounded px-3 py-2 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-semibold text-[#91A2A6] tracking-wider">
                MANHEIM (MMR) COMPOSITE
              </div>
              <div className="text-sm font-semibold text-[#F2F6F5] tabular-nums mt-0.5">
                204.82 pts
              </div>
            </div>
            <span className="text-[11px] font-mono font-medium text-[#B7F34A] bg-[#B7F34A]/10 border border-[#B7F34A]/25 px-1.5 py-0.5 rounded">
              +1.2% 30D
            </span>
          </div>

          <div className="bg-[#121A20] border border-[#29383D] rounded px-3 py-2 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-semibold text-[#91A2A6] tracking-wider">
                WHOLESALE SPREAD BAND
              </div>
              <div className="text-sm font-semibold text-[#F2F6F5] tabular-nums mt-0.5">
                $4,820 AVG
              </div>
            </div>
            <span className="text-[11px] font-mono font-medium text-[#00C7D4] bg-[#00C7D4]/10 border border-[#00C7D4]/25 px-1.5 py-0.5 rounded">
              STABLE
            </span>
          </div>

          <div className="bg-[#121A20] border border-[#29383D] rounded px-3 py-2 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-semibold text-[#91A2A6] tracking-wider">
                DMA NATIONAL TURN RATE
              </div>
              <div className="text-sm font-semibold text-[#F2F6F5] tabular-nums mt-0.5">
                18.4 DAYS
              </div>
            </div>
            <span className="text-[11px] font-mono font-medium text-[#B7F34A] bg-[#B7F34A]/10 border border-[#B7F34A]/25 px-1.5 py-0.5 rounded">
              FAST VELOCITY
            </span>
          </div>

          <div className="bg-[#121A20] border border-[#29383D] rounded px-3 py-2 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-semibold text-[#91A2A6] tracking-wider">
                DEALER EQUITY SPREAD
              </div>
              <div className="text-sm font-semibold text-[#F2F6F5] tabular-nums mt-0.5">
                5.82% NET
              </div>
            </div>
            <span className="text-[11px] font-mono font-medium text-[#FFB454] bg-[#FFB454]/10 border border-[#FFB454]/25 px-1.5 py-0.5 rounded">
              BENCHMARK
            </span>
          </div>
        </div>

        {/* Preset Vehicle Quick-Selectors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs text-[#91A2A6] shrink-0 font-mono pr-2">
            <Car className="w-3.5 h-3.5 text-[#00C7D4]" />
            <span>BENCHMARK PORTFOLIO:</span>
          </div>

          {Object.entries(PRESET_VEHICLES).map(([vin, preset]) => {
            const isSelected = selectedVin === vin;
            return (
              <button
                key={vin}
                onClick={() => onSelectPreset(vin)}
                className={`group flex items-center gap-2 px-2.5 py-1.5 rounded border text-xs transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#17242A] border-[#00C7D4] text-[#F2F6F5] shadow-[0_0_12px_rgba(0,199,212,0.15)]'
                    : 'bg-[#121A20] border-[#29383D] text-[#91A2A6] hover:border-[#91A2A6] hover:text-[#dee3ea]'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-[#00C7D4]' : 'bg-[#29383D] group-hover:bg-[#91A2A6]'
                  }`}
                />
                <span className="font-semibold text-[11px] text-white">
                  {preset.specs.year} {preset.specs.make} {preset.specs.model}
                </span>
                <span className="text-[10px] text-[#91A2A6] hidden sm:inline">
                  {preset.specs.trim.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

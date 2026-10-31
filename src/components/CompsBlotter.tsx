import React, { useState } from 'react';
import { MarketComp } from '../types';
import { Terminal, Filter, ArrowUpRight, ArrowDownRight, Building2, MapPin } from 'lucide-react';

interface CompsBlotterProps {
  comps: MarketComp[];
  algorithmicFairValue: number;
}

export const CompsBlotter: React.FC<CompsBlotterProps> = ({ comps, algorithmicFairValue }) => {
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const filteredComps = sourceFilter === 'all'
    ? comps
    : comps.filter((c) => c.source.toLowerCase().includes(sourceFilter.toLowerCase()));

  // Stats
  const prices = comps.map((c) => c.salePrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  return (
    <div className="bg-[#121A20] border border-[#29383D] rounded-lg p-5 sm:p-6 space-y-5">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#29383D]">
        <div>
          <span className="text-[11px] font-semibold text-[#91A2A6] uppercase tracking-[0.08em] flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#00C7D4]" />
            WHOLESALE TRANSACTION BLOTTER
          </span>
          <h3 className="text-lg font-bold tracking-tight text-white mt-0.5">
            Physical & Digital Auction Comps
          </h3>
        </div>

        {/* Source Filters */}
        <div className="flex items-center gap-1 p-1 bg-[#0B1015] border border-[#29383D] rounded overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSourceFilter('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              sourceFilter === 'all'
                ? 'bg-[#17242A] text-[#00C7D4] border border-[#00C7D4]/40 font-semibold'
                : 'text-[#91A2A6] hover:text-white'
            }`}
          >
            All Channels
          </button>
          <button
            onClick={() => setSourceFilter('Manheim')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              sourceFilter === 'Manheim'
                ? 'bg-[#17242A] text-[#00C7D4] border border-[#00C7D4]/40 font-semibold'
                : 'text-[#91A2A6] hover:text-white'
            }`}
          >
            Manheim (MMR)
          </button>
          <button
            onClick={() => setSourceFilter('ADESA')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              sourceFilter === 'ADESA'
                ? 'bg-[#17242A] text-[#00C7D4] border border-[#00C7D4]/40 font-semibold'
                : 'text-[#91A2A6] hover:text-white'
            }`}
          >
            ADESA Live
          </button>
          <button
            onClick={() => setSourceFilter('ACV')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              sourceFilter === 'ACV'
                ? 'bg-[#17242A] text-[#00C7D4] border border-[#00C7D4]/40 font-semibold'
                : 'text-[#91A2A6] hover:text-white'
            }`}
          >
            ACV Auctions
          </button>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-[#0B1015] border border-[#29383D] rounded">
          <span className="text-[10px] uppercase font-semibold text-[#91A2A6] block">
            Wholesale Median
          </span>
          <span className="text-base font-bold text-white font-mono tabular-nums">
            ${avgPrice.toLocaleString()}
          </span>
        </div>
        <div className="p-3 bg-[#0B1015] border border-[#29383D] rounded">
          <span className="text-[10px] uppercase font-semibold text-[#91A2A6] block">
            Lowest Cleared Hammer
          </span>
          <span className="text-base font-bold text-[#FF665C] font-mono tabular-nums">
            ${minPrice.toLocaleString()}
          </span>
        </div>
        <div className="p-3 bg-[#0B1015] border border-[#29383D] rounded">
          <span className="text-[10px] uppercase font-semibold text-[#91A2A6] block">
            Highest Premium Lot
          </span>
          <span className="text-base font-bold text-[#B7F34A] font-mono tabular-nums">
            ${maxPrice.toLocaleString()}
          </span>
        </div>
        <div className="p-3 bg-[#0B1015] border border-[#29383D] rounded">
          <span className="text-[10px] uppercase font-semibold text-[#91A2A6] block">
            Current AVE Variance
          </span>
          <span className="text-base font-bold text-[#00C7D4] font-mono tabular-nums">
            ${(algorithmicFairValue - avgPrice > 0 ? '+' : '')}$
            {(algorithmicFairValue - avgPrice).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Comps Table */}
      <div className="overflow-x-auto border border-[#29383D] rounded-md">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-[#0B1015] border-b border-[#29383D] text-[#91A2A6] uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Exchange Source</th>
              <th className="py-2.5 px-3">VIN Identifier</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3 text-right">Odometer</th>
              <th className="py-2.5 px-3 text-center">AutoGrade</th>
              <th className="py-2.5 px-3">Radius</th>
              <th className="py-2.5 px-3 text-right">Sold Hammer</th>
              <th className="py-2.5 px-3 text-right">Spread vs AVE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#29383D]/60 text-white">
            {filteredComps.map((comp) => {
              const delta = comp.salePrice - algorithmicFairValue;
              const isHigher = delta > 0;
              return (
                <tr
                  key={comp.id}
                  className="hover:bg-[#17242A]/80 transition-colors"
                >
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-sans font-medium text-xs">
                      <Building2 className="w-3 h-3 text-[#91A2A6]" />
                      <span>{comp.source}</span>
                    </div>
                  </td>

                  <td className="py-2.5 px-3 text-[#dee3ea] whitespace-nowrap">
                    {comp.vinSnippet}
                  </td>

                  <td className="py-2.5 px-3 text-[#91A2A6] whitespace-nowrap">
                    {comp.saleDate}
                  </td>

                  <td className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">
                    {comp.mileage.toLocaleString()} mi
                  </td>

                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                        comp.grade >= 4.5
                          ? 'bg-[#B7F34A]/10 text-[#B7F34A] border border-[#B7F34A]/30'
                          : comp.grade >= 3.8
                          ? 'bg-[#00C7D4]/10 text-[#00C7D4] border border-[#00C7D4]/30'
                          : 'bg-[#FFB454]/10 text-[#FFB454] border border-[#FFB454]/30'
                      }`}
                    >
                      {comp.grade.toFixed(1)}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-[#91A2A6] whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#91A2A6]" />
                      <span>{comp.distanceMiles} mi</span>
                    </div>
                  </td>

                  <td className="py-2.5 px-3 text-right font-bold tabular-nums whitespace-nowrap">
                    ${comp.salePrice.toLocaleString()}
                  </td>

                  <td className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                        isHigher ? 'text-[#B7F34A]' : 'text-[#FF665C]'
                      }`}
                    >
                      {isHigher ? '+' : ''}${delta.toLocaleString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ResidualPoint } from '../types';
import { TrendingDown, Calendar, ShieldAlert, Check } from 'lucide-react';

interface ResidualCurveProps {
  residuals: ResidualPoint[];
  initialPrice: number;
}

export const ResidualCurve: React.FC<ResidualCurveProps> = ({ residuals, initialPrice }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(12);

  // SVG Chart Geometry
  const width = 800;
  const height = 240;
  const paddingX = 50;
  const paddingY = 30;

  const minVal = Math.round(residuals[residuals.length - 1].lowerConfidence * 0.95);
  const maxVal = Math.round(initialPrice * 1.05);

  const getX = (idx: number) => paddingX + (idx / (residuals.length - 1)) * (width - paddingX * 2);
  const getY = (val: number) => height - paddingY - ((val - minVal) / (maxVal - minVal)) * (height - paddingY * 2);

  // Path for projected median line
  const medianPoints = residuals.map((r, i) => `${getX(i)},${getY(r.projectedValue)}`);
  const medianPath = `M ${medianPoints.join(' L ')}`;

  // Path for confidence envelope area (upper forward, lower backward)
  const upperPoints = residuals.map((r, i) => `${getX(i)},${getY(r.upperConfidence)}`);
  const lowerPoints = [...residuals].reverse().map((r, i) => {
    const originalIdx = residuals.length - 1 - i;
    return `${getX(originalIdx)},${getY(r.lowerConfidence)}`;
  });
  const envelopePath = `M ${upperPoints.join(' L ')} L ${lowerPoints.join(' L ')} Z`;

  const activePoint = residuals.find((r) => r.month === selectedMonth) || residuals[2];

  return (
    <div className="bg-[#121A20] border border-[#29383D] rounded-lg p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#29383D]">
        <div>
          <span className="text-[11px] font-semibold text-[#91A2A6] uppercase tracking-[0.08em] flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-[#00C7D4]" />
            MACRO DEPRECIATION ENVELOPE
          </span>
          <h3 className="text-lg font-bold tracking-tight text-white mt-0.5">
            36-Month Predictive Residual Trajectory
          </h3>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[#91A2A6]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#00C7D4]" />
            <span>Deterministic Projection</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-[#00C7D4]/15 border border-[#00C7D4]/30" />
            <span>±σ Confidence Interval</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="bg-[#0B1015] border border-[#29383D] rounded-md p-3 relative overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible font-mono text-[10px]"
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingY + (1 - pct) * (height - paddingY * 2);
            const val = Math.round(minVal + pct * (maxVal - minVal));
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#29383D"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />
                <text x={paddingX - 6} y={y + 3} fill="#91A2A6" textAnchor="end">
                  ${Math.round(val / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Confidence Envelope Area */}
          <path d={envelopePath} fill="#00C7D4" fillOpacity="0.08" />

          {/* Median Projection Curve */}
          <path
            d={medianPath}
            fill="none"
            stroke="#00C7D4"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Data Points */}
          {residuals.map((r, i) => {
            const cx = getX(i);
            const cy = getY(r.projectedValue);
            const isSelected = r.month === selectedMonth;

            return (
              <g
                key={r.month}
                className="cursor-pointer"
                onClick={() => setSelectedMonth(r.month)}
              >
                {/* Vertical tick line */}
                <line
                  x1={cx}
                  y1={getY(r.upperConfidence)}
                  x2={cx}
                  y2={getY(r.lowerConfidence)}
                  stroke="#29383D"
                  strokeWidth="1.5"
                />

                {/* Point circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? '#00C7D4' : '#0B1015'}
                  stroke="#00C7D4"
                  strokeWidth={isSelected ? 3 : 2}
                />

                {/* X-axis label */}
                <text
                  x={cx}
                  y={height - 8}
                  fill={isSelected ? '#FFFFFF' : '#91A2A6'}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  textAnchor="middle"
                >
                  {r.monthLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Point Inspection Card */}
      <div className="bg-[#17242A] border border-[#29383D] rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold text-[#00C7D4] bg-[#00C7D4]/10 border border-[#00C7D4]/30 px-2 py-0.5 rounded">
              TIME HORIZON: {activePoint.monthLabel}
            </span>
            <span className="text-sm font-semibold text-white">
              Projected Fair Value: ${activePoint.projectedValue.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-[#91A2A6] font-mono">
            Confidence Band: ${activePoint.lowerConfidence.toLocaleString()} (P10) — ${activePoint.upperConfidence.toLocaleString()} (P90)
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-[10px] uppercase text-[#91A2A6] block">Net Retention</span>
            <span className="text-base font-bold text-white tabular-nums">
              {Math.round((activePoint.projectedValue / initialPrice) * 100)}%
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase text-[#91A2A6] block">Depreciation Delta</span>
            <span className="text-base font-bold text-[#FF665C] tabular-nums">
              {activePoint.depreciationPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Milestone Cards Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
        {residuals.slice(1, 5).map((r) => (
          <button
            key={r.month}
            onClick={() => setSelectedMonth(r.month)}
            className={`p-3 rounded border text-left transition-colors cursor-pointer ${
              selectedMonth === r.month
                ? 'bg-[#17242A] border-[#00C7D4] text-white'
                : 'bg-[#0B1015] border-[#29383D] text-[#91A2A6] hover:border-[#91A2A6]'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
              <span>{r.monthLabel}</span>
              <span className="text-[#FF665C]">{r.depreciationPct}%</span>
            </div>
            <div className="text-sm font-bold font-mono text-white tabular-nums">
              ${r.projectedValue.toLocaleString()}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { VehicleInput, VehicleSpecs, ReconditioningCost } from '../types';
import { PRESET_VEHICLES, DMA_REGIONS } from '../data/mockVehicles';
import { Search, Gauge, Shield, MapPin, Wrench, Check, Sliders, ChevronDown } from 'lucide-react';

interface ValuationFormProps {
  input: VehicleInput;
  specs: VehicleSpecs;
  onInputChange: (updates: Partial<VehicleInput>) => void;
  onSpecsChange: (specs: VehicleSpecs) => void;
  onExecute: () => void;
  onReset: () => void;
  isCalculating: boolean;
}

export const ValuationForm: React.FC<ValuationFormProps> = ({
  input,
  specs,
  onInputChange,
  onSpecsChange,
  onExecute,
  onReset,
  isCalculating,
}) => {
  const [lookupMode, setLookupMode] = useState<'vin' | 'plate' | 'manual'>('vin');
  const [plateState, setPlateState] = useState(input.state || 'CA');
  const [plateNumber, setPlateNumber] = useState(input.plate || '9XYZ123');

  const preset = PRESET_VEHICLES[specs.vin] || Object.values(PRESET_VEHICLES)[0];

  const handleToggleOption = (optionId: string) => {
    const isSelected = input.selectedOptions.includes(optionId);
    const updated = isSelected
      ? input.selectedOptions.filter((id) => id !== optionId)
      : [...input.selectedOptions, optionId];
    onInputChange({ selectedOptions: updated });
  };

  const handleToggleRecon = (reconId: string) => {
    const updated = input.reconditioningItems.map((item) => {
      if (item.id === reconId) {
        return { ...item, active: !item.active };
      }
      return item;
    });
    onInputChange({ reconditioningItems: updated });
  };

  const handleGradeChange = (gradeValue: number) => {
    let label: VehicleInput['conditionLabel'] = 'Clean';
    if (gradeValue < 2.5) label = 'Rough';
    else if (gradeValue < 3.8) label = 'Average';
    else if (gradeValue < 4.8) label = 'Clean';
    else label = 'Extra Clean';

    onInputChange({
      conditionGrade: gradeValue,
      conditionLabel: label,
    });
  };

  // Expected mileage comparison
  const ageYears = Math.max(0.5, 2026 - specs.year);
  const expectedMiles = Math.round(ageYears * 12500);
  const mileageDelta = expectedMiles - input.mileage;

  return (
    <div className="bg-[#121A20] border border-[#29383D] rounded-lg p-5 sm:p-6 space-y-6">
      {/* Module Title & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#29383D]">
        <div>
          <span className="text-[11px] font-semibold text-[#91A2A6] uppercase tracking-[0.08em] block">
            VEHICLE ACQUISITION PARAMETERS
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
            Asset Ingestion & Spec Matrix
          </h2>
        </div>

        {/* Input Method Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#0B1015] border border-[#29383D] rounded">
          <button
            onClick={() => setLookupMode('vin')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              lookupMode === 'vin'
                ? 'bg-[#17242A] text-[#00C7D4] border border-[#00C7D4]/40 font-semibold'
                : 'text-[#91A2A6] hover:text-white'
            }`}
          >
            VIN Decryption
          </button>
          <button
            onClick={() => setLookupMode('plate')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              lookupMode === 'plate'
                ? 'bg-[#17242A] text-[#00C7D4] border border-[#00C7D4]/40 font-semibold'
                : 'text-[#91A2A6] hover:text-white'
            }`}
          >
            US Plate / DMV
          </button>
          <button
            onClick={() => setLookupMode('manual')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              lookupMode === 'manual'
                ? 'bg-[#17242A] text-[#00C7D4] border border-[#00C7D4]/40 font-semibold'
                : 'text-[#91A2A6] hover:text-white'
            }`}
          >
            Manual Specs
          </button>
        </div>
      </div>

      {/* Active Vehicle Decoded Specs Card */}
      <div className="bg-[#17242A] border border-[#29383D] rounded-md p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#00C7D4] bg-[#00C7D4]/10 border border-[#00C7D4]/30 px-2 py-0.5 rounded">
              DECODED ASSET
            </span>
            <span className="text-sm font-semibold text-white">
              {specs.year} {specs.make} {specs.model}
            </span>
            <span className="text-xs text-[#91A2A6]">· {specs.trim}</span>
          </div>
          <p className="text-xs text-[#91A2A6] font-mono">
            {specs.engine} · {specs.drivetrain} · {specs.transmission}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono border-t md:border-t-0 border-[#29383D] pt-2 md:pt-0">
          <div>
            <span className="text-[10px] uppercase text-[#91A2A6] block">OEM MSRP:</span>
            <span className="text-white font-semibold tabular-nums">
              ${specs.msrpOriginal.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-[#91A2A6] block">EXT / INT:</span>
            <span className="text-[#dee3ea]">{specs.exteriorColor.split(' ')[0]}</span>
          </div>
        </div>
      </div>

      {/* Primary Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* VIN / Plate Input */}
        <div>
          <label className="block text-[11px] font-semibold text-[#91A2A6] uppercase tracking-[0.08em] mb-1.5">
            {lookupMode === 'vin'
              ? 'Vehicle Identification Number (17-digit VIN)'
              : lookupMode === 'plate'
              ? 'US License Plate & Issuing State'
              : 'Model Identifier / Trim'}
          </label>
          <div className="relative">
            {lookupMode === 'vin' ? (
              <input
                type="text"
                value={input.vin}
                onChange={(e) => onInputChange({ vin: e.target.value.toUpperCase() })}
                placeholder="e.g. WP0AB2A97PS248191"
                className="w-full h-[44px] px-3.5 bg-[#121A20] border border-[#29383D] rounded text-[15px] font-mono text-[#F2F6F5] placeholder-[#91A2A6] focus:border-[#00C7D4] focus:outline-none transition-colors"
                maxLength={17}
              />
            ) : lookupMode === 'plate' ? (
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => {
                    setPlateNumber(e.target.value.toUpperCase());
                    onInputChange({ plate: e.target.value.toUpperCase() });
                  }}
                  placeholder="PLATE#"
                  className="col-span-2 h-[44px] px-3.5 bg-[#121A20] border border-[#29383D] rounded text-[15px] font-mono text-[#F2F6F5] placeholder-[#91A2A6] focus:border-[#00C7D4] focus:outline-none transition-colors"
                />
                <select
                  value={plateState}
                  onChange={(e) => {
                    setPlateState(e.target.value);
                    onInputChange({ state: e.target.value });
                  }}
                  className="h-[44px] px-3 bg-[#121A20] border border-[#29383D] rounded text-sm text-[#F2F6F5] focus:border-[#00C7D4] focus:outline-none transition-colors"
                >
                  <option value="CA">CA - California</option>
                  <option value="TX">TX - Texas</option>
                  <option value="FL">FL - Florida</option>
                  <option value="NY">NY - New York</option>
                  <option value="IL">IL - Illinois</option>
                  <option value="GA">GA - Georgia</option>
                </select>
              </div>
            ) : (
              <input
                type="text"
                value={`${specs.make} ${specs.model} ${specs.trim}`}
                readOnly
                className="w-full h-[44px] px-3.5 bg-[#121A20] border border-[#29383D] rounded text-[15px] text-[#F2F6F5] focus:border-[#00C7D4] focus:outline-none"
              />
            )}
            <div className="absolute right-3 top-3 pointer-events-none text-[#91A2A6]">
              <Search className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Odometer Mileage */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-[#91A2A6] uppercase tracking-[0.08em]">
              Odometer Reading (Miles)
            </label>
            <span
              className={`text-[11px] font-mono ${
                mileageDelta >= 0 ? 'text-[#B7F34A]' : 'text-[#FF665C]'
              }`}
            >
              {mileageDelta >= 0 ? `-${mileageDelta.toLocaleString()} mi vs Nat'l Avg` : `+${Math.abs(mileageDelta).toLocaleString()} mi above Avg`}
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              step="500"
              value={input.mileage}
              onChange={(e) => onInputChange({ mileage: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full h-[44px] px-3.5 bg-[#121A20] border border-[#29383D] rounded text-[15px] font-mono text-[#F2F6F5] placeholder-[#91A2A6] focus:border-[#00C7D4] focus:outline-none transition-colors tabular-nums"
            />
            <div className="absolute right-3.5 top-3.5 text-xs font-mono text-[#91A2A6] pointer-events-none">
              MILES
            </div>
          </div>
        </div>
      </div>

      {/* AutoGrade Condition Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-[#91A2A6] uppercase tracking-[0.08em] flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#00C7D4]" />
            Inspection Physical Grade (AutoGrade 1.0 - 5.0)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#91A2A6]">
              Grade: <strong className="text-white">{input.conditionGrade.toFixed(1)}</strong> / 5.0
            </span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                input.conditionGrade >= 4.5
                  ? 'bg-[#B7F34A]/10 text-[#B7F34A] border border-[#B7F34A]/30'
                  : input.conditionGrade >= 3.8
                  ? 'bg-[#00C7D4]/10 text-[#00C7D4] border border-[#00C7D4]/30'
                  : input.conditionGrade >= 2.8
                  ? 'bg-[#FFB454]/10 text-[#FFB454] border border-[#FFB454]/30'
                  : 'bg-[#FF665C]/10 text-[#FF665C] border border-[#FF665C]/30'
              }`}
            >
              {input.conditionLabel}
            </span>
          </div>
        </div>

        {/* Quick Grade Selector Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { grade: 2.2, label: 'Rough (2.2)' },
            { grade: 3.5, label: 'Average (3.5)' },
            { grade: 4.4, label: 'Clean (4.4)' },
            { grade: 4.9, label: 'Extra Clean (4.9)' },
          ].map((item) => {
            const isCurrent = Math.abs(input.conditionGrade - item.grade) < 0.4;
            return (
              <button
                key={item.grade}
                type="button"
                onClick={() => handleGradeChange(item.grade)}
                className={`h-[40px] px-2 rounded text-xs font-medium border transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-[#17242A] border-[#00C7D4] text-[#00C7D4] font-semibold'
                    : 'bg-[#121A20] border-[#29383D] text-[#91A2A6] hover:border-[#91A2A6] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Regional DMA & Title Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Regional Market DMA */}
        <div>
          <label className="block text-[11px] font-semibold text-[#91A2A6] uppercase tracking-[0.08em] mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#00C7D4]" />
            Geographic Liquidity Zone (DMA Market)
          </label>
          <div className="relative">
            <select
              value={input.marketRegion}
              onChange={(e) => onInputChange({ marketRegion: e.target.value })}
              className="w-full h-[44px] px-3.5 bg-[#121A20] border border-[#29383D] rounded text-sm text-[#F2F6F5] focus:border-[#00C7D4] focus:outline-none appearance-none cursor-pointer"
            >
              {DMA_REGIONS.map((dma) => (
                <option key={dma.id} value={dma.name} className="bg-[#121A20] text-white">
                  {dma.name} ({dma.liquidityIndex}x Liquidity · {dma.avgDaysOnMarket}d Turn)
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#91A2A6] absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Title History */}
        <div>
          <label className="block text-[11px] font-semibold text-[#91A2A6] uppercase tracking-[0.08em] mb-1.5 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#00C7D4]" />
            Title & NMVTIS Registration Status
          </label>
          <div className="relative">
            <select
              value={input.titleStatus}
              onChange={(e) =>
                onInputChange({
                  titleStatus: e.target.value as VehicleInput['titleStatus'],
                })
              }
              className="w-full h-[44px] px-3.5 bg-[#121A20] border border-[#29383D] rounded text-sm text-[#F2F6F5] focus:border-[#00C7D4] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="Clean" className="bg-[#121A20] text-white">
                Clean Title (Full Market Eligibility)
              </option>
              <option value="Prior Salvage" className="bg-[#121A20] text-[#FF665C]">
                Prior Salvage / Rebuilt (-35% Market Deduction)
              </option>
              <option value="Lemon Law" className="bg-[#121A20] text-[#FF665C]">
                Manufacturer Buyback / Lemon (-25% Deduction)
              </option>
              <option value="Lien Active" className="bg-[#121A20] text-[#FFB454]">
                Active Financial Lien (Escrow Settlement Required)
              </option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#91A2A6] absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Factory Options Checklist */}
      {preset && preset.availableOptions.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#29383D]">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-[#91A2A6] uppercase tracking-[0.08em]">
              High-Value Factory Options & Equipment
            </label>
            <span className="text-[11px] font-mono text-[#00C7D4]">
              {input.selectedOptions.length} of {preset.availableOptions.length} verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {preset.availableOptions.map((opt) => {
              const checked = input.selectedOptions.includes(opt.id);
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => handleToggleOption(opt.id)}
                  className={`flex items-center justify-between p-2.5 rounded border text-left transition-colors cursor-pointer ${
                    checked
                      ? 'bg-[#17242A] border-[#00C7D4]/50 text-white'
                      : 'bg-[#121A20] border-[#29383D] text-[#91A2A6] hover:border-[#91A2A6]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-sm flex items-center justify-center border ${
                        checked
                          ? 'bg-[#00C7D4] border-[#00C7D4] text-[#0B1015]'
                          : 'border-[#29383D] bg-[#0B1015]'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-medium truncate max-w-[200px]">{opt.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#B7F34A] shrink-0 tabular-nums">
                    +${Math.round(opt.value * 0.65).toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Pre-Sale Reconditioning Deductions */}
      <div className="space-y-2 pt-2 border-t border-[#29383D]">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-[#91A2A6] uppercase tracking-[0.08em] flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-[#FF665C]" />
            Inspection Deductions & Reconditioning Wear Items
          </label>
          <span className="text-[11px] font-mono text-[#FF665C]">
            Total Deduction: -$
            {input.reconditioningItems
              .filter((r) => r.active)
              .reduce((sum, r) => sum + r.cost, 0)
              .toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {input.reconditioningItems.map((item) => {
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => handleToggleRecon(item.id)}
                className={`flex items-center justify-between p-2.5 rounded border text-left transition-colors cursor-pointer ${
                  item.active
                    ? 'bg-[#17242A] border-[#FF665C]/40 text-white'
                    : 'bg-[#121A20] border-[#29383D] text-[#91A2A6] hover:border-[#91A2A6]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-sm flex items-center justify-center border ${
                      item.active
                        ? 'bg-[#FF665C] border-[#FF665C] text-white'
                        : 'border-[#29383D] bg-[#0B1015]'
                    }`}
                  >
                    {item.active && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-medium truncate max-w-[200px]">{item.label}</span>
                </div>
                <span className="text-[11px] font-mono text-[#FF665C] shrink-0 tabular-nums">
                  -${item.cost.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary & Secondary Action Triggers */}
      <div className="pt-3 border-t border-[#29383D] flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={onExecute}
          disabled={isCalculating}
          className="w-full sm:flex-1 h-[44px] bg-[#00C7D4] hover:bg-[#22DDE9] text-[#0B1015] font-bold text-sm tracking-wide rounded transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-75"
        >
          {isCalculating ? (
            <>
              <div className="w-4 h-4 border-2 border-[#0B1015] border-t-transparent rounded-full animate-spin" />
              <span>RECALCULATING DETERMINISTIC MATRIX...</span>
            </>
          ) : (
            <>
              <Sliders className="w-4 h-4" />
              <span>EXECUTE VALUATION MATRIX</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto h-[44px] px-5 bg-[#17242A] border border-[#29383D] hover:border-[#91A2A6] text-[#F2F6F5] font-medium text-xs tracking-wide rounded transition-colors cursor-pointer flex items-center justify-center"
        >
          RESET BASELINE
        </button>
      </div>
    </div>
  );
};

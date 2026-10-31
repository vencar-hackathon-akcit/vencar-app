import React from 'react';
import { CalculatedValuation } from '../utils/valuationMath';
import { VehicleSpecs, VehicleInput } from '../types';
import { X, Printer, ShieldCheck, Check, Cpu } from 'lucide-react';

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  valuation: CalculatedValuation;
  specs: VehicleSpecs;
  input: VehicleInput;
}

export const DossierModal: React.FC<DossierModalProps> = ({
  isOpen,
  onClose,
  valuation,
  specs,
  input,
}) => {
  if (!isOpen) return null;

  const cryptoHash = `AVE-SHA256:7f89b4${specs.vin.substring(0, 6)}c32a891048f0e914`;
  const reportDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B1015]/80 backdrop-blur-[16px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container: Level 3 Elevation */}
      <div className="relative bg-[#121A20] border border-[#29383D] rounded-lg max-w-[850px] w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 z-10 shadow-2xl text-[#dee3ea] space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#29383D]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#17242A] border border-[#00C7D4]/40 flex items-center justify-center text-[#00C7D4]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.1em] text-[#00C7D4] block">
                OFFICIAL APPRAISAL & ACQUISITION DOSSIER
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                AVE Deterministic Valuation Certificate
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="h-8 px-3 rounded bg-[#17242A] border border-[#29383D] hover:border-[#91A2A6] text-[#F2F6F5] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#00C7D4]" />
              Print Dossier
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded bg-[#17242A] border border-[#29383D] hover:border-[#91A2A6] text-[#91A2A6] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Metadata Banner */}
        <div className="bg-[#0B1015] border border-[#29383D] rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div>
            <span className="text-[#91A2A6] block text-[10px] uppercase">
              Cryptographic Audit Hash
            </span>
            <span className="text-[#00C7D4] font-semibold break-all">{cryptoHash}</span>
          </div>
          <div className="text-right sm:text-right">
            <span className="text-[#91A2A6] block text-[10px] uppercase">
              Certification Timestamp
            </span>
            <span className="text-white">{reportDate} · 09:31:57 EST</span>
          </div>
        </div>

        {/* Vehicle Decoded Summary */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-[#91A2A6]">
            1. Inspected Vehicle Identification
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#17242A] border border-[#29383D] rounded-md p-4 text-xs font-mono">
            <div>
              <span className="text-[#91A2A6] text-[10px] uppercase block">Year / Make</span>
              <span className="text-white font-semibold">
                {specs.year} {specs.make}
              </span>
            </div>
            <div>
              <span className="text-[#91A2A6] text-[10px] uppercase block">Model / Trim</span>
              <span className="text-white font-semibold">
                {specs.model} {specs.trim}
              </span>
            </div>
            <div>
              <span className="text-[#91A2A6] text-[10px] uppercase block">VIN</span>
              <span className="text-[#00C7D4] font-bold">{specs.vin}</span>
            </div>
            <div>
              <span className="text-[#91A2A6] text-[10px] uppercase block">Odometer</span>
              <span className="text-white font-semibold tabular-nums">
                {input.mileage.toLocaleString()} mi
              </span>
            </div>
            <div>
              <span className="text-[#91A2A6] text-[10px] uppercase block">Drivetrain</span>
              <span className="text-white">{specs.drivetrain}</span>
            </div>
            <div>
              <span className="text-[#91A2A6] text-[10px] uppercase block">Engine</span>
              <span className="text-white">{specs.engine}</span>
            </div>
            <div>
              <span className="text-[#91A2A6] text-[10px] uppercase block">AutoGrade</span>
              <span className="text-[#B7F34A] font-bold">
                {input.conditionGrade.toFixed(1)} ({input.conditionLabel})
              </span>
            </div>
            <div>
              <span className="text-[#91A2A6] text-[10px] uppercase block">Original MSRP</span>
              <span className="text-white font-semibold tabular-nums">
                ${specs.msrpOriginal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Valuation Summary */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-[#91A2A6]">
            2. Deterministic Valuation Results & Guarantee
          </h3>
          <div className="bg-[#0B1015] border border-[#00C7D4]/40 rounded-md p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-mono font-semibold text-[#91A2A6] block">
                  AVE Institutional Purchase Quote
                </span>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-white tabular-nums">
                  ${valuation.distribution.algorithmicFairValue.toLocaleString()} USD
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-[24px] px-2 rounded-full text-xs font-semibold bg-[#B7F34A]/12 text-[#B7F34A] border border-[#B7F34A]/30">
                  <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                  {valuation.confidenceScore}% Confidence Index
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#29383D] text-xs font-mono">
              <div>
                <span className="text-[#91A2A6] text-[10px] uppercase block">Wholesale Floor</span>
                <span className="text-white font-semibold tabular-nums">
                  ${valuation.distribution.wholesaleFloor.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[#91A2A6] text-[10px] uppercase block">MMR Benchmark</span>
                <span className="text-[#FFB454] font-semibold tabular-nums">
                  ${valuation.distribution.marketBenchmark.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[#91A2A6] text-[10px] uppercase block">Retail Target</span>
                <span className="text-white font-semibold tabular-nums">
                  ${valuation.distribution.retailCeiling.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reconditioning Audit Items */}
        {valuation.totalReconCost > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-[#91A2A6]">
              3. Pre-Sale Inspection & Reconditioning Itemization
            </h3>
            <div className="bg-[#17242A] border border-[#29383D] rounded-md p-3 divide-y divide-[#29383D]/60 text-xs font-mono">
              {input.reconditioningItems
                .filter((r) => r.active)
                .map((r) => (
                  <div key={r.id} className="py-2 flex items-center justify-between">
                    <span className="text-[#dee3ea]">{r.label}</span>
                    <span className="text-[#FF665C] font-semibold tabular-nums">
                      -${r.cost.toLocaleString()}
                    </span>
                  </div>
                ))}
              <div className="pt-2 flex items-center justify-between font-bold text-white">
                <span>Total Reconditioning Deductions</span>
                <span className="text-[#FF665C]">-${valuation.totalReconCost.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Signature & Legal Guarantee block */}
        <div className="pt-4 border-t border-[#29383D] grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono">
          <div className="space-y-2">
            <span className="text-[#91A2A6] text-[10px] uppercase block">
              Dealership Appraiser Verification
            </span>
            <div className="h-10 border-b border-[#29383D] flex items-end pb-1 text-[#00C7D4]">
              AVE_DMS_SYSTEM_SIGNED_OFF // EMP#8492
            </div>
            <p className="text-[10px] text-[#91A2A6]">
              This valuation is valid for 7 calendar days from timestamp and subject to physical VIN verification.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[#91A2A6] text-[10px] uppercase block">
              Inventory Director Approval
            </span>
            <div className="h-10 border-b border-[#29383D] flex items-end pb-1 text-[#dee3ea]">
              [ SIGNED DIGITALLY VIA DMS TOKEN ]
            </div>
            <p className="text-[10px] text-[#91A2A6]">
              Floor plan advance guaranteed upon title bill of sale execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

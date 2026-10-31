import React, { useState } from 'react';
import { VehicleSpecs, VehicleInput } from '../types';
import { CalculatedValuation } from '../utils/valuationMath';
import { X, Copy, Check, Terminal, Database, CheckCircle2 } from 'lucide-react';

interface DmsApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  specs: VehicleSpecs;
  input: VehicleInput;
  valuation: CalculatedValuation;
}

export const DmsApiModal: React.FC<DmsApiModalProps> = ({
  isOpen,
  onClose,
  specs,
  input,
  valuation,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const samplePayload = {
    request: {
      action: 'CALCULATE_VALUATION',
      vin: specs.vin,
      mileage: input.mileage,
      conditionGrade: input.conditionGrade,
      marketRegion: input.marketRegion,
      titleStatus: input.titleStatus,
      reconditioningDeduction: valuation.totalReconCost,
      optionsCount: input.selectedOptions.length,
    },
    response: {
      status: 'SUCCESS',
      engineVersion: '4.91-DETERMINISTIC',
      timestamp: new Date().toISOString(),
      fairMarketValueUsd: valuation.distribution.algorithmicFairValue,
      wholesaleFloorUsd: valuation.distribution.wholesaleFloor,
      retailCeilingUsd: valuation.distribution.retailCeiling,
      mmrBenchmarkUsd: valuation.distribution.marketBenchmark,
      turnoverDaysProjected: valuation.liquidityDays,
      confidenceScore: valuation.confidenceScore,
      dealerNetMargin: valuation.dealerMarginDollars,
      compSampleSize: valuation.comps.length,
    },
  };

  const jsonString = JSON.stringify(samplePayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B1015]/80 backdrop-blur-[16px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container: Level 3 Elevation */}
      <div className="relative bg-[#121A20] border border-[#29383D] rounded-lg max-w-[760px] w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 z-10 shadow-2xl text-[#dee3ea] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#29383D]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#1677FF]/20 border border-[#1677FF]/40 flex items-center justify-center text-[#1677FF]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.1em] text-[#1677FF] block">
                ENTERPRISE DMS INTEGRATION
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                REST API & Real-time Webhook Pipeline
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded bg-[#17242A] border border-[#29383D] hover:border-[#91A2A6] text-[#91A2A6] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* DMS Platform Connector Status */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-[#91A2A6] uppercase tracking-[0.08em] block">
            Connected Inventory Platforms
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            {[
              { name: 'vAuto Provision', status: 'Live Sync', active: true },
              { name: 'CDK Global Drive', status: 'Connected', active: true },
              { name: 'Reynolds & Reynolds', status: 'Ready', active: true },
              { name: 'DealerSocket CRM', status: 'Active Hook', active: true },
            ].map((conn, idx) => (
              <div
                key={idx}
                className="bg-[#0B1015] border border-[#29383D] rounded p-2.5 flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-white block text-[11px]">{conn.name}</span>
                  <span className="text-[10px] text-[#B7F34A] flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    {conn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* cURL Snippet */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-[#91A2A6] uppercase tracking-[0.08em] block flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#00C7D4]" />
            Direct Terminal cURL Request
          </span>
          <div className="bg-[#0B1015] border border-[#29383D] rounded-md p-3 font-mono text-xs text-[#00C7D4] overflow-x-auto">
            curl -X POST https://api.autonomousvaluation.internal/v4/quote \<br />
            &nbsp;&nbsp;-H "Authorization: Bearer ave_sec_849201948192" \<br />
            &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
            &nbsp;&nbsp;-d '{`{"vin": "${specs.vin}", "odometer": ${input.mileage}}`}'
          </div>
        </div>

        {/* JSON Payload Inspection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#91A2A6] uppercase tracking-[0.08em]">
              Normalized Valuation JSON Object
            </span>
            <button
              onClick={handleCopy}
              className="text-xs font-mono text-[#00C7D4] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-[#B7F34A]" />
                  <span className="text-[#B7F34A]">Copied Payload</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Payload</span>
                </>
              )}
            </button>
          </div>

          <pre className="bg-[#0B1015] border border-[#29383D] rounded-md p-4 text-[11px] font-mono text-[#dee3ea] overflow-x-auto max-h-[220px]">
            {jsonString}
          </pre>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { SAMPLE_FLEET_BATCH } from '../data/mockVehicles';
import { FleetVehicle } from '../types';
import { Database, TrendingUp, Download, Upload, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface FleetBatchValuationProps {
  onSelectVehicleVin: (vin: string) => void;
}

export const FleetBatchValuation: React.FC<FleetBatchValuationProps> = ({ onSelectVehicleVin }) => {
  const [fleetList, setFleetList] = useState<FleetVehicle[]>(SAMPLE_FLEET_BATCH);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Compute portfolio totals
  const totalBook = fleetList.reduce((sum, v) => sum + v.bookValue, 0);
  const totalAVE = fleetList.reduce((sum, v) => sum + v.aveFairValue, 0);
  const netDelta = totalAVE - totalBook;
  const netDeltaPct = Number(((netDelta / totalBook) * 100).toFixed(2));
  const avgTurn = Math.round(fleetList.reduce((sum, v) => sum + v.turnoverDays, 0) / fleetList.length);

  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      // Create CSV content and download
      const headers = 'ID,VIN,Year,Make,Model,Trim,Mileage,AutoGrade,BookValue,AVE_FairValue,Delta,TurnDays,Risk\n';
      const rows = fleetList
        .map(
          (v) =>
            `${v.id},${v.vin},${v.year},${v.make},${v.model},"${v.trim}",${v.mileage},${v.grade},${v.bookValue},${v.aveFairValue},${v.aveFairValue - v.bookValue},${v.turnoverDays},${v.riskRating}`
        )
        .join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AVE_Fleet_Valuation_Portfolio_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 400);
  };

  return (
    <div className="bg-[#121A20] border border-[#29383D] rounded-lg p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#29383D]">
        <div>
          <span className="text-[11px] font-semibold text-[#91A2A6] uppercase tracking-[0.08em] flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#00C7D4]" />
            INSTITUTIONAL BATCH INGESTION
          </span>
          <h3 className="text-lg font-bold tracking-tight text-white mt-0.5">
            Dealership Portfolio Valuation & Risk Matrix
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="h-[36px] px-3.5 rounded bg-[#17242A] border border-[#29383D] hover:border-[#91A2A6] text-[#F2F6F5] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#00C7D4]" />
            <span>{isExporting ? 'Generating CSV...' : 'Export Portfolio CSV'}</span>
          </button>
        </div>
      </div>

      {/* Aggregate Portfolio Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#0B1015] border border-[#29383D] rounded-md">
          <span className="text-[10px] uppercase font-semibold text-[#91A2A6] block tracking-wider">
            TOTAL INVENTORY ASSETS
          </span>
          <div className="text-2xl font-bold font-mono text-white tabular-nums mt-0.5">
            ${totalAVE.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#91A2A6] font-mono">
            Across {fleetList.length} verified lot units
          </span>
        </div>

        <div className="p-3.5 bg-[#0B1015] border border-[#29383D] rounded-md">
          <span className="text-[10px] uppercase font-semibold text-[#91A2A6] block tracking-wider">
            NET UNREALIZED EQUITY
          </span>
          <div className="text-2xl font-bold font-mono text-[#B7F34A] tabular-nums mt-0.5 flex items-center gap-1">
            <ArrowUpRight className="w-5 h-5" />
            +${netDelta.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#B7F34A] font-mono">
            +{netDeltaPct}% vs Internal Book Value
          </span>
        </div>

        <div className="p-3.5 bg-[#0B1015] border border-[#29383D] rounded-md">
          <span className="text-[10px] uppercase font-semibold text-[#91A2A6] block tracking-wider">
            WEIGHTED INVENTORY TURN
          </span>
          <div className="text-2xl font-bold font-mono text-white tabular-nums mt-0.5">
            {avgTurn} Days
          </div>
          <span className="text-[11px] text-[#00C7D4] font-mono">
            High velocity retail clearance
          </span>
        </div>

        <div className="p-3.5 bg-[#0B1015] border border-[#29383D] rounded-md">
          <span className="text-[10px] uppercase font-semibold text-[#91A2A6] block tracking-wider">
            PORTFOLIO CREDIT GRADE
          </span>
          <div className="text-2xl font-bold font-mono text-[#00C7D4] tabular-nums mt-0.5">
            AA+ PRIME
          </div>
          <span className="text-[11px] text-[#91A2A6] font-mono">
            Flooring Line Eligible
          </span>
        </div>
      </div>

      {/* Fleet Vehicles Table */}
      <div className="overflow-x-auto border border-[#29383D] rounded-md">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-[#0B1015] border-b border-[#29383D] text-[#91A2A6] uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Unit / VIN</th>
              <th className="py-2.5 px-3">Vehicle Description</th>
              <th className="py-2.5 px-3 text-right">Odometer</th>
              <th className="py-2.5 px-3 text-center">AutoGrade</th>
              <th className="py-2.5 px-3 text-right">Internal Book</th>
              <th className="py-2.5 px-3 text-right">AVE Fair Value</th>
              <th className="py-2.5 px-3 text-right">Equity Delta</th>
              <th className="py-2.5 px-3 text-center">Turn Rate</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#29383D]/60 text-white">
            {fleetList.map((veh) => {
              const delta = veh.aveFairValue - veh.bookValue;
              const isPositive = delta >= 0;

              return (
                <tr
                  key={veh.id}
                  className="hover:bg-[#17242A]/80 transition-colors"
                >
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="text-[#00C7D4] font-bold block">{veh.id}</span>
                    <span className="text-[10px] text-[#91A2A6]">
                      {veh.vin.substring(0, 8)}•••{veh.vin.substring(13)}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="font-sans font-semibold text-xs text-white">
                      {veh.year} {veh.make} {veh.model}
                    </div>
                    <div className="text-[11px] text-[#91A2A6] font-mono">{veh.trim}</div>
                  </td>

                  <td className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">
                    {veh.mileage.toLocaleString()} mi
                  </td>

                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-[#B7F34A]/10 text-[#B7F34A] border border-[#B7F34A]/30">
                      {veh.grade.toFixed(1)}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap text-[#91A2A6]">
                    ${veh.bookValue.toLocaleString()}
                  </td>

                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-[#00C7D4] whitespace-nowrap">
                    ${veh.aveFairValue.toLocaleString()}
                  </td>

                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold whitespace-nowrap">
                    <span className={isPositive ? 'text-[#B7F34A]' : 'text-[#FF665C]'}>
                      {isPositive ? '+' : ''}${delta.toLocaleString()}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-center tabular-nums whitespace-nowrap">
                    {veh.turnoverDays}d
                  </td>

                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-[#17242A] text-[#dee3ea] border border-[#29383D]">
                      {veh.status}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => onSelectVehicleVin(veh.vin)}
                      className="px-2 py-1 rounded bg-[#17242A] border border-[#29383D] hover:border-[#00C7D4] text-[#00C7D4] hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Audit VIN
                    </button>
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

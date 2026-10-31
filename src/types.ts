export interface VehicleSpecs {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  bodyType: string;
  engine: string;
  drivetrain: string;
  transmission: string;
  exteriorColor: string;
  interiorColor: string;
  msrpOriginal: number;
}

export interface ReconditioningCost {
  id: string;
  label: string;
  category: 'mechanical' | 'cosmetic' | 'tires' | 'glass';
  cost: number;
  active: boolean;
  impactScore: number;
}

export interface VehicleInput {
  vin: string;
  plate: string;
  state: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  conditionGrade: number; // 1.0 to 5.0 AutoGrade
  conditionLabel: 'Rough' | 'Average' | 'Clean' | 'Extra Clean';
  zipCode: string;
  marketRegion: string;
  titleStatus: 'Clean' | 'Prior Salvage' | 'Lemon Law' | 'Lien Active';
  reconditioningItems: ReconditioningCost[];
  selectedOptions: string[];
}

export interface ValuationMetric {
  label: string;
  value: string;
  codeNum?: string;
  deltaText: string;
  isPositive: boolean | null; // true = lime, false = red, null = amber
  badgeType: 'lime' | 'amber' | 'coral';
  subtext?: string;
}

export interface PriceDistribution {
  wholesaleFloor: number;
  algorithmicFairValue: number;
  retailCeiling: number;
  marketBenchmark: number; // MMR or Kelley Blue Book reference
  dealerTargetBuy: number;
  privatePartyTarget: number;
}

export interface WaterfallStep {
  name: string;
  category: 'base' | 'addition' | 'deduction' | 'result';
  amount: number;
  cumulative: number;
  explanation: string;
}

export interface MarketComp {
  id: string;
  vinSnippet: string;
  source: 'Manheim (MMR)' | 'ADESA Live' | 'ACV Auctions' | 'Dealer Direct';
  saleDate: string;
  mileage: number;
  grade: number;
  exteriorColor: string;
  salePrice: number;
  deltaAVE: number; // Difference relative to algorithmic quote
  distanceMiles: number;
}

export interface ResidualPoint {
  month: number;
  monthLabel: string;
  projectedValue: number;
  lowerConfidence: number;
  upperConfidence: number;
  depreciationPct: number;
}

export interface FleetVehicle {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  grade: number;
  bookValue: number;
  aveFairValue: number;
  turnoverDays: number;
  riskRating: 'AAA' | 'AA' | 'A' | 'BBB';
  status: 'In Stock' | 'Pending Ingestion' | 'Inspection Cleared';
}

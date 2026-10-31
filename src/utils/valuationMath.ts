import { VehicleInput, VehicleSpecs, PriceDistribution, WaterfallStep, MarketComp, ResidualPoint } from '../types';
import { PRESET_VEHICLES, DMA_REGIONS } from '../data/mockVehicles';

export interface CalculatedValuation {
  distribution: PriceDistribution;
  waterfall: WaterfallStep[];
  comps: MarketComp[];
  residuals: ResidualPoint[];
  deltaDollars: number;
  deltaPercent: number;
  liquidityDays: number;
  confidenceScore: number;
  dealerMarginDollars: number;
  dealerMarginPct: number;
  compSpreadSigma: number;
  totalReconCost: number;
}

export function computeValuation(input: VehicleInput, specs: VehicleSpecs): CalculatedValuation {
  // 1. Base Model Baseline (using current year 2026 vs vehicle model year)
  const ageYears = Math.max(0.5, 2026 - specs.year);
  
  // Annual depreciation baseline for luxury/tech vehicles (~11% compound per year)
  const baselineDepreciation = Math.pow(0.885, ageYears);
  const baseWholesale = Math.round(specs.msrpOriginal * baselineDepreciation);

  // 2. Mileage delta adjustment
  const expectedMileage = Math.round(ageYears * 12500);
  const mileageDiff = expectedMileage - input.mileage;
  // Cost per mile rate scaled by luxury tier (higher MSRP = higher rate)
  const mileRate = Math.min(0.65, Math.max(0.18, (specs.msrpOriginal / 100000) * 0.32));
  const mileageAdjustment = Math.round(mileageDiff * mileRate);

  // 3. Condition Grade adjustment (AutoGrade 1.0 to 5.0, where 4.0 is baseline Clean)
  const conditionDelta = input.conditionGrade - 4.0;
  const conditionAdjustment = Math.round(conditionDelta * (baseWholesale * 0.055));

  // 4. Factory options retained value
  const preset = PRESET_VEHICLES[specs.vin];
  let optionsAdjustment = 0;
  if (preset && input.selectedOptions.length > 0) {
    const rawOptionsTotal = preset.availableOptions
      .filter((opt) => input.selectedOptions.includes(opt.id))
      .reduce((acc, opt) => acc + opt.value, 0);
    // Retain 65% of secondary market value
    optionsAdjustment = Math.round(rawOptionsTotal * 0.65);
  }

  // 5. Regional DMA adjustment
  const dma = DMA_REGIONS.find((d) => d.name === input.marketRegion) || DMA_REGIONS[0];
  const regionalAdjustment = Math.round(baseWholesale * (dma.liquidityIndex - 1.0));

  // 6. Title status deduction
  let titlePenalty = 0;
  if (input.titleStatus === 'Prior Salvage') {
    titlePenalty = -Math.round(baseWholesale * 0.35);
  } else if (input.titleStatus === 'Lemon Law') {
    titlePenalty = -Math.round(baseWholesale * 0.25);
  } else if (input.titleStatus === 'Lien Active') {
    titlePenalty = -250; // Administrative title payoff fee
  }

  // 7. Reconditioning wear deductions
  const activeRecon = input.reconditioningItems.filter((item) => item.active);
  const totalReconCost = activeRecon.reduce((acc, item) => acc + item.cost, 0);
  const reconPenalty = -totalReconCost;

  // Unadjusted algorithmic core
  const unadjustedSum = baseWholesale + mileageAdjustment + conditionAdjustment + optionsAdjustment + regionalAdjustment + titlePenalty + reconPenalty;
  
  // Final Algorithmic Fair Value (rounded to nearest 50 for realistic dealer blotter)
  const algorithmicFairValue = Math.round(unadjustedSum / 50) * 50;

  // Benchmark reference (MMR / Manheim Auction Benchmark)
  const marketBenchmark = Math.round((baseWholesale + mileageAdjustment * 0.8) / 50) * 50;
  const deltaDollars = algorithmicFairValue - marketBenchmark;
  const deltaPercent = Number(((deltaDollars / marketBenchmark) * 100).toFixed(2));

  // Pricing Distribution bounds
  const wholesaleFloor = Math.round((algorithmicFairValue * 0.94) / 50) * 50;
  const retailCeiling = Math.round((algorithmicFairValue * 1.075) / 50) * 50;
  const dealerTargetBuy = Math.round((wholesaleFloor * 0.96) / 50) * 50;
  const privatePartyTarget = Math.round((algorithmicFairValue * 1.025) / 50) * 50;

  const distribution: PriceDistribution = {
    wholesaleFloor,
    algorithmicFairValue,
    retailCeiling,
    marketBenchmark,
    dealerTargetBuy,
    privatePartyTarget,
  };

  // Liquidity velocity (days to turn)
  const baseTurnDays = dma.avgDaysOnMarket;
  const gradeTurnBenefit = conditionDelta > 0 ? -Math.round(conditionDelta * 3) : Math.round(Math.abs(conditionDelta) * 5);
  const liquidityDays = Math.max(7, Math.round(baseTurnDays + gradeTurnBenefit));

  // Dealer net margin
  const dealerMarginDollars = retailCeiling - algorithmicFairValue - totalReconCost;
  const dealerMarginPct = Number(((dealerMarginDollars / algorithmicFairValue) * 100).toFixed(2));

  // Standard deviation spread (sigma from market)
  const compSpreadSigma = Number((deltaDollars / (baseWholesale * 0.04)).toFixed(2));
  
  // Confidence score
  const confidenceScore = Number((98.6 - (input.titleStatus !== 'Clean' ? 4.2 : 0) - (input.conditionGrade < 3.0 ? 3.5 : 0)).toFixed(1));

  // Build Waterfall steps
  let cumulative = specs.msrpOriginal;
  const waterfall: WaterfallStep[] = [
    {
      name: 'Original Window Sticker (MSRP)',
      category: 'base',
      amount: specs.msrpOriginal,
      cumulative: specs.msrpOriginal,
      explanation: 'Factory OEM baseline configuration at initial delivery.',
    },
    {
      name: `Aging & Model Year Decay (${ageYears.toFixed(1)} yrs)`,
      category: 'deduction',
      amount: -(specs.msrpOriginal - baseWholesale),
      cumulative: (cumulative = baseWholesale),
      explanation: 'Compound macro market depreciation across model lifecycle.',
    },
    {
      name: `Odometer Delta (${mileageDiff >= 0 ? '+' : ''}${(mileageDiff).toLocaleString()} mi)`,
      category: mileageAdjustment >= 0 ? 'addition' : 'deduction',
      amount: mileageAdjustment,
      cumulative: (cumulative += mileageAdjustment),
      explanation: `Variance from national benchmark (${(expectedMileage).toLocaleString()} mi anticipated).`,
    },
    {
      name: `Grade Assessment (${input.conditionGrade.toFixed(1)} AutoGrade)`,
      category: conditionAdjustment >= 0 ? 'addition' : 'deduction',
      amount: conditionAdjustment,
      cumulative: (cumulative += conditionAdjustment),
      explanation: `Mechanical & cosmetic physical inspection rating (${input.conditionLabel}).`,
    },
    {
      name: `Factory Optional Equipment (${input.selectedOptions.length} Selected)`,
      category: 'addition',
      amount: optionsAdjustment,
      cumulative: (cumulative += optionsAdjustment),
      explanation: 'High-value residual options retained across secondary wholesale.',
    },
    {
      name: `DMA Geographic Demand (${dma.name})`,
      category: regionalAdjustment >= 0 ? 'addition' : 'deduction',
      amount: regionalAdjustment,
      cumulative: (cumulative += regionalAdjustment),
      explanation: `Regional buyer liquidity index factor (${dma.liquidityIndex}x).`,
    },
  ];

  if (titlePenalty !== 0) {
    waterfall.push({
      name: `Title & History Mark-Down (${input.titleStatus})`,
      category: 'deduction',
      amount: titlePenalty,
      cumulative: (cumulative += titlePenalty),
      explanation: 'Title brand risk adjustment for auction re-registration.',
    });
  }

  if (reconPenalty !== 0) {
    waterfall.push({
      name: `Pre-Sale Reconditioning (${activeRecon.length} items flagged)`,
      category: 'deduction',
      amount: reconPenalty,
      cumulative: (cumulative += reconPenalty),
      explanation: 'Direct mechanical, cosmetic paint, and wear restoration costs.',
    });
  }

  waterfall.push({
    name: 'Final Algorithmic Fair Value (AVE Output)',
    category: 'result',
    amount: algorithmicFairValue,
    cumulative: algorithmicFairValue,
    explanation: 'Deterministic transaction guarantee price valid for 7 calendar days.',
  });

  // Generate 8 realistic market comps
  const compSources: ('Manheim (MMR)' | 'ADESA Live' | 'ACV Auctions' | 'Dealer Direct')[] = [
    'Manheim (MMR)',
    'ADESA Live',
    'Manheim (MMR)',
    'ACV Auctions',
    'Dealer Direct',
    'Manheim (MMR)',
    'ADESA Live',
    'ACV Auctions',
  ];

  const comps: MarketComp[] = compSources.map((source, index) => {
    // slight variance around the fair value
    const varianceRatio = 1 + (index % 2 === 0 ? 1 : -1) * (0.015 + (index * 0.007));
    const salePrice = Math.round((algorithmicFairValue * varianceRatio) / 100) * 100;
    const compMiles = Math.round(input.mileage + (index - 3.5) * 1800);
    const compGrade = Number(Math.min(5.0, Math.max(3.2, input.conditionGrade + (index % 3 === 0 ? 0.2 : -0.2))).toFixed(1));
    const daysAgo = (index + 1) * 3 + (index * 2);
    const date = new Date(2026, 9, 31 - daysAgo).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const vinPrefix = specs.vin.substring(0, 11);
    const vinTail = String(100000 + index * 1234).substring(1);

    return {
      id: `COMP-${1000 + index}`,
      vinSnippet: `${vinPrefix}•••${vinTail}`,
      source,
      saleDate: date,
      mileage: Math.max(2500, compMiles),
      grade: compGrade,
      exteriorColor: specs.exteriorColor,
      salePrice,
      deltaAVE: salePrice - algorithmicFairValue,
      distanceMiles: (index + 1) * 45 + 12,
    };
  });

  // Generate 36-Month Residual Trajectory (every 6 months)
  const residuals: ResidualPoint[] = [
    {
      month: 0,
      monthLabel: 'Current (T=0)',
      projectedValue: algorithmicFairValue,
      lowerConfidence: Math.round(algorithmicFairValue * 0.98),
      upperConfidence: Math.round(algorithmicFairValue * 1.02),
      depreciationPct: 0,
    },
    {
      month: 6,
      monthLabel: '+6 Months',
      projectedValue: Math.round(algorithmicFairValue * 0.948),
      lowerConfidence: Math.round(algorithmicFairValue * 0.925),
      upperConfidence: Math.round(algorithmicFairValue * 0.97),
      depreciationPct: -5.2,
    },
    {
      month: 12,
      monthLabel: '+12 Months',
      projectedValue: Math.round(algorithmicFairValue * 0.895),
      lowerConfidence: Math.round(algorithmicFairValue * 0.865),
      upperConfidence: Math.round(algorithmicFairValue * 0.925),
      depreciationPct: -10.5,
    },
    {
      month: 18,
      monthLabel: '+18 Months',
      projectedValue: Math.round(algorithmicFairValue * 0.842),
      lowerConfidence: Math.round(algorithmicFairValue * 0.805),
      upperConfidence: Math.round(algorithmicFairValue * 0.88),
      depreciationPct: -15.8,
    },
    {
      month: 24,
      monthLabel: '+24 Months',
      projectedValue: Math.round(algorithmicFairValue * 0.796),
      lowerConfidence: Math.round(algorithmicFairValue * 0.75),
      upperConfidence: Math.round(algorithmicFairValue * 0.84),
      depreciationPct: -20.4,
    },
    {
      month: 30,
      monthLabel: '+30 Months',
      projectedValue: Math.round(algorithmicFairValue * 0.752),
      lowerConfidence: Math.round(algorithmicFairValue * 0.70),
      upperConfidence: Math.round(algorithmicFairValue * 0.805),
      depreciationPct: -24.8,
    },
    {
      month: 36,
      monthLabel: '+36 Months',
      projectedValue: Math.round(algorithmicFairValue * 0.71),
      lowerConfidence: Math.round(algorithmicFairValue * 0.65),
      upperConfidence: Math.round(algorithmicFairValue * 0.77),
      depreciationPct: -29.0,
    },
  ];

  return {
    distribution,
    waterfall,
    comps,
    residuals,
    deltaDollars,
    deltaPercent,
    liquidityDays,
    confidenceScore,
    dealerMarginDollars,
    dealerMarginPct,
    compSpreadSigma,
    totalReconCost,
  };
}

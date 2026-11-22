export type Segment = "residential" | "commercial";

export const BILL_MIN = 1500;
export const BILL_MAX = 50000;
export const BILL_STEP = 500;
export const BILL_DEFAULT = 5000;

export const TARIFF_PER_UNIT = 8.5; // Average grid tariff in ₹/kWh
export const UNITS_PER_KW_MONTH = 120; // Estimated monthly generation per kW
export const SQFT_PER_KW = 90; // Shadow-free rooftop space required per kW
export const BENCHMARK_COST_PER_KW = 58000; // Benchmark MNRE cost per kW for Tier-1 equipment

export interface SolarEstimate {
  kw: number;
  monthlySavings: number;
  annualSavings: number;
  roofAreaSqFt: number;
  subsidyAmount: number | null;
  grossCost: number;
  netEffectiveCost: number;
  paybackPeriod: string;
}

/**
 * Calculates solar system sizing, savings, and net effective cost
 * after PM Surya Ghar government subsidy.
 */
export function calculateSolarEstimate(monthlyBill: number, segment: Segment): SolarEstimate {
  const unitsNeeded = monthlyBill / TARIFF_PER_UNIT;
  const kw = Math.max(1, Math.round(unitsNeeded / UNITS_PER_KW_MONTH));
  
  // Sizing savings: capped at 90% of actual monthly bill for conservative honesty
  const rawSavings = Math.round(kw * UNITS_PER_KW_MONTH * TARIFF_PER_UNIT * 0.9);
  const monthlySavings = Math.min(rawSavings, Math.round(monthlyBill * 0.9));
  const annualSavings = monthlySavings * 12;

  // PM Surya Ghar: Muft Bijli Yojana Central Govt Subsidy tiers
  // 1 kW: ₹30,000 | 2 kW: ₹60,000 | 3 kW and above: ₹78,000 max
  const residentialSubsidy = kw >= 3 ? 78000 : kw === 2 ? 60000 : 30000;
  const subsidyAmount = segment === "residential" ? residentialSubsidy : null;

  const grossCost = kw * BENCHMARK_COST_PER_KW;
  const netEffectiveCost = segment === "residential"
    ? Math.max(0, grossCost - (subsidyAmount ?? 0))
    : grossCost;

  return {
    kw,
    monthlySavings,
    annualSavings,
    roofAreaSqFt: kw * SQFT_PER_KW,
    subsidyAmount,
    grossCost,
    netEffectiveCost,
    paybackPeriod: segment === "residential" ? "~3.2 – 4.2 Years" : "~3.0 – 4.0 Years",
  };
}

export function formatInr(amount: number): string {
  return "₹" + Math.round(amount).toLocaleString("en-IN");
}

export function clampBill(value: number): number {
  if (isNaN(value) || !isFinite(value)) return BILL_MIN;
  return Math.min(BILL_MAX, Math.max(BILL_MIN, value));
}

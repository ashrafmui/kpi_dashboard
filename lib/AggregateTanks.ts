import { TransformedTankRecord } from "./TransformTank";

export interface KPISummary {
  totalTimeSaved: number;
  totalEnergySaved: number;
  totalWaterSaved: number;
  totalTimeUsed: number;
  totalEnergyUsed: number;
  totalWaterUsed: number;
  avgTimeSaved: number;
  avgEnergySaved: number;
  avgWaterSaved: number;
  // estimated cost savings
  estimatedEnergyCostSaved: number;
  estimatedWaterCostSaved: number;
  // how many records had valid water data
  waterRecordCount: number;
  totalRecords: number;
}

// US average utility rates
// In production, these would be configurable per customer/region
const ENERGY_RATE_PER_KWH = 0.13; // $/kWh
const WATER_RATE_PER_GAL = 0.005; // $/gal

export function aggregateKPIs(records: TransformedTankRecord[]): KPISummary {
  let totalTimeSaved = 0;
  let totalEnergySaved = 0;
  let totalWaterSaved = 0;
  let totalTimeMetric = 0;
  let totalEnergyMetric = 0;
  let totalWaterMetric = 0;
  let waterRecordCount = 0;

  for (const r of records) {
    totalTimeSaved += r.savings.time;
    totalEnergySaved += r.savings.energy;
    totalTimeMetric += r.metrics.time;
    totalEnergyMetric += r.metrics.energy;

    if (r.savings.water !== null && r.metrics.water !== null) {
      totalWaterSaved += r.savings.water;
      totalWaterMetric += r.metrics.water;
      waterRecordCount++;
    }
  }

  const totalRecords = records.length;

  return {
    totalTimeSaved,
    totalEnergySaved,
    totalWaterSaved,
    totalTimeUsed: totalTimeMetric,
    totalEnergyUsed: totalEnergyMetric,
    totalWaterUsed: totalWaterMetric,
    avgTimeSaved: totalRecords > 0 ? totalTimeSaved / totalRecords : 0,
    avgEnergySaved: totalRecords > 0 ? totalEnergySaved / totalRecords : 0,
    avgWaterSaved: waterRecordCount > 0 ? totalWaterSaved / waterRecordCount : 0,
    estimatedEnergyCostSaved: parseFloat(
      (totalEnergySaved * ENERGY_RATE_PER_KWH).toFixed(2)
    ),
    estimatedWaterCostSaved: parseFloat(
      (totalWaterSaved * WATER_RATE_PER_GAL).toFixed(2)
    ),
    waterRecordCount,
    totalRecords,
  };
}
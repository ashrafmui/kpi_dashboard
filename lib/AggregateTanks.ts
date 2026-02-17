import { TransformedTankRecord } from "./TransformTank";

export interface KPISummary {
  totalTimeSaved: number;
  totalEnergySaved: number;
  totalWaterSaved: number;
  avgTimeSaved: number;
  avgEnergySaved: number;
  avgWaterSaved: number;
  // how many records had valid water data
  waterRecordCount: number;
  totalRecords: number;
}

export function aggregateKPIs(records: TransformedTankRecord[]): KPISummary {
  let totalTimeSaved = 0;
  let totalEnergySaved = 0;
  let totalWaterSaved = 0;
  let waterRecordCount = 0;

  for (const r of records) {
    totalTimeSaved += r.savings.time;
    totalEnergySaved += r.savings.energy;

    if (r.savings.water !== null) {
      totalWaterSaved += r.savings.water;
      waterRecordCount++;
    }
  }

  const totalRecords = records.length;

  return {
    totalTimeSaved,
    totalEnergySaved,
    totalWaterSaved,
    avgTimeSaved: totalRecords > 0 ? totalTimeSaved / totalRecords : 0,
    avgEnergySaved: totalRecords > 0 ? totalEnergySaved / totalRecords : 0,
    avgWaterSaved: waterRecordCount > 0 ? totalWaterSaved / waterRecordCount : 0,
    waterRecordCount,
    totalRecords,
  };
}
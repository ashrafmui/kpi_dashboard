import { TransformedTankRecord } from "./TransformTank";

export interface KPISummary {
  totalTimeSaved: number;
  totalEnergySaved: number;
  totalWaterSaved: number;
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

  return {
    totalTimeSaved,
    totalEnergySaved,
    totalWaterSaved,
    waterRecordCount,
    totalRecords: records.length,
  };
}
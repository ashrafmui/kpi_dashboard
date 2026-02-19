import { TransformedTankRecord } from "./TransformTank";

// US average utility rates
const ENERGY_RATE_PER_KWH = 0.13; // $/kWh
const WATER_RATE_PER_GAL = 0.005; // $/gal

export type SavingsMetric = "time" | "energy" | "water";

export interface DailyTankData {
  date: string;
  tank1: number;
  tank2: number;
  tank3: number;
  tank4: number;
}

const tankKeyMap: Record<string, keyof Omit<DailyTankData, "date">> = {
  "Tank 1": "tank1",
  "Tank 2": "tank2",
  "Tank 3": "tank3",
  "Tank 4": "tank4",
};

export function aggregateByDay(
  records: TransformedTankRecord[],
  metric: SavingsMetric
): DailyTankData[] {
  const sorted = [...records].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );

  // Find date range
  const earliest = sorted[0].startTime;
  const latest = sorted[sorted.length - 1].startTime;

  // Build a map with every day in range initialized to 0
  const byDate = new Map<string, DailyTankData>();
  const current = new Date(earliest);
  current.setUTCHours(0, 0, 0, 0);
  const end = new Date(latest);
  end.setUTCHours(0, 0, 0, 0);

  while (current <= end) {
    const dateKey = current.toISOString().split("T")[0];
    byDate.set(dateKey, {
      date: dateKey,
      tank1: 0,
      tank2: 0,
      tank3: 0,
      tank4: 0,
    });
    current.setUTCDate(current.getUTCDate() + 1);
  }

  // Fill in actual values
  for (const r of sorted) {
    const dateKey = r.startTime.toISOString().split("T")[0];
    const point = byDate.get(dateKey)!;
    const value = r.savings[metric] ?? 0;
    const key = tankKeyMap[r.tankName];
        if (key) point[key] += value;  }

  return Array.from(byDate.values());
}

// ── KPI summary (used by KPI cards and chart header totals) ──

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
  estimatedEnergyCostSaved: number;
  estimatedWaterCostSaved: number;
  projectedYearlyTimeSaved: number;
  projectedYearlyEnergySaved: number;
  projectedYearlyWaterSaved: number;
  projectedYearlyEnergyCost: number;
  projectedYearlyWaterCost: number;
  waterRecordCount: number;
  totalRecords: number;
  dateRangeDays: number;
  // top savers per metric
  topTimeSaver: { tank: string; value: number };
  topEnergySaver: { tank: string; value: number };
  topWaterSaver: { tank: string; value: number };
}

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

  const dates = records.map((r) => r.startTime.getTime());
  const earliestMs = Math.min(...dates);
  const latestMs = Math.max(...dates);
  const dateRangeDays = Math.max(
    (latestMs - earliestMs) / (1000 * 60 * 60 * 24),
    1
  );
  const yearMultiplier = 365 / dateRangeDays;

  const estimatedEnergyCostSaved = parseFloat(
    (totalEnergySaved * ENERGY_RATE_PER_KWH).toFixed(2)
  );
  const estimatedWaterCostSaved = parseFloat(
    (totalWaterSaved * WATER_RATE_PER_GAL).toFixed(2)
  );

  // Find top saver per metric by tank
  const tankSavings: Record<string, { time: number; energy: number; water: number }> = {};
  for (const r of records) {
    const name = r.tankName;
    if (!tankSavings[name]) tankSavings[name] = { time: 0, energy: 0, water: 0 };
    tankSavings[name].time += r.savings.time;
    tankSavings[name].energy += r.savings.energy;
    tankSavings[name].water += r.savings.water ?? 0;
  }

  function topSaver(metric: "time" | "energy" | "water") {
    let best = { tank: "N/A", value: 0 };
    for (const [tank, savings] of Object.entries(tankSavings)) {
      if (savings[metric] > best.value) {
        best = { tank, value: savings[metric] };
      }
    }
    return best;
  }

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
    estimatedEnergyCostSaved,
    estimatedWaterCostSaved,
    projectedYearlyTimeSaved: Math.round(totalTimeSaved * yearMultiplier),
    projectedYearlyEnergySaved: Math.round(totalEnergySaved * yearMultiplier),
    projectedYearlyWaterSaved: Math.round(totalWaterSaved * yearMultiplier),
    projectedYearlyEnergyCost: parseFloat(
      (estimatedEnergyCostSaved * yearMultiplier).toFixed(2)
    ),
    projectedYearlyWaterCost: parseFloat(
      (estimatedWaterCostSaved * yearMultiplier).toFixed(2)
    ),
    waterRecordCount,
    totalRecords,
    dateRangeDays: Math.round(dateRangeDays),
    topTimeSaver: topSaver("time"),
    topEnergySaver: topSaver("energy"),
    topWaterSaver: topSaver("water"),
  };
}

// ── Baseline vs Actual comparison (used by comparison chart) ──

export interface ComparisonDataPoint {
  date: string;
  actual: number;
  baseline: number;
}

export function aggregateComparison(
  records: TransformedTankRecord[],
  metric: SavingsMetric
): ComparisonDataPoint[] {
  const sorted = [...records].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );

  if (sorted.length === 0) return [];

  const earliest = sorted[0].startTime;
  const latest = sorted[sorted.length - 1].startTime;

  const byDate = new Map<string, ComparisonDataPoint>();
  const current = new Date(earliest);
  current.setUTCHours(0, 0, 0, 0);
  const end = new Date(latest);
  end.setUTCHours(0, 0, 0, 0);

  while (current <= end) {
    const dateKey = current.toISOString().split("T")[0];
    byDate.set(dateKey, { date: dateKey, actual: 0, baseline: 0 });
    current.setUTCDate(current.getUTCDate() + 1);
  }

  for (const r of sorted) {
    const dateKey = r.startTime.toISOString().split("T")[0];
    const point = byDate.get(dateKey)!;
    const metricVal = r.metrics[metric] ?? 0;
    const savingsVal = r.savings[metric] ?? 0;
    point.actual += metricVal;
    point.baseline += metricVal + savingsVal;
  }

  return Array.from(byDate.values());
}

// ── Shared constants ──

export const metricUnits: Record<SavingsMetric, string> = {
  time: "s",
  energy: "kWh",
  water: "gal",
};
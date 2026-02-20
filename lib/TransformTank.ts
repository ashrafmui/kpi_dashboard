import { TankRecord } from "@/types/tank";

export interface TransformedTankRecord {
  id: number;
  tankName: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  date: string; // "YYYY-MM-DD" for grouping by day
  savings: {
    time: number;
    energy: number;
    water: number | null; // preserve null so UI can show "N/A" vs "0"
  };
  metrics: {
    time: number;
    energy: number;
    water: number | null;
  };
}

export function transformRecord(raw: TankRecord): TransformedTankRecord {
  const start = new Date(raw.start_time);
  const end = new Date(raw.end_time);

  const savings = {
    time: raw.savings.time,
    energy: raw.savings.energy,
    water: raw.savings.Water,
  };

  const metrics = {
    time: raw.metrics.time,
    energy: raw.metrics.energy,
    water: raw.metrics.Water,
  };

  return {
    id: raw.id,
    tankName: raw.tank_name,
    startTime: start,
    endTime: end,
    durationMinutes: Math.round((end.getTime() - start.getTime()) / 60000),
    date: start.toISOString().split("T")[0],
    savings,
    metrics,
  };
}

export function transformTankData(raw: TankRecord[]): TransformedTankRecord[] {
  return raw.map(transformRecord);
}

// Group records by tank name
export function groupByTank(
  records: TransformedTankRecord[]
): Record<string, TransformedTankRecord[]> {
  const grouped: Record<string, TransformedTankRecord[]> = {};
  for (const r of records) {
    if (!grouped[r.tankName]) grouped[r.tankName] = [];
    grouped[r.tankName].push(r);
  }
  return grouped;
}

// Group records by date
export function groupByDate(
  records: TransformedTankRecord[]
): Record<string, TransformedTankRecord[]> {
  const grouped: Record<string, TransformedTankRecord[]> = {};
  for (const r of records) {
    if (!grouped[r.date]) grouped[r.date] = [];
    grouped[r.date].push(r);
  }
  return grouped;
}
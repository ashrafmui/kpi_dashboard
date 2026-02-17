import rawData from "@/public/data/example.json";
import { TankRecord } from "@/types/tank";
import { transformTankData, TransformedTankRecord } from "./TransformTank";

export async function getTankData(): Promise<TransformedTankRecord[]> {
  // Currently: static JSON import
  // Production: replace with fetch() or WebSocket connection
  const data = rawData as TankRecord[];
  return transformTankData(data);
}
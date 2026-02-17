export interface TankRecord {
  id: number;
  tank_name: string;
  start_time: string;
  end_time: string;
  savings: {
    time: number;
    energy: number;
    Water: number | null;
  };
  metrics: {
    time: number;
    energy: number;
    Water: number | null;
  };
}
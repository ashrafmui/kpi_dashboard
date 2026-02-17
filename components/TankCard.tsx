import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransformedTankRecord } from "@/lib/TransformTank";

interface TankCardProps {
  record: TransformedTankRecord;
}

export function TankCard({ record }: TankCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{record.tankName}</CardTitle>
        <CardDescription>
          {record.startTime.toLocaleDateString()} · {record.durationMinutes} min
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Time Saved</p>
            <p className="text-lg font-semibold">{record.savings.time}s</p>
          </div>
          <div>
            <p className="text-muted-foreground">Energy Saved</p>
            <p className="text-lg font-semibold">{record.savings.energy}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Water Saved</p>
            <p className="text-lg font-semibold">
              {record.savings.water !== null ? record.savings.water : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
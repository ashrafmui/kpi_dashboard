"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransformedTankRecord } from "@/lib/TransformTank";

interface CycleDetailModalProps {
  record: TransformedTankRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CycleModal({
  record,
  open,
  onOpenChange,
}: CycleDetailModalProps) {
  if (!record) return null;

  const savingsPercent = {
    time: record.metrics.time > 0
      ? ((record.savings.time / record.metrics.time) * 100).toFixed(1)
      : "0",
    energy: record.metrics.energy > 0
      ? ((record.savings.energy / record.metrics.energy) * 100).toFixed(1)
      : "0",
    water:
      record.savings.water !== null && record.metrics.water !== null && record.metrics.water > 0
        ? ((record.savings.water / record.metrics.water) * 100).toFixed(1)
        : null,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{record.tankName}</DialogTitle>
          <DialogDescription>
            {record.startTime.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            · {record.startTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            – {record.endTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Process Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {(record.metrics.time / 60).toFixed(1)} min
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Time Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {(record.savings.time / 60).toFixed(1)} min
              </p>
              <p className="text-sm text-muted-foreground">
                {savingsPercent.time}% reduction
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Energy Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {record.metrics.energy} kWh
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Energy Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {record.savings.energy} kWh
              </p>
              <p className="text-sm text-muted-foreground">
                {savingsPercent.energy}% reduction
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Water Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {record.metrics.water !== null
                  ? `${record.metrics.water} gal`
                  : "N/A"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Water Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {record.savings.water !== null
                  ? `${record.savings.water} gal`
                  : "N/A"}
              </p>
              {savingsPercent.water && (
                <p className="text-sm text-muted-foreground">
                  {savingsPercent.water}% reduction
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useState, useMemo } from "react";
import { Line, LineChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { TransformedTankRecord } from "@/lib/TransformTank";
import {
  aggregateByDay,
  metricUnits,
  KPISummary,
  SavingsMetric,
} from "@/lib/AggregateTanks";

const chartConfig = {
  tank1: {
    label: "Tank 1",
    color: "var(--chart-1)",
  },
  tank2: {
    label: "Tank 2",
    color: "var(--chart-2)",
  },
  tank3: {
    label: "Tank 3",
    color: "var(--chart-3)",
  },
  tank4: {
    label: "Tank 4",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const metricOptions: { key: SavingsMetric; label: string }[] = [
  { key: "time", label: "Time Saved" },
  { key: "energy", label: "Energy Saved" },
  { key: "water", label: "Water Saved" },
];

interface SavingsChartProps {
  data: TransformedTankRecord[];
  tankNames: string[];
  kpis: KPISummary;
}

// Map metric keys to KPI total fields
const metricToKPI: Record<SavingsMetric, keyof KPISummary> = {
  time: "totalTimeSaved",
  energy: "totalEnergySaved",
  water: "totalWaterSaved",
};

const TANK_KEYS = ["tank1", "tank2", "tank3", "tank4"] as const;

export function SavingsChart({ data, tankNames, kpis }: SavingsChartProps) {
  const [activeMetric, setActiveMetric] = useState<SavingsMetric>("water");

  const chartData = useMemo(
    () => aggregateByDay(data, activeMetric),
    [data, activeMetric]
  );

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>Savings Trend</CardTitle>
          <CardDescription>
            Daily savings by tank across all cycles
          </CardDescription>
        </div>
        <div className="flex">
          {metricOptions.map((m) => (
            <button
              key={m.key}
              data-active={activeMetric === m.key}
              className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              onClick={() => setActiveMetric(m.key)}
            >
              <span className="text-muted-foreground text-xs">
                {m.label}
              </span>
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {(kpis[metricToKPI[m.key]] as number).toLocaleString()}{" "}
                {metricUnits[m.key]}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[180px]"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
              }
            />
            {TANK_KEYS.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
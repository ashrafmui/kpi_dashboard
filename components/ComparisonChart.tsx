"use client";

import { useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  aggregateComparison,
  KPISummary,
  SavingsMetric,
} from "@/lib/AggregateTanks";

const chartConfig = {
  baseline: {
    label: "Without Laminar",
    color: "hsl(0 70% 50%)",
  },
  actual: {
    label: "With Laminar",
    color: "hsl(142 70% 45%)",
  },
} satisfies ChartConfig;

const metricOptions: { key: SavingsMetric; label: string }[] = [
  { key: "time", label: "Time" },
  { key: "energy", label: "Energy" },
  { key: "water", label: "Water" },
];

const metricToTotal: Record<SavingsMetric, { used: keyof KPISummary; saved: keyof KPISummary }> = {
  time: { used: "totalTimeUsed", saved: "totalTimeSaved" },
  energy: { used: "totalEnergyUsed", saved: "totalEnergySaved" },
  water: { used: "totalWaterUsed", saved: "totalWaterSaved" },
};

interface ComparisonChartProps {
  data: TransformedTankRecord[];
  kpis: KPISummary;
}

export function ComparisonChart({ data, kpis }: ComparisonChartProps) {
  const [activeMetric, setActiveMetric] = useState<SavingsMetric>("water");

  const chartData = useMemo(
    () => aggregateComparison(data, activeMetric),
    [data, activeMetric]
  );

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>Actual vs. Baseline</CardTitle>
          <CardDescription>
            Resource usage with Laminar vs. estimated usage without
          </CardDescription>
        </div>
        <div className="flex">
          {metricOptions.map((m) => {
            const used = kpis[metricToTotal[m.key].used] as number;
            const saved = kpis[metricToTotal[m.key].saved] as number;
            return (
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
                  {Math.round(
                    ((saved) / (used + saved)) * 100
                  )}% saved
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart
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
                  className="w-[200px]"
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
            <Area
              type="monotone"
              dataKey="baseline"
              stroke="var(--color-baseline)"
              fill="var(--color-baseline)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="var(--color-actual)"
              fill="var(--color-actual)"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
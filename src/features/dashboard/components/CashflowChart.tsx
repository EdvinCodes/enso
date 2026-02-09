"use client";

import { useMemo } from "react";
import { Subscription } from "@/types";
import { generateForecast } from "@/lib/forecast";
import { Card } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/currency";
import { TrendingUp, LineChart, CalendarClock } from "lucide-react";

interface Props {
  subscriptions: Subscription[];
}

export function CashflowChart({ subscriptions }: Props) {
  // Generamos el forecast solo con suscripciones recurrentes (ya filtrado en generateForecast)
  const data = useMemo(() => generateForecast(subscriptions), [subscriptions]);

  const totalForecast = data[data.length - 1]?.accumulated || 0;
  const isEmpty =
    subscriptions.filter((s) => s.billingCycle !== "one_time").length === 0;

  return (
    <Card className="p-6 bg-card/40 border-border backdrop-blur-md overflow-hidden h-full flex flex-col justify-between min-h-[300px]">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            30-Day Forecast
          </h3>
          <p className="text-sm text-muted-foreground">
            Projected cumulative recurring costs.
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">
            <CalendarClock className="w-3 h-3" /> Next 30 Days
          </div>
          <p className="text-2xl font-bold text-foreground font-mono tracking-tight">
            {formatCurrency(totalForecast)}
          </p>
        </div>
      </div>

      <div className="h-[200px] w-full flex-1 min-h-0">
        {isEmpty ? (
          // --- EMPTY STATE ---
          <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground/50 gap-3 border border-dashed border-border/50 rounded-xl bg-muted/5">
            <div className="p-3 bg-muted/10 rounded-full">
              <LineChart className="w-8 h-8 opacity-50" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground/80">
                No recurring data
              </p>
              <p className="text-xs max-w-[200px] mx-auto">
                Add monthly or yearly subscriptions to see your future cashflow
                curve.
              </p>
            </div>
          </div>
        ) : (
          // --- CHART REAL ---
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="colorAccumulated"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                vertical={false}
                className="opacity-10 text-muted-foreground"
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "currentColor", fontSize: 10, opacity: 0.5 }}
                tickLine={false}
                axisLine={false}
                interval={6}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fill: "currentColor", fontSize: 10, opacity: 0.5 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `€${val}`}
                className="text-muted-foreground"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload;
                    return (
                      <div className="bg-popover/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-2xl text-xs z-50 min-w-[150px]">
                        <p className="font-bold mb-2 text-foreground border-b border-border/50 pb-1">
                          {label}
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                              Accumulated:
                            </span>
                            <span className="text-emerald-500 font-mono font-bold">
                              {formatCurrency(dataPoint.accumulated)}
                            </span>
                          </div>

                          {dataPoint.amount > 0 && (
                            <div className="pt-1 mt-1 border-t border-border/50">
                              <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
                                Due Today ({dataPoint.items.length}):
                              </p>
                              <ul className="space-y-1">
                                {dataPoint.items.map(
                                  (item: string, i: number) => (
                                    <li
                                      key={i}
                                      className="flex items-center gap-1.5 text-foreground/90"
                                    >
                                      <div className="w-1 h-1 bg-primary rounded-full" />
                                      {item}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="accumulated"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAccumulated)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

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
import { TrendingUp, LineChart } from "lucide-react";

interface Props {
  subscriptions: Subscription[];
}

export function CashflowChart({ subscriptions }: Props) {
  const data = useMemo(() => generateForecast(subscriptions), [subscriptions]);

  const totalForecast = data[data.length - 1]?.accumulated || 0;
  const isEmpty = subscriptions.length === 0;

  return (
    <Card className="p-6 bg-card/40 border-border backdrop-blur-md overflow-hidden h-full flex flex-col justify-between min-h-[300px]">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            30-Day Forecast
          </h3>
          <p className="text-sm text-muted-foreground">
            Projected cumulative spending.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
            Next 30 Days
          </span>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(totalForecast)}
          </p>
        </div>
      </div>

      <div className="h-[200px] w-full flex-1 min-h-0">
        {isEmpty ? (
          // --- EMPTY STATE ---
          <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground/50 gap-3 border border-dashed border-border/50 rounded-xl bg-muted/5">
            <div className="p-3 bg-muted/10 rounded-full">
              <LineChart className="w-8 h-8" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground/80">
                No data to forecast
              </p>
              <p className="text-xs">
                Add subscriptions to see your future cashflow
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
                stroke="#333"
                vertical={false}
                opacity={0.2}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "#666", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fill: "#666", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `€${val}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border p-3 rounded-xl shadow-xl text-xs z-50">
                        <p className="font-bold mb-1 text-foreground">
                          {label}
                        </p>
                        <div className="space-y-1">
                          <p className="text-emerald-500 font-mono text-sm font-bold">
                            Total: {formatCurrency(dataPoint.accumulated)}
                          </p>
                          {dataPoint.amount > 0 && (
                            <div className="pt-2 mt-2 border-t border-border/50">
                              <p className="text-muted-foreground text-[10px] mb-1 uppercase">
                                Payments Today:
                              </p>
                              <ul className="list-disc pl-3 space-y-0.5">
                                {dataPoint.items.map(
                                  (item: string, i: number) => (
                                    <li key={i} className="text-foreground/80">
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

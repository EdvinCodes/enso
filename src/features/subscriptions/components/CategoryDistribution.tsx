"use client";

import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { Subscription, Payment, Currency } from "@/types"; // <--- Importamos Currency
import { convertToEur } from "@/lib/currency";
import { isSameMonth, parseISO } from "date-fns";

interface Props {
  subscriptions: Subscription[];
  payments: Payment[];
}

const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#8b5cf6", // Violet
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#ec4899", // Pink
];

export function CategoryDistribution({ subscriptions, payments }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>();

  const data = useMemo(() => {
    const map = new Map<string, number>();
    const now = new Date();

    subscriptions.forEach((sub) => {
      // 1. Buscamos si hay un pago REAL este mes para esta suscripción
      const realPayment = payments.find(
        (p) =>
          p.subscription_id === sub.id &&
          isSameMonth(parseISO(p.payment_date), now),
      );

      let amountInEur = 0;

      if (realPayment) {
        // CASO A: Ya se pagó este mes
        if (realPayment.status === "skipped") {
          amountInEur = 0;
        } else {
          // FIX: Forzamos el tipo con "as Currency" para que TypeScript no se queje
          amountInEur = convertToEur(
            realPayment.amount,
            realPayment.currency as Currency,
          );
        }
      } else {
        // CASO B: Proyección teórica
        let monthlyPrice = convertToEur(sub.price, sub.currency);
        if (sub.billingCycle === "yearly") monthlyPrice /= 12;
        if (sub.billingCycle === "weekly") monthlyPrice *= 4;
        amountInEur = monthlyPrice;
      }

      const current = map.get(sub.category) || 0;
      map.set(sub.category, current + amountInEur);
    });

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [subscriptions, payments]);

  if (data.length === 0 || data.every((d) => d.value === 0)) return null;

  const topCategoryName = data[0]?.name || "";

  return (
    <Card className="p-6 bg-card/40 border-border backdrop-blur-md flex flex-col items-center justify-center min-h-[300px] shadow-sm">
      <h3 className="text-sm font-medium text-muted-foreground self-start mb-4">
        Spend by Category (This Month)
      </h3>

      <div className="w-full h-[200px] relative isolate">
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
          <div className="flex flex-col items-center justify-center max-w-[110px]">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5 whitespace-nowrap">
              Top Spend
            </span>

            <span
              className="font-bold text-foreground block truncate w-full text-center text-base"
              title={topCategoryName}
            >
              {topCategoryName}
            </span>
          </div>
        </div>

        <div className="relative w-full h-full z-10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    className="transition-all duration-300 outline-none"
                    style={{
                      filter:
                        activeIndex === index
                          ? `drop-shadow(0 0 8px ${COLORS[index % COLORS.length]})`
                          : "none",
                      opacity:
                        activeIndex !== undefined && activeIndex !== index
                          ? 0.3
                          : 1,
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                cursor={false}
                wrapperStyle={{ zIndex: 50, outline: "none" }}
                contentStyle={{
                  backgroundColor: "#18181b",
                  borderColor: "#27272a",
                  borderRadius: "12px",
                  color: "#fff",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                }}
                itemStyle={{
                  color: "#e4e4e7",
                  fontSize: "12px",
                  fontWeight: 500,
                }}
                formatter={(
                  value: number | string | Array<number | string> | undefined,
                ) => [`${Number(value || 0).toFixed(2)} €`, "Monthly"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 w-full grid grid-cols-2 gap-2">
        {data.map((entry, index) => (
          <div
            key={entry.name}
            className="flex items-center justify-between text-xs group cursor-default"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div
                className={`w-2 h-2 rounded-full shrink-0 transition-all duration-300 ${
                  activeIndex === index
                    ? "scale-150 ring-2 ring-foreground/20"
                    : ""
                }`}
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span
                className={`transition-colors truncate ${
                  activeIndex === index
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {entry.name}
              </span>
            </div>
            <span className="font-mono text-muted-foreground shrink-0">
              {entry.value.toFixed(0)}€
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

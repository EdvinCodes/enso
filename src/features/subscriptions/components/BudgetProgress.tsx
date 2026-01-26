"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Props {
  current: number;
  limit: number;
  label: string;
  currency: string;
}

export function BudgetProgress({ current, limit, label, currency }: Props) {
  // Si no hay límite o es 0, no mostramos nada
  if (!limit || limit === 0) return null;

  const percentage = Math.min((current / limit) * 100, 100);
  const isOverBudget = current > limit;

  // Lógica de Semáforo:
  // - Rojo: Te has pasado (> 100%)
  // - Ámbar: Estás cerca (> 80%)
  // - Verde: Todo bien
  const isWarning = percentage > 80 && !isOverBudget;

  let colorClass = "bg-emerald-500"; // Verde por defecto
  if (isOverBudget)
    colorClass = "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"; // Rojo brillante
  else if (isWarning) colorClass = "bg-amber-500"; // Ámbar

  return (
    <div className="space-y-1.5 group">
      <div className="flex justify-between items-end text-xs">
        <span className="flex items-center gap-2 font-medium text-foreground">
          {label}
          {isOverBudget && (
            <span className="text-[9px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded animate-pulse border border-red-500/20">
              OVER LIMIT
            </span>
          )}
        </span>
        <span
          className={cn(
            "font-mono transition-colors",
            isOverBudget ? "text-red-500 font-bold" : "text-muted-foreground",
          )}
        >
          {current.toFixed(0)}{" "}
          <span className="text-[10px] text-muted-foreground/70">
            / {limit} {currency}
          </span>
        </span>
      </div>

      <div className="relative">
        <Progress
          value={percentage}
          className="h-2 bg-secondary/50"
          indicatorClassName={colorClass} // <--- Ahora esto funciona
        />
      </div>
    </div>
  );
}

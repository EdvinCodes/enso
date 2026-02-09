"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isToday,
  isSameMonth,
  addMonths,
  subMonths,
  parseISO,
  isSameDay,
  isBefore,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Subscription, Payment, Currency } from "@/types";
import { getPaymentsForDay } from "@/lib/calendar-logic";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/currency";

import { useSubscriptionStore } from "@/features/subscriptions/store/subscription.store";

interface Props {
  subscriptions: Subscription[];
  payments: Payment[];
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarView({ subscriptions, payments }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const { openModal } = useSubscriptionStore();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground capitalize">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <p className="text-muted-foreground text-sm">
            Overview of payments and projections
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid del Calendario */}
      <Card className="bg-card/50 backdrop-blur-sm overflow-hidden border-border shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Cabecera Dias Semana */}
            <div className="grid grid-cols-7 border-b border-border bg-muted/50">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>
            {/* Días */}
            <div className="grid grid-cols-7 auto-rows-[130px]">
              {calendarDays.map((day) => {
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isToday(day);

                const realPaymentsForDay = payments.filter((p) =>
                  isSameDay(parseISO(p.payment_date), day),
                );

                const recurringSubs = subscriptions.filter(
                  (s) => s.billingCycle !== "one_time",
                );
                const projected = getPaymentsForDay(recurringSubs, day);

                const finalProjected = projected.filter((sub) => {
                  const hasPaidThisMonth = payments.some(
                    (p) =>
                      p.subscription_id === sub.id &&
                      isSameMonth(parseISO(p.payment_date), day),
                  );
                  return !hasPaidThisMonth;
                });

                return (
                  <div
                    key={day.toString()}
                    className={cn(
                      "relative border-b border-r border-border p-2 transition-colors hover:bg-muted/30 flex flex-col gap-1",
                      !isCurrentMonth && "bg-muted/10 opacity-40",
                      isTodayDate &&
                        "bg-primary/5 ring-1 ring-inset ring-primary/20",
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className={cn(
                          "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                          isTodayDate
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-foreground",
                          !isCurrentMonth &&
                            !isTodayDate &&
                            "text-muted-foreground",
                        )}
                      >
                        {format(day, "d")}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-1 flex-1">
                      {/* A. PAGOS REALES */}
                      {realPaymentsForDay.map((p) => {
                        const sub = subscriptions.find(
                          (s) => s.id === p.subscription_id,
                        );
                        if (!sub) return null;

                        return (
                          <div
                            key={p.id}
                            className={cn(
                              "group flex items-center gap-1.5 border rounded px-1.5 py-1 shadow-sm text-[10px] cursor-pointer transition-all hover:scale-[1.02]",
                              p.status === "paid"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(sub);
                            }}
                          >
                            {/* AQUI USAMOS getCategoryColor: Una barrita de color a la izquierda */}
                            <div
                              className="w-1 h-3 rounded-full shrink-0"
                              style={{
                                backgroundColor: getCategoryColor(sub.category),
                              }}
                            />

                            {p.status === "paid" ? (
                              <Check className="w-3 h-3 shrink-0 opacity-50" />
                            ) : (
                              <X className="w-3 h-3 shrink-0 opacity-50" />
                            )}

                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="font-bold truncate leading-tight">
                                {sub.name}
                              </span>
                              <span className="font-mono opacity-80 leading-tight">
                                {formatCurrency(
                                  p.amount,
                                  p.currency as Currency,
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* B. PROYECCIONES */}
                      {finalProjected.map((sub) => {
                        const isLate =
                          isBefore(day, new Date()) && !isTodayDate;

                        return (
                          <TooltipProvider key={sub.id + "-proj"}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "flex items-center gap-1.5 border rounded px-1.5 py-1 cursor-pointer transition-all opacity-70 hover:opacity-100 text-[10px] hover:border-primary/50",
                                    isLate
                                      ? "border-red-500/30 bg-red-500/5 text-red-500 border-dashed"
                                      : "bg-card border-border border-dashed text-muted-foreground",
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(sub);
                                  }}
                                >
                                  {/* AQUI USAMOS getCategoryColor TAMBIEN */}
                                  <div
                                    className="w-1 h-3 rounded-full shrink-0"
                                    style={{
                                      backgroundColor: getCategoryColor(
                                        sub.category,
                                      ),
                                    }}
                                  />

                                  {isLate ? (
                                    <AlertCircle className="w-3 h-3 shrink-0" />
                                  ) : (
                                    <Clock className="w-3 h-3 shrink-0" />
                                  )}

                                  <div className="flex flex-col min-w-0 flex-1">
                                    <span className="font-medium truncate leading-tight">
                                      {sub.name}
                                    </span>
                                    <span className="font-mono opacity-70 leading-tight">
                                      {formatCurrency(sub.price, sub.currency)}
                                    </span>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-bold">
                                  {isLate
                                    ? "Overdue / Pending"
                                    : "Projected Payment"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Click to log payment
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Ahora sí se usa en la línea 170 y 216
function getCategoryColor(category: string) {
  switch (category) {
    case "Entertainment":
      return "#ef4444";
    case "Software":
      return "#3b82f6";
    case "Utilities":
      return "#f59e0b";
    case "Health":
      return "#10b981";
    default:
      return "#a1a1aa";
  }
}

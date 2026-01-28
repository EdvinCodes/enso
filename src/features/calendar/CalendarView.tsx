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
} from "date-fns";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Subscription, Payment } from "@/types"; // <--- Importamos Payment
import { getPaymentsForDay } from "@/lib/calendar-logic";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  subscriptions: Subscription[];
  payments: Payment[]; // <--- Recibimos pagos
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
            <div className="grid grid-cols-7 auto-rows-[120px]">
              {calendarDays.map((day) => {
                // 1. Proyecciones (Calculadas)
                const projectedPayments = getPaymentsForDay(subscriptions, day);

                // 2. Realidad (Logueada)
                const realPaymentsForDay = payments.filter((p) =>
                  isSameDay(parseISO(p.payment_date), day),
                );

                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isToday(day);

                return (
                  <div
                    key={day.toString()}
                    className={cn(
                      "relative border-b border-r border-border p-2 transition-colors hover:bg-muted/30 flex flex-col gap-1",
                      !isCurrentMonth && "bg-muted/10 opacity-40",
                      isTodayDate && "bg-primary/5",
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
                        isTodayDate
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground",
                        !isCurrentMonth && "text-muted-foreground",
                      )}
                    >
                      {format(day, "d")}
                    </span>

                    <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-1">
                      {/* A. Renderizamos PAGOS REALES primero */}
                      {realPaymentsForDay.map((p) => {
                        const sub = subscriptions.find(
                          (s) => s.id === p.subscription_id,
                        );
                        if (!sub) return null; // Si se borró la sub

                        return (
                          <div
                            key={p.id}
                            className={cn(
                              "flex items-center gap-1.5 border rounded px-2 py-1 shadow-sm",
                              p.status === "paid"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
                            )}
                          >
                            {p.status === "paid" ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                            <span className="text-[10px] font-bold truncate line-through decoration-emerald-500/0">
                              {sub.name}
                            </span>
                            <span className="text-[9px] ml-auto font-mono opacity-80">
                              {p.amount}€
                            </span>
                          </div>
                        );
                      })}

                      {/* B. Renderizamos PROYECCIONES (si no hay pago real ese día para esa sub) */}
                      {projectedPayments.map((sub) => {
                        // Truco: Si ya hay un pago real para esta suscripción en este mes, quizás no queramos mostrar la proyección para no duplicar.
                        // Pero por simplicidad en el calendario, mostramos la proyección como "Planificado".
                        // Si quieres ocultar la proyección si ya se pagó:
                        // const alreadyPaidThisMonth = payments.some(...)

                        return (
                          <TooltipProvider key={sub.id + "-proj"}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 bg-card border border-border rounded px-2 py-1 cursor-pointer hover:border-primary/50 transition-colors shadow-sm group opacity-70 border-dashed">
                                  <div
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{
                                      backgroundColor: getCategoryColor(
                                        sub.category,
                                      ),
                                    }}
                                  />
                                  <span className="text-[10px] font-medium text-foreground truncate group-hover:text-primary">
                                    {sub.name}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-bold">
                                  Projected: {sub.name}
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
      return "#71717a";
  }
}

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
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Subscription } from "@/types";
import { getPaymentsForDay } from "@/lib/calendar-logic";
import { convertToEur } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  subscriptions: Subscription[];
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarView({ subscriptions }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const monthlySpend = subscriptions.reduce((acc, sub) => {
    let price = convertToEur(sub.price, sub.currency);
    if (sub.billingCycle === "weekly") price *= 4;
    if (sub.billingCycle === "yearly") price /= 12;
    return acc + price;
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground capitalize">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <p className="text-muted-foreground text-sm">
            Total projected:{" "}
            {new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: "EUR",
            }).format(monthlySpend)}
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

      {/* Grid del Calendario con Scroll Horizontal en Móvil */}
      <Card className="bg-card/50 backdrop-blur-sm overflow-hidden border-border shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {" "}
            {/* Ancho mínimo para forzar estructura en móvil */}
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
                const payments = getPaymentsForDay(subscriptions, day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isToday(day);

                return (
                  <div
                    key={day.toString()}
                    className={cn(
                      "relative border-b border-r border-border p-2 transition-colors hover:bg-muted/30 flex flex-col gap-1",
                      !isCurrentMonth && "bg-muted/10 opacity-40", // Fondo sutil para días fuera de mes
                      isTodayDate && "bg-primary/5",
                    )}
                  >
                    {/* Número del día: ARREGLADO EL COLOR */}
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

                    {/* Lista de Pagos */}
                    <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-1">
                      {payments.map((sub) => (
                        <TooltipProvider key={sub.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5 bg-card border border-border rounded px-2 py-1 cursor-pointer hover:border-primary/50 transition-colors shadow-sm group">
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
                              <p className="font-bold">{sub.name}</p>
                              <p className="text-muted-foreground">
                                {new Intl.NumberFormat("es-ES", {
                                  style: "currency",
                                  currency: sub.currency,
                                }).format(sub.price)}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
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

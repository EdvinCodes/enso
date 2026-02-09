import { Subscription } from "@/types";
import { convertToEur } from "./currency";
import { addDays, format, isAfter, startOfDay } from "date-fns";

export interface ForecastDataPoint {
  date: string; // Usamos string ISO para serialización segura en Recharts
  label: string; // "Oct 12"
  amount: number; // Gasto diario
  accumulated: number; // Gasto acumulado
  items: string[]; // Nombres de los items
}

export function generateForecast(
  subscriptions: Subscription[],
  daysToForecast = 30,
): ForecastDataPoint[] {
  const today = startOfDay(new Date());
  const data: ForecastDataPoint[] = [];
  let accumulated = 0;

  // FILTRO CRÍTICO: Solo proyectamos gastos RECURRENTES activos.
  // Los gastos 'one_time' no se proyectan al futuro.
  const recurringSubs = subscriptions.filter(
    (sub) => sub.active && sub.billingCycle !== "one_time",
  );

  // Iteramos día a día
  for (let i = 0; i <= daysToForecast; i++) {
    const currentDate = addDays(today, i);
    let dailyTotal = 0;
    const dailyItems: string[] = [];

    recurringSubs.forEach((sub) => {
      const startDate = new Date(sub.startDate);
      // Normalizar precio a EUR
      const price = convertToEur(sub.price, sub.currency);

      if (doesSubscriptionHitDate(sub, startDate, currentDate)) {
        dailyTotal += price;
        dailyItems.push(sub.name);
      }
    });

    accumulated += dailyTotal;

    data.push({
      date: currentDate.toISOString(),
      label: format(currentDate, "MMM d"),
      amount: parseFloat(dailyTotal.toFixed(2)),
      accumulated: parseFloat(accumulated.toFixed(2)),
      items: dailyItems,
    });
  }

  return data;
}

// Lógica de recurrencia pura y dura
function doesSubscriptionHitDate(
  sub: Subscription,
  startDate: Date,
  targetDate: Date,
): boolean {
  // Si la fecha de inicio es futura respecto al target, no toca pagar aún
  if (isAfter(startOfDay(startDate), targetDate)) return false;

  const cycle = sub.billingCycle;

  if (cycle === "monthly") {
    // Toca el mismo día del mes (ej: día 15 de cada mes)
    return startDate.getDate() === targetDate.getDate();
  }

  if (cycle === "weekly") {
    // Toca cada 7 días exactos
    const diffTime = targetDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays % 7 === 0;
  }

  if (cycle === "yearly") {
    // Toca el mismo día y mes
    return (
      startDate.getDate() === targetDate.getDate() &&
      startDate.getMonth() === targetDate.getMonth()
    );
  }

  return false;
}

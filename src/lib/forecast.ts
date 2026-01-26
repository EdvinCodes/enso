import { Subscription } from "@/types";
import { addDays } from "date-fns";
import { convertToEur } from "./currency";
import { isPaymentDueOnDate } from "./dates"; // <--- Importamos del maestro

export interface DailyForecast {
  date: Date;
  label: string;
  amount: number;
  accumulated: number;
  items: string[];
}

export function generateForecast(
  subscriptions: Subscription[],
  days = 30,
): DailyForecast[] {
  const today = new Date();
  const forecast: DailyForecast[] = [];
  let currentAccumulated = 0;

  for (let i = 0; i < days; i++) {
    const currentDate = addDays(today, i);
    let dailyCost = 0;
    const itemsToday: string[] = [];

    subscriptions
      .filter((s) => s.active)
      .forEach((sub) => {
        // AQUÍ ESTÁ LA MAGIA: Usamos la misma lógica que el calendario
        if (isPaymentDueOnDate(sub, currentDate)) {
          const priceInEur = convertToEur(sub.price, sub.currency);
          dailyCost += priceInEur;
          itemsToday.push(sub.name);
        }
      });

    currentAccumulated += dailyCost;

    forecast.push({
      date: currentDate,
      label: currentDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      amount: dailyCost,
      accumulated: currentAccumulated,
      items: itemsToday,
    });
  }

  return forecast;
}

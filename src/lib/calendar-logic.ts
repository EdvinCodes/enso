import { Subscription } from "@/types";
import { isPaymentDueOnDate } from "./dates"; // <--- Importamos del maestro

export function getPaymentsForDay(
  subscriptions: Subscription[],
  day: Date,
): Subscription[] {
  return subscriptions.filter((sub) => {
    if (!sub.active) return false;
    // Usamos la función maestra que incluye la lógica del día 31
    return isPaymentDueOnDate(sub, day);
  });
}

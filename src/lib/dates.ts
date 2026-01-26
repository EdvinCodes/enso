import { Subscription } from "@/types";
import {
  addMonths,
  addYears,
  addWeeks,
  isBefore,
  startOfDay,
  getDay,
  getMonth,
  lastDayOfMonth,
  isSameDay,
} from "date-fns";

/**
 * 1. Calcula la PRÓXIMA fecha de cobro a partir de hoy.
 * Útil para: Tarjetas (Card) y Notificaciones.
 */
export function getNextPaymentDate(subscription: Subscription): Date {
  const startDate = new Date(subscription.startDate);
  const cycle = subscription.billingCycle;

  const today = startOfDay(new Date());
  let nextDate = startOfDay(startDate);

  // Si la fecha de inicio es futura, esa es la próxima fecha
  if (isBefore(today, nextDate)) {
    return nextDate;
  }

  // Si es pasada, sumamos ciclos hasta llegar al futuro
  while (isBefore(nextDate, today)) {
    if (cycle === "monthly") nextDate = addMonths(nextDate, 1);
    else if (cycle === "yearly") nextDate = addYears(nextDate, 1);
    else if (cycle === "weekly") nextDate = addWeeks(nextDate, 1);
  }

  return nextDate;
}

/**
 * 2. Comprueba si una suscripción se cobra en una fecha específica.
 * Útil para: Calendario y Forecast.
 * NOTA: Aquí he integrado TU lógica robusta de fin de mes.
 */
export function isPaymentDueOnDate(
  subscription: Subscription,
  dateToCheck: Date,
): boolean {
  const start = startOfDay(new Date(subscription.startDate));
  const currentDay = startOfDay(dateToCheck);

  // Si la fecha a comprobar es anterior al inicio de la suscripción, no se cobra
  if (currentDay < start && !isSameDay(currentDay, start)) return false;

  const dayOfMonthToCheck = currentDay.getDate();
  const startDay = start.getDate();

  switch (subscription.billingCycle) {
    case "monthly":
      // CASO A: Es el mismo día del mes
      if (dayOfMonthToCheck === startDay) return true;

      // CASO B: Manejo de fin de mes (Tu lógica PRO)
      // Ejemplo: Suscripción el día 31, pero estamos en Febrero (acaba en 28)
      const lastDayOfCurrentMonth = lastDayOfMonth(currentDay).getDate();
      if (
        startDay > lastDayOfCurrentMonth &&
        dayOfMonthToCheck === lastDayOfCurrentMonth
      ) {
        return true;
      }
      return false;

    case "yearly":
      // Mismo día y mismo mes
      return (
        dayOfMonthToCheck === startDay &&
        getMonth(currentDay) === getMonth(start)
      );

    case "weekly":
      // Mismo día de la semana (0 = Domingo...)
      return getDay(currentDay) === getDay(start);

    default:
      return false;
  }
}

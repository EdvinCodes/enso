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
 * Calcula la PRÓXIMA fecha de cobro.
 * @param strictFuture Si es true, ignora el día de hoy y busca la siguiente fecha futura.
 */
export function getNextPaymentDate(
  subscription: Subscription,
  strictFuture = false,
): Date {
  const startDate = new Date(subscription.startDate);
  const cycle = subscription.billingCycle;

  const today = startOfDay(new Date());
  let nextDate = startOfDay(startDate);

  // Lógica de avance: Sumamos ciclos mientras la fecha sea anterior a hoy
  // Si strictFuture es true, TAMBIÉN avanzamos si es HOY (para ver el mes que viene)
  const shouldAdvance = (date: Date) => {
    if (strictFuture) {
      return isBefore(date, today) || isSameDay(date, today);
    }
    return isBefore(date, today);
  };

  while (shouldAdvance(nextDate)) {
    if (cycle === "monthly") nextDate = addMonths(nextDate, 1);
    else if (cycle === "yearly") nextDate = addYears(nextDate, 1);
    else if (cycle === "weekly") nextDate = addWeeks(nextDate, 1);
  }

  return nextDate;
}

export function isPaymentDueOnDate(
  subscription: Subscription,
  dateToCheck: Date,
): boolean {
  const start = startOfDay(new Date(subscription.startDate));
  const currentDay = startOfDay(dateToCheck);

  if (currentDay < start && !isSameDay(currentDay, start)) return false;

  const dayOfMonthToCheck = currentDay.getDate();
  const startDay = start.getDate();

  switch (subscription.billingCycle) {
    case "monthly":
      if (dayOfMonthToCheck === startDay) return true;
      const lastDayOfCurrentMonth = lastDayOfMonth(currentDay).getDate();
      if (
        startDay > lastDayOfCurrentMonth &&
        dayOfMonthToCheck === lastDayOfCurrentMonth
      ) {
        return true;
      }
      return false;
    case "yearly":
      return (
        dayOfMonthToCheck === startDay &&
        getMonth(currentDay) === getMonth(start)
      );
    case "weekly":
      return getDay(currentDay) === getDay(start);
    default:
      return false;
  }
}

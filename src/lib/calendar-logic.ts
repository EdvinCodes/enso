import { Subscription } from "@/types";
import {  getMonth, lastDayOfMonth, isSameDay, getDay } from "date-fns";

/**
 * Determina si una suscripción se cobra en un día específico.
 */
export function isPaymentDue(subscription: Subscription, currentDay: Date): boolean {
  const start = new Date(subscription.startDate);
  
  // Si la suscripción empieza en el futuro, no se cobra hoy
  if (currentDay < start && !isSameDay(currentDay, start)) return false;

  const dayOfMonthToCheck = currentDay.getDate();
  const startDay = start.getDate();

  switch (subscription.billingCycle) {
    case 'monthly':
      // CASO 1: Es el mismo día del mes (ej: 15 de Enero -> 15 de Febrero)
      if (dayOfMonthToCheck === startDay) return true;
      
      // CASO 2: Manejo de fin de mes (ej: Suscripción el día 31, pero Febrero tiene 28)
      // Si el día de inicio es mayor que el último día de este mes, 
      // y hoy ES el último día de este mes, entonces se cobra hoy.
      const lastDayOfCurrentMonth = lastDayOfMonth(currentDay).getDate();
      if (startDay > lastDayOfCurrentMonth && dayOfMonthToCheck === lastDayOfCurrentMonth) {
        return true;
      }
      return false;

    case 'yearly':
      // Mismo día y mismo mes
      return dayOfMonthToCheck === startDay && getMonth(currentDay) === getMonth(start);

    case 'weekly':
      // Mismo día de la semana (0 = Domingo, 1 = Lunes...)
      return getDay(currentDay) === getDay(start);

    default:
      return false;
  }
}

/**
 * Obtiene todas las suscripciones que se cobran en un día dado
 */
export function getPaymentsForDay(subscriptions: Subscription[], date: Date): Subscription[] {
  return subscriptions.filter(sub => isPaymentDue(sub, date));
}
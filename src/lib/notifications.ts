import { Subscription } from "@/types";
import {
  differenceInDays,
  addMonths,
  addYears,
  addWeeks,
  isBefore,
  startOfDay,
} from "date-fns";

/**
 * Pide permiso al navegador para enviar notificaciones.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

/**
 * Lanza una notificación nativa
 */
export function sendNotification(title: string, body: string, icon?: string) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: icon || "/icons/icon-192.png", // Actualizado a la ruta de tu PWA
      silent: false,
    });
  }
}

/**
 * FUNCIÓN AUXILIAR: Calcula la próxima fecha real de pago
 * (La misma lógica que pusimos en la Card)
 */
function getRealNextPaymentDate(startDate: Date | string, cycle: string): Date {
  const today = startOfDay(new Date());
  let nextDate = startOfDay(new Date(startDate));

  // Si la fecha es anterior a hoy, sumamos ciclos hasta alcanzar el futuro
  while (isBefore(nextDate, today)) {
    if (cycle === "monthly") nextDate = addMonths(nextDate, 1);
    else if (cycle === "yearly") nextDate = addYears(nextDate, 1);
    else if (cycle === "weekly") nextDate = addWeeks(nextDate, 1);
  }
  return nextDate;
}

/**
 * Filtra las suscripciones que vencen pronto (ej: en 3 días)
 */
export function getUpcomingRenewals(
  subscriptions: Subscription[],
  daysThreshold = 3,
): Subscription[] {
  const today = startOfDay(new Date());

  return subscriptions.filter((sub) => {
    // 1. Calculamos la fecha REAL del próximo pago
    const nextPayment = getRealNextPaymentDate(
      sub.nextPaymentDate,
      sub.billingCycle,
    );

    // 2. Calculamos la diferencia con la fecha proyectada
    const daysLeft = differenceInDays(nextPayment, today);

    // 3. Devolvemos las que vencen hoy (0) o pronto (<= threshold)
    return daysLeft >= 0 && daysLeft <= daysThreshold;
  });
}

/**
 * Sistema Anti-Spam: Comprueba en LocalStorage si ya notificamos HOY
 */
export function hasNotifiedToday(): boolean {
  if (typeof window === "undefined") return false; // Safety check para SSR
  const last = localStorage.getItem("enso_last_notification_date");
  const today = new Date().toDateString();
  return last === today;
}

export function markAsNotifiedToday() {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    "enso_last_notification_date",
    new Date().toDateString(),
  );
}

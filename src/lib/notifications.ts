import { Subscription } from "@/types";
import { getNextPaymentDate } from "@/lib/dates";
import {
  differenceInDays,
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
 * Filtra las suscripciones que vencen pronto (ej: en 3 días)
 */
export function getUpcomingRenewals(
  subscriptions: Subscription[],
  daysThreshold = 3,
): Subscription[] {
  const today = startOfDay(new Date());

  return subscriptions.filter((sub) => {
    const nextPayment = getNextPaymentDate(sub);
    const daysLeft = differenceInDays(nextPayment, today);

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

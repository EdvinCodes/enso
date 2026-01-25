import { Subscription } from "@/types";
import { differenceInDays } from "date-fns";

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
      icon: icon || "/icon.png", // Puedes poner el logo de ENSO aquí
      silent: false,
    });
  }
}

/**
 * Filtra las suscripciones que vencen pronto (ej: en 3 días)
 */
export function getUpcomingRenewals(subscriptions: Subscription[], daysThreshold = 3): Subscription[] {
  const today = new Date();
  
  return subscriptions.filter(sub => {
    // Calculamos días restantes
    const daysLeft = differenceInDays(new Date(sub.nextPaymentDate), today);
    
    // Devolvemos las que están entre 0 (hoy) y el umbral (3 días)
    return daysLeft >= 0 && daysLeft <= daysThreshold;
  });
}

/**
 * Sistema Anti-Spam: Comprueba en LocalStorage si ya notificamos HOY
 */
export function hasNotifiedToday(): boolean {
  const last = localStorage.getItem("enso_last_notification_date");
  const today = new Date().toDateString();
  return last === today;
}

export function markAsNotifiedToday() {
  localStorage.setItem("enso_last_notification_date", new Date().toDateString());
}
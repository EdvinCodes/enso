import { useEffect } from "react";
import { Subscription } from "@/types";
import { 
  getUpcomingRenewals, 
  hasNotifiedToday, 
  markAsNotifiedToday, 
  sendNotification, 
} from "@/lib/notifications";

export function useSmartNotifications(subscriptions: Subscription[]) {
  useEffect(() => {
    // 1. Si no hay suscripciones o ya avisamos hoy, no hacemos nada.
    if (subscriptions.length === 0) return;
    if (hasNotifiedToday()) return;

    // 2. Comprobamos si tenemos permiso
    if (Notification.permission !== "granted") {
      // Opcional: Podríamos pedirlo aquí, pero es mejor hacerlo con un botón de usuario
      // para no ser intrusivos nada más entrar.
      return;
    }

    // 3. Buscamos renovaciones próximas (3 días)
    const upcoming = getUpcomingRenewals(subscriptions, 3);

    if (upcoming.length > 0) {
      // Estrategia: Si hay 1, decimos el nombre. Si hay varias, decimos "X pagos".
      const firstSub = upcoming[0];
      const count = upcoming.length;

      const title = count === 1 
        ? `Upcoming Payment: ${firstSub.name}`
        : `${count} Upcoming Payments`;
      
      const body = count === 1
        ? `You will be charged ${firstSub.price} ${firstSub.currency} soon. Click to manage.`
        : `Check ENSO to verify your upcoming expenses for this week.`;

      // 4. Disparamos y marcamos
      sendNotification(title, body);
      markAsNotifiedToday();
    }
  }, [subscriptions]);
}
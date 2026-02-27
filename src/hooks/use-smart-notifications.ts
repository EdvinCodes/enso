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
    if (subscriptions.length === 0) return;
    if (hasNotifiedToday()) return;

    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const upcoming = getUpcomingRenewals(subscriptions, 3);
    if (upcoming.length === 0) return;

    const firstSub = upcoming[0];
    const count = upcoming.length;
    const title =
      count === 1
        ? `Upcoming Payment: ${firstSub.name}`
        : `${count} Upcoming Payments`;
    const body =
      count === 1
        ? `You will be charged ${firstSub.price} ${firstSub.currency} soon.`
        : `Check ENSO to verify your upcoming expenses for this week.`;

    sendNotification(title, body);
    markAsNotifiedToday();
  }, [subscriptions]);
}

"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, CalendarClock, Pencil, CheckCircle2 } from "lucide-react";
import { Subscription } from "@/types";
import { cn } from "@/lib/utils";
import { differenceInDays, startOfDay } from "date-fns";
import { getNextPaymentDate } from "@/lib/dates";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription.store";

interface Props {
  subscription: Subscription;
  onDelete: (id: string) => void;
  onLogPayment: (sub: Subscription) => void;
}

export function SubscriptionCard({
  subscription,
  onDelete,
  onLogPayment,
}: Props) {
  const { openModal } = useSubscriptionStore();

  // Calcular días restantes
  const nextPayment = getNextPaymentDate(subscription, true);
  const daysUntil = differenceInDays(nextPayment, startOfDay(new Date()));

  // Lógica de colores semánticos
  const urgencyColor =
    daysUntil <= 3
      ? "bg-red-500"
      : daysUntil <= 7
        ? "bg-amber-500"
        : "bg-primary";

  const borderColor = daysUntil <= 3 ? "border-red-500/50" : "border-border";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border bg-card/60 backdrop-blur-xl transition-all duration-300",
        "hover:bg-accent/50 hover:shadow-md",
        borderColor,
      )}
      onClick={() => openModal(subscription)} // Clic en toda la tarjeta abre detalle
    >
      {/* Indicador lateral de urgencia */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 transition-colors",
          urgencyColor,
        )}
      />

      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-5">
        {/* IZQUIERDA: Info Principal */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-muted border border-border flex items-center justify-center shadow-sm shrink-0 font-bold text-lg">
            {subscription.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 space-y-0.5">
            <h3 className="font-semibold text-foreground truncate text-base leading-tight">
              {subscription.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="truncate max-w-[100px]">
                {subscription.category}
              </span>
              <span>•</span>
              <span className="capitalize">{subscription.billingCycle}</span>
            </div>
          </div>
        </div>

        {/* DERECHA: Datos Financieros y Acciones */}
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
          {/* Precio y Tiempo */}
          <div className="text-left sm:text-right">
            <div className="font-mono text-lg font-bold text-foreground leading-none">
              {new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: subscription.currency,
              }).format(subscription.price)}
            </div>
            <div
              className={cn(
                "flex items-center sm:justify-end gap-1.5 text-xs mt-1 font-medium",
                daysUntil <= 3 ? "text-red-500" : "text-muted-foreground",
              )}
            >
              <CalendarClock className="w-3 h-3" />
              <span>
                {daysUntil === 0 ? "Due Today!" : `${daysUntil} days left`}
              </span>
            </div>
          </div>

          {/* Botones de Acción (Visibles en hover desktop, siempre en móvil) */}
          <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
              onClick={(e) => {
                e.stopPropagation();
                onLogPayment(subscription);
              }}
              title="Log Payment"
            >
              <CheckCircle2 className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation();
                openModal(subscription);
              }}
            >
              <Pencil className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(subscription.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Barra de progreso sutil */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-muted w-full opacity-50">
        <div
          className={cn("h-full transition-all duration-1000", urgencyColor)}
          style={{ width: `${Math.max(5, 100 - (daysUntil / 30) * 100)}%` }}
        />
      </div>
    </Card>
  );
}

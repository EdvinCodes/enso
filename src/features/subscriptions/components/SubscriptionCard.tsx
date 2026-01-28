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

  const nextPayment = getNextPaymentDate(subscription, true);
  const daysUntil = differenceInDays(nextPayment, startOfDay(new Date()));

  // Colores semánticos
  const urgencyColor =
    daysUntil <= 3
      ? "bg-red-500"
      : daysUntil <= 7
        ? "bg-amber-500"
        : "bg-primary";

  const glowColor = daysUntil <= 3 ? "shadow-red-500/20" : "shadow-primary/20";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border bg-card/60 backdrop-blur-xl transition-all duration-300",
        "hover:border-primary/30 hover:bg-accent/50 hover:-translate-y-1 shadow-sm hover:shadow-md",
        glowColor,
      )}
    >
      {/* Indicador lateral de color */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", urgencyColor)} />

      {/* CONTENEDOR PRINCIPAL: Flex columna en móvil, Fila en PC */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* IZQUIERDA: Logo + Nombre + Detalles */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Logo / Inicial */}
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-muted border border-border flex items-center justify-center shadow-sm shrink-0">
            <span className="text-lg sm:text-xl font-bold text-foreground tracking-tighter">
              {subscription.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="space-y-1 min-w-0">
            <h3 className="font-semibold text-foreground text-base sm:text-lg leading-none tracking-tight truncate">
              {subscription.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <span className="bg-muted px-2 py-0.5 rounded text-[10px] border border-border whitespace-nowrap">
                {subscription.category}
              </span>
              <span className="hidden xs:inline">•</span>
              <span className="truncate">{subscription.billingCycle}</span>
            </div>
          </div>
        </div>

        {/* DERECHA: Precio + Botones (En móvil va debajo) */}
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
          {/* Precio y Días (Ahora visible siempre) */}
          <div className="text-left sm:text-right">
            <div className="font-mono text-lg sm:text-xl font-bold text-foreground tracking-tight">
              {new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: subscription.currency,
              }).format(subscription.price)}
            </div>
            <div className="flex items-center sm:justify-end gap-1.5 text-xs text-muted-foreground mt-0.5">
              <CalendarClock className="w-3 h-3" />
              <span>{daysUntil} days left</span>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex items-center gap-1">
            {/* REGISTRAR PAGO */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
              onClick={(e) => {
                e.stopPropagation();
                onLogPayment(subscription);
              }}
              title="Log Payment"
            >
              <CheckCircle2 className="w-5 h-5" />
            </Button>

            {/* EDITAR */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation();
                openModal(subscription);
              }}
            >
              <Pencil className="w-4 h-4" />
            </Button>

            {/* BORRAR */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
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

      {/* Barra de progreso inferior */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-muted w-full">
        <div
          className={cn("h-full transition-all duration-1000", urgencyColor)}
          style={{ width: `${Math.max(5, 100 - (daysUntil / 30) * 100)}%` }}
        />
      </div>
    </Card>
  );
}

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, CalendarClock, Pencil } from "lucide-react";
import { Subscription } from "@/types";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";
import { useSubscriptionStore } from "../store/subscription.store"; // Importamos el store

interface Props {
  subscription: Subscription;
  onDelete: (id: string) => void;
}

export function SubscriptionCard({ subscription, onDelete }: Props) {
  const { openModal } = useSubscriptionStore(); // Acción global para abrir el modal

  const today = new Date();
  const daysUntil = differenceInDays(
    new Date(subscription.nextPaymentDate),
    today,
  );

  // Colores semánticos de estado (estos no cambian por tema, son indicadores)
  const urgencyColor =
    daysUntil <= 3
      ? "bg-red-500"
      : daysUntil <= 7
        ? "bg-yellow-500"
        : "bg-primary";
  const glowColor = daysUntil <= 3 ? "shadow-red-500/20" : "shadow-primary/20";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border bg-card/60 backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:bg-accent/50 hover:-translate-y-1",
        "shadow-sm hover:shadow-md",
        glowColor,
      )}
    >
      {/* Indicador lateral de color */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", urgencyColor)} />

      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo / Inicial */}
          <div className="h-12 w-12 rounded-xl bg-muted border border-border flex items-center justify-center shadow-sm">
            <span className="text-xl font-bold text-foreground tracking-tighter">
              {subscription.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-foreground text-lg leading-none tracking-tight">
              {subscription.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <span className="bg-muted px-2 py-0.5 rounded text-[10px] border border-border">
                {subscription.category}
              </span>
              <span>•</span>
              <span>{subscription.billingCycle}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className="font-mono text-xl font-bold text-foreground tracking-tight">
              {new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: subscription.currency,
              }).format(subscription.price)}
            </div>
            <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground mt-1">
              <CalendarClock className="w-3 h-3" />
              <span>{daysUntil} days left</span>
            </div>
          </div>

          <div className="flex items-center">
            {/* BOTÓN EDITAR: Llama al modal global */}
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => openModal(subscription)}
            >
              <Pencil className="w-4 h-4" />
            </Button>

            {/* BOTÓN BORRAR */}
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
              onClick={() => onDelete(subscription.id)}
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
          style={{ width: `${Math.max(5, 100 - daysUntil * 3)}%` }}
        />
      </div>
    </Card>
  );
}

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, CalendarClock } from "lucide-react";
import { Subscription } from "@/types";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";

interface Props {
  subscription: Subscription;
  onDelete: (id: string) => void;
}

export function SubscriptionCard({ subscription, onDelete }: Props) {
  // Lógica visual: Calcular porcentaje del mes/año transcurrido
  const today = new Date();
  const daysUntil = differenceInDays(
    new Date(subscription.nextPaymentDate),
    today,
  );

  // Color dinámico según urgencia
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
        "group relative overflow-hidden border-zinc-800 bg-zinc-900/40 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/60 hover:-translate-y-1",
        "shadow-lg",
        glowColor,
      )}
    >
      {/* Barra lateral de estado */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", urgencyColor)} />

      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Icono / Inicial con estilo Glass */}
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center shadow-inner">
            <span className="text-xl font-bold text-white tracking-tighter">
              {subscription.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-zinc-100 text-lg leading-none tracking-tight">
              {subscription.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium uppercase tracking-wider">
              <span className="bg-zinc-800/80 px-2 py-0.5 rounded text-[10px] border border-zinc-700/50">
                {subscription.category}
              </span>
              <span>•</span>
              <span>{subscription.billingCycle}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="font-mono text-xl font-bold text-white tracking-tight">
              {new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: subscription.currency,
              }).format(subscription.price)}
            </div>
            <div className="flex items-center justify-end gap-1.5 text-xs text-zinc-400 mt-1">
              <CalendarClock className="w-3 h-3" />
              <span>{daysUntil} days left</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
            onClick={() => onDelete(subscription.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Micro-interacción: Barra de progreso sutil en el fondo */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-zinc-800 w-full">
        {/* Simulamos progreso inverso (cuanto menos queda, más llena) */}
        <div
          className={cn("h-full transition-all duration-1000", urgencyColor)}
          style={{ width: `${Math.max(5, 100 - daysUntil * 3)}%` }}
        />
      </div>
    </Card>
  );
}

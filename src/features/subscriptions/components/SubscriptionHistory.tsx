"use client";

import { useSubscriptionStore } from "@/features/subscriptions/store/subscription.store";
import { Subscription, Currency } from "@/types";
import { format } from "date-fns";
import {
  Trash2,
  FileText,
  TrendingUp,
  TrendingDown,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  subscription: Subscription;
}

export function SubscriptionHistory({ subscription }: Props) {
  const { payments, deletePayment } = useSubscriptionStore();

  // Filtramos y ordenamos: Lo más reciente arriba
  const history = payments
    .filter((p) => p.subscription_id === subscription.id)
    .sort(
      (a, b) =>
        new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime(),
    );

  // Función de borrado directa y robusta
  const handleDelete = async (id: string) => {
    // Usamos toast.promise para feedback visual inmediato
    toast.promise(deletePayment(id), {
      loading: "Deleting record...",
      success: "Payment removed from history",
      error: "Could not delete payment",
    });
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground border border-dashed border-border rounded-xl bg-muted/20 m-1">
        <History className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-sm font-medium">No history yet</p>
        <p className="text-xs opacity-60 text-center max-w-[180px]">
          Confirm a payment to see it appear here.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[350px] pr-4 -mr-4 pl-1">
      <div className="space-y-6 pt-2 pb-6">
        {history.map((payment, index) => {
          // Análisis de precio
          const diff = payment.amount - subscription.price;
          const isHigher = diff > 0.01;
          const isLower = diff < -0.01;
          const isSkipped = payment.status === "skipped";

          return (
            <div key={payment.id} className="relative pl-8 group">
              {/* LÍNEA DE TIEMPO (Vertical Line) */}
              {/* Si no es el último, dibujamos línea hacia abajo */}
              {index !== history.length - 1 && (
                <div className="absolute left-[11px] top-3 bottom-[-24px] w-[2px] bg-border/50 group-hover:bg-border transition-colors" />
              )}

              {/* BOLITA (Dot) */}
              <div
                className={cn(
                  "absolute left-[7px] top-[6px] w-2.5 h-2.5 rounded-full ring-4 ring-background transition-all",
                  isSkipped ? "bg-amber-500" : "bg-emerald-500",
                  "group-hover:scale-110",
                )}
              />

              {/* TARJETA DE PAGO */}
              <div className="flex justify-between items-start bg-card/40 p-3 rounded-xl border border-border/60 hover:bg-accent/30 hover:border-border transition-all shadow-sm">
                <div className="space-y-1.5 w-full">
                  {/* FECHA Y ESTADO */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {format(new Date(payment.payment_date), "MMM do, yyyy")}
                    </span>
                    {isSkipped && (
                      <span className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold border border-amber-500/20">
                        SKIPPED
                      </span>
                    )}
                  </div>

                  {/* PRECIO */}
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-lg font-bold font-mono tracking-tight",
                        isSkipped
                          ? "text-muted-foreground line-through opacity-50"
                          : "text-foreground",
                      )}
                    >
                      {formatCurrency(
                        payment.amount,
                        payment.currency as Currency,
                      )}
                    </span>

                    {/* Variación de precio (Solo si no es skipped) */}
                    {!isSkipped && (
                      <>
                        {isHigher && (
                          <span className="text-[10px] text-red-500 font-medium bg-red-500/10 px-1.5 py-0.5 rounded flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" /> +
                            {formatCurrency(diff, payment.currency as Currency)}
                          </span>
                        )}
                        {isLower && (
                          <span className="text-[10px] text-emerald-500 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center">
                            <TrendingDown className="w-3 h-3 mr-1" />{" "}
                            {formatCurrency(diff, payment.currency as Currency)}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* NOTAS */}
                  {payment.notes && (
                    <div className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md border border-border/30 flex gap-2 items-start">
                      <FileText className="w-3 h-3 mt-0.5 opacity-50 shrink-0" />
                      <span className="italic line-clamp-2">
                        &quot;{payment.notes}&quot;
                      </span>
                    </div>
                  )}
                </div>

                {/* BOTÓN BORRAR (Visible en Hover) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 hover:bg-red-500/10 -mr-1 -mt-1 ml-2"
                  onClick={() => handleDelete(payment.id)}
                  title="Remove this log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

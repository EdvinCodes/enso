"use client";

import { useState } from "react";
import { Subscription } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";
import { convertToEur } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { SubscriptionCard } from "@/features/subscriptions/components/SubscriptionCard";

interface Props {
  category: string;
  subscriptions: Subscription[];
  onDelete: (id: string) => void;
  onLogPayment: (sub: Subscription) => void;
}

export function SubscriptionStack({
  category,
  subscriptions,
  onDelete,
  onLogPayment,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const stackTotal = subscriptions.reduce((acc, sub) => {
    let price = convertToEur(sub.price, sub.currency);
    if (sub.billingCycle === "yearly") price /= 12;
    if (sub.billingCycle === "weekly") price *= 4;
    return acc + price;
  }, 0);

  const categoryColor = getCategoryColor(category);

  return (
    <div className="space-y-2 w-full max-w-full">
      {/* --- HEADER DEL STACK --- */}
      <Card
        className={cn(
          "relative overflow-hidden cursor-pointer transition-all duration-300 border-l-4 hover:shadow-md",
          isOpen ? "bg-muted/50" : "bg-card hover:bg-accent/50",
        )}
        style={{ borderLeftColor: categoryColor }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="p-3 sm:p-4 flex items-center justify-between gap-2">
          {/* IZQUIERDA: Icono + Título (Responsive) */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0"
              style={{ backgroundColor: categoryColor }}
            >
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 overflow-hidden">
              <h3 className="font-bold text-foreground text-base sm:text-lg truncate">
                {category}
              </h3>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">
                {subscriptions.length}{" "}
                {subscriptions.length === 1 ? "Item" : "Items"}
              </p>
            </div>
          </div>

          {/* DERECHA: Precio + Flecha */}
          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            <div className="text-right">
              <div className="font-mono text-base sm:text-lg font-bold text-foreground">
                {new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0, // En resumen quitamos decimales para ahorrar espacio
                }).format(stackTotal)}
                <span className="text-[10px] sm:text-xs text-muted-foreground font-sans font-normal ml-0.5 sm:ml-1">
                  /mo
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground h-8 w-8 sm:h-9 sm:w-9 shrink-0"
            >
              {isOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* --- CONTENIDO DEL STACK --- */}
      {isOpen && (
        // Ajustamos padding-left (pl) y margin-left (ml) para que no coma tanto espacio en móvil
        <div className="pl-1 sm:pl-4 space-y-3 border-l-2 border-dashed border-border/50 ml-2 sm:ml-4 animate-in slide-in-from-top-2 fade-in duration-300 pr-1">
          {subscriptions.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              onDelete={onDelete}
              onLogPayment={onLogPayment}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getCategoryColor(category: string) {
  switch (category) {
    case "Entertainment":
      return "#ef4444";
    case "Software":
      return "#3b82f6";
    case "Utilities":
      return "#f59e0b";
    case "Health":
      return "#10b981";
    default:
      return "#8b5cf6";
  }
}

"use client";

import { useSubscriptionStore } from "@/features/subscriptions/store/subscription.store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubscriptionCategory } from "@/types";
import { Calculator } from "lucide-react";

const CATEGORIES: SubscriptionCategory[] = [
  "Entertainment",
  "Software",
  "Utilities",
  "Health",
  "Other",
];

export function BudgetsManager() {
  const { budgets, setCategoryBudget } = useSubscriptionStore();

  return (
    <Card className="p-6 bg-card/40 border-border backdrop-blur-md">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
          <Calculator className="w-6 h-6" />
        </div>
        <div className="space-y-1 flex-1">
          <h3 className="text-lg font-semibold text-foreground">
            Smart Budgets
          </h3>
          {/* FIX: Usamos &apos; para evitar el error de ESLint */}
          <p className="text-sm text-muted-foreground">
            Set monthly spending limits. We&apos;ll show progress bars in your
            dashboard.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => (
          <div
            key={cat}
            className="space-y-2 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50"
          >
            <Label className="text-xs font-semibold text-foreground/80">
              {cat}
            </Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="No limit"
                value={budgets[cat] || ""}
                onChange={(e) =>
                  setCategoryBudget(cat, parseFloat(e.target.value))
                }
                className="pl-8 bg-background/50 border-border focus-visible:ring-emerald-500/50"
              />
              <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-mono">
                €
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

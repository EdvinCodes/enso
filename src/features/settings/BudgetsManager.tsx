"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PiggyBank, Save, RotateCcw } from "lucide-react";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription.store";
import { SubscriptionCategory } from "@/types";
import { toast } from "sonner";

const CATEGORIES: SubscriptionCategory[] = [
  "Entertainment",
  "Software",
  "Utilities",
  "Health",
  "Other",
];

export function BudgetsManager() {
  // 1. CORRECCIÓN NOMBRE: Usamos 'updateBudget' que es como se llama en tu store
  const { budgets, updateBudget } = useSubscriptionStore();

  const [localBudgets, setLocalBudgets] =
    useState<Record<string, number>>(budgets);
  const [hasChanges, setHasChanges] = useState(false);

  // 2. CORRECCIÓN USE EFFECT (Cascading Renders Fix):
  // Comparamos el contenido (JSON) en lugar de la referencia del objeto.
  // Solo actualizamos si NO hay cambios pendientes por el usuario Y los datos son distintos.
  useEffect(() => {
    const storeBudgetsStr = JSON.stringify(budgets);
    const localBudgetsStr = JSON.stringify(localBudgets);

    if (!hasChanges && storeBudgetsStr !== localBudgetsStr) {
      setLocalBudgets(budgets);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgets, hasChanges]);
  // Quitamos localBudgets del array de dependencias para evitar el bucle,
  // ya que lo controlamos con la comparación JSON.

  const handleInputChange = (category: string, value: string) => {
    // Permitir borrar el input (string vacío)
    if (value === "") {
      setLocalBudgets((prev) => ({ ...prev, [category]: 0 }));
      setHasChanges(true);
      return;
    }

    const numValue = parseFloat(value);
    setLocalBudgets((prev) => ({
      ...prev,
      [category]: isNaN(numValue) ? 0 : numValue,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    toast.promise(
      async () => {
        // Guardamos cada categoría
        const promises = CATEGORIES.map(async (cat) => {
          const limit = localBudgets[cat] || 0;
          // Solo llamamos a la API si el valor es diferente al del store
          if (limit !== budgets[cat]) {
            await updateBudget(cat, limit);
          }
        });
        await Promise.all(promises);
      },
      {
        loading: "Saving budgets...",
        success: "Spending limits updated successfully!",
        error: "Failed to save budgets.",
      },
    );
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalBudgets(budgets);
    setHasChanges(false);
    toast.info("Changes discarded");
  };

  return (
    <Card className="p-6 bg-card/40 border-border backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">
              Smart Budgets
            </h3>
            <p className="text-sm text-muted-foreground">
              Set monthly spending limits for each category.
            </p>
          </div>
        </div>

        {hasChanges && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
            <Button size="sm" onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {CATEGORIES.map((category) => (
          <div key={category} className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {category}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono pointer-events-none">
                €
              </span>
              <Input
                type="number"
                min="0"
                step="10"
                placeholder="0.00"
                className="pl-7 bg-background/50 border-border focus-visible:ring-amber-500"
                value={
                  localBudgets[category] === 0 ? "" : localBudgets[category]
                }
                onChange={(e) => handleInputChange(category, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

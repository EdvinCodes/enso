"use client";

import { useEffect } from "react";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription.store";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArchiveRestore, Ghost } from "lucide-react";

export function ArchiveManager() {
  const {
    archivedSubscriptions,
    fetchArchivedSubscriptions,
    restoreSubscription,
  } = useSubscriptionStore();

  useEffect(() => {
    fetchArchivedSubscriptions();
  }, [fetchArchivedSubscriptions]);

  if (archivedSubscriptions.length === 0) {
    return (
      <Card className="p-8 border-dashed border-border/50 bg-muted/10 flex flex-col items-center justify-center text-muted-foreground gap-3">
        <Ghost className="w-8 h-8 opacity-50" />
        <p className="text-sm">No archived subscriptions found.</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card/40 border-border backdrop-blur-md">
      <div className="space-y-2">
        {archivedSubscriptions.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/30 transition-colors"
          >
            <div>
              <p className="font-medium text-foreground">{sub.name}</p>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span className="font-mono">
                  {formatCurrency(sub.price, sub.currency)}
                </span>
                <span>•</span>
                <span className="capitalize">{sub.billingCycle}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => restoreSubscription(sub.id)}
              className="gap-2 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/30"
            >
              <ArchiveRestore className="w-4 h-4" /> Restore
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

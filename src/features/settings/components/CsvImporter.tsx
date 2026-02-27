"use client";

import { useState } from "react";
import { Upload, Check, Loader2, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { parseAndDetect, DetectedSubscription } from "@/lib/csv-logic";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription.store";
import { PRESET_SERVICES } from "@/lib/constants";
import { formatCurrency } from "@/lib/currency";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SubscriptionCategory } from "@/types";
import { toast } from "sonner";

export function CsvImporter() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedItems, setDetectedItems] = useState<DetectedSubscription[]>(
    [],
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { bulkAddSubscriptions } = useSubscriptionStore();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    // 1. Feedback inmediato de carga
    const toastId = toast.loading("Analyzing bank statement...");

    try {
      const results = await parseAndDetect(file);
      setDetectedItems(results);
      // Por defecto seleccionamos todas
      setSelectedIds(new Set(results.map((i) => i.id)));

      // 2. Éxito: Dismiss loading y mostrar resultado
      toast.dismiss(toastId);
      toast.success("Analysis complete", {
        description: `Found ${results.length} potential subscriptions.`,
      });
    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error("Parsing failed", {
        description: "Please check if the CSV format is valid.",
      });
    } finally {
      setIsProcessing(false);
      // Limpiamos el input para permitir resubir el mismo archivo si falló
      e.target.value = "";
    }
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleImport = async () => {
    const toImport = detectedItems.filter((item) => selectedIds.has(item.id));

    if (toImport.length === 0) {
      toast.warning("No items selected");
      return;
    }

    // 3. Importación con Promise Toast usando Bulk Insert
    toast.promise(
      async () => {
        // Mapeamos los items seleccionados a objetos de suscripción
        const subscriptionsToCreate = toImport.map((item) => {
          const preset = PRESET_SERVICES.find((p) => p.name === item.name);

          return {
            name: item.name,
            price: item.price,
            currency: item.currency,
            startDate: new Date(), // Empieza hoy por defecto
            billingCycle: "monthly" as const,
            category: preset
              ? (preset.category as SubscriptionCategory)
              : "Other",
            workspace: "personal" as const,
          };
        });

        // Hacemos UNA SOLA llamada a Supabase en lugar de un bucle for...of
        await bulkAddSubscriptions(subscriptionsToCreate);
      },
      {
        loading: "Importing to your dashboard...",
        success: `Successfully added ${toImport.length} subscriptions! 🎉`,
        error: "Something went wrong during import",
      },
    );

    setIsOpen(false);
    setDetectedItems([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          Smart Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Smart Import</DialogTitle>
          <DialogDescription>
            Upload your bank statement (CSV). We&apos;ll auto-detect
            subscriptions.
          </DialogDescription>
        </DialogHeader>

        {detectedItems.length === 0 ? (
          // --- ESTADO INICIAL: UPLOAD ---
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer relative group">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isProcessing}
            />
            {isProcessing ? (
              <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="p-4 bg-background rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium text-foreground">
                  Click to upload or drag & drop
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports Revolut, N26, Santander, etc.
                </p>
              </>
            )}
          </div>
        ) : (
          // --- ESTADO REVISIÓN: LISTA ---
          <div className="flex flex-col gap-4 flex-1 min-h-0">
            <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
              <span>Found {detectedItems.length} potential subscriptions</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDetectedItems([])}
                className="h-auto p-0 text-destructive hover:text-destructive"
              >
                Reset
              </Button>
            </div>

            <ScrollArea className="flex-1 border border-border rounded-md p-2 bg-background/50 h-[300px]">
              <div className="space-y-1">
                {detectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors group"
                  >
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleSelection(item.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="font-mono text-sm">
                          {formatCurrency(item.price, item.currency)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate opacity-70">
                        {item.originalDescription}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Button onClick={handleImport} className="w-full gap-2">
              <Check className="w-4 h-4" />
              Import {selectedIds.size} Subscriptions
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription.store";
import { Subscription } from "@/types";
import {
  CalendarIcon,
  CheckCircle2,
  DollarSign,
  Euro,
  FileText,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface LogPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
}

export function LogPaymentModal({
  isOpen,
  onClose,
  subscription,
}: LogPaymentModalProps) {
  const logPayment = useSubscriptionStore((state) => state.logPayment);
  const [isLoading, setIsLoading] = useState(false);

  // Estados del formulario
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [status, setStatus] = useState<"paid" | "skipped">("paid");
  const [notes, setNotes] = useState("");

  // Al abrir el modal, cargamos los datos por defecto
  useEffect(() => {
    if (isOpen && subscription) {
      setAmount(subscription.price.toString());
      setDate(new Date().toISOString().split("T")[0]); // Fecha de hoy YYYY-MM-DD
      setStatus("paid");
      setNotes("");
    }
  }, [isOpen, subscription]);

  const handleSubmit = async () => {
    if (!subscription) return;

    // Validación básica
    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    setIsLoading(true);
    try {
      await logPayment({
        subscription_id: subscription.id,
        amount: Number(amount),
        currency: subscription.currency,
        payment_date: date,
        status: status,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to log payment");
    } finally {
      setIsLoading(false);
    }
  };

  if (!subscription) return null;

  // Icono dinámico según la moneda
  const CurrencyIcon = subscription.currency === "EUR" ? Euro : DollarSign;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Confirm Payment</span>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono border border-primary/20">
              {subscription.name}
            </span>
          </DialogTitle>
          <DialogDescription>
            Record the actual payment details for your history.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* AMOUNT INPUT */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-xs text-muted-foreground">
                Amount Paid
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <CurrencyIcon className="h-4 w-4" />
                </div>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* DATE INPUT */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs text-muted-foreground">
                Payment Date
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                </div>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-9 block w-full"
                />
              </div>
            </div>
          </div>

          {/* STATUS SELECT */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as "paid" | "skipped")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">
                  <span className="flex items-center gap-2 text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" /> Paid Successfully
                  </span>
                </SelectItem>
                <SelectItem value="skipped">
                  <span className="flex items-center gap-2 text-amber-500">
                    <XCircle className="w-4 h-4" /> Skipped / Unpaid
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* NOTES TEXTAREA */}
          <div className="space-y-2">
            <Label
              htmlFor="notes"
              className="text-xs text-muted-foreground flex items-center gap-2"
            >
              <FileText className="w-3 h-3" /> Notes (Reason for change)
            </Label>
            <Textarea
              id="notes"
              placeholder="e.g. Price increased, black friday deal..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none h-20 text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Confirm Log"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

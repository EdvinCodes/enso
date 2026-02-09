"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  Loader2,
  Briefcase,
  User,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Repeat,
  Receipt,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import { useSubscriptionStore } from "../store/subscription.store";
import {
  subscriptionFormSchema,
  type SubscriptionFormValues,
} from "@/features/subscriptions/schemas";
import { PRESET_SERVICES } from "@/lib/constants";
import {
  Currency,
  SubscriptionCategory,
  WorkspaceType,
  Subscription,
} from "@/types";
import { toast } from "sonner";
import { CancellationModal } from "@/components/cancellation-modal";

interface Props {
  trigger?: React.ReactNode;
}

export function SubscriptionModal({ trigger }: Props) {
  const {
    isModalOpen,
    closeModal,
    openModal,
    subscriptionToEdit,
    addSubscription,
    updateSubscription,
    currentWorkspace,
  } = useSubscriptionStore();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) closeModal();
  };

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
        {trigger && (
          <DialogTrigger asChild onClick={() => openModal()}>
            {trigger}
          </DialogTrigger>
        )}

        <DialogContent className="w-full sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-background text-foreground border-border p-0 gap-0">
          {/* TRUCO: Usamos 'key' para resetear el estado interno al cambiar de suscripción.
            Esto evita tener que usar useEffect para resetear formularios.
          */}
          <SubscriptionFormContent
            key={subscriptionToEdit ? subscriptionToEdit.id : "new"}
            subscriptionToEdit={subscriptionToEdit}
            currentWorkspace={currentWorkspace}
            closeModal={closeModal}
            addSubscription={addSubscription}
            updateSubscription={updateSubscription}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

// --- SUB-COMPONENTE INTERNO (TIPADO STRICTO) ---

interface FormContentProps {
  subscriptionToEdit: Subscription | undefined;
  currentWorkspace: WorkspaceType;
  closeModal: () => void;
  // Usamos SubscriptionFormValues que viene de tu Zod Schema
  addSubscription: (data: SubscriptionFormValues) => Promise<void>;
  updateSubscription: (
    id: string,
    data: SubscriptionFormValues,
  ) => Promise<void>;
}

function SubscriptionFormContent({
  subscriptionToEdit,
  currentWorkspace,
  closeModal,
  addSubscription,
  updateSubscription,
}: FormContentProps) {
  const isEditing = !!subscriptionToEdit;

  // Estado inicializado perezosamente para evitar efectos secundarios
  const [entryType, setEntryType] = useState<"recurring" | "one_time">(() => {
    if (subscriptionToEdit && subscriptionToEdit.billingCycle === "one_time") {
      return "one_time";
    }
    return "recurring";
  });

  const [showCancelHelper, setShowCancelHelper] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // Valores por defecto calculados con useMemo para estabilidad
  const defaultValues: Partial<SubscriptionFormValues> = useMemo(() => {
    if (subscriptionToEdit) {
      return {
        name: subscriptionToEdit.name,
        price: subscriptionToEdit.price,
        currency: subscriptionToEdit.currency,
        billingCycle: subscriptionToEdit.billingCycle,
        category: subscriptionToEdit.category,
        startDate: new Date(subscriptionToEdit.startDate),
        workspace: (subscriptionToEdit.workspace ||
          "personal") as WorkspaceType,
      };
    }
    return {
      name: "",
      price: 0,
      currency: "EUR",
      billingCycle: "monthly",
      category: "Entertainment",
      startDate: new Date(),
      workspace: currentWorkspace,
    };
  }, [subscriptionToEdit, currentWorkspace]);

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: defaultValues,
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (data: SubscriptionFormValues) => {
    try {
      // Aseguramos que el ciclo de facturación coincida con la pestaña seleccionada
      const finalData: SubscriptionFormValues = {
        ...data,
        billingCycle: entryType === "one_time" ? "one_time" : data.billingCycle,
      };

      const actionPromise =
        isEditing && subscriptionToEdit
          ? updateSubscription(subscriptionToEdit.id, finalData)
          : addSubscription(finalData);

      toast.promise(actionPromise, {
        loading: isEditing ? "Updating..." : "Saving...",
        success: isEditing
          ? "Updated successfully"
          : entryType === "one_time"
            ? "Expense logged! 💸"
            : "Subscription added! 🎉",
        error: "Operation failed. Please try again.",
      });

      await actionPromise;
      closeModal();
    } catch (error) {
      console.error("Operation failed", error);
    }
  };

  const applyPreset = (preset: (typeof PRESET_SERVICES)[number]) => {
    form.setValue("name", preset.name);
    form.setValue("price", preset.price);
    form.setValue("currency", preset.currency as Currency);
    form.setValue("category", preset.category as SubscriptionCategory);

    setShowPresets(false);
    toast.info(`Applied: ${preset.name}`, {
      description: "You can now adjust the price or date.",
      duration: 2000,
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
    });
  };

  return (
    <>
      <DialogHeader className="p-6 pb-2">
        <DialogTitle className="text-xl flex items-center gap-2">
          {isEditing && subscriptionToEdit && (
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
              {subscriptionToEdit.name.charAt(0)}
            </div>
          )}
          {isEditing ? subscriptionToEdit?.name : "New Entry"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Manage details and view history."
            : "Add a new subscription or one-time expense."}
        </DialogDescription>
      </DialogHeader>

      <div className="p-6 pt-4">
        {/* SWITCHER TIPO DE GASTO (Solo visible si es Nuevo) */}
        {!isEditing && (
          <div className="flex p-1 bg-muted rounded-lg mb-6">
            <button
              type="button"
              onClick={() => setEntryType("recurring")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                entryType === "recurring"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Repeat className="w-4 h-4" /> Subscription
            </button>
            <button
              type="button"
              onClick={() => setEntryType("one_time")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                entryType === "one_time"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Receipt className="w-4 h-4" /> One-time Expense
            </button>
          </div>
        )}

        {/* PRESETS (Solo si es Recurring y no estamos editando) */}
        {!isEditing && entryType === "recurring" && (
          <div className="mb-4 border border-border rounded-lg bg-muted/20 overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              <span className="flex items-center gap-2 text-primary">
                <Sparkles className="w-4 h-4" />
                Quick Fill from Popular Services
              </span>
              {showPresets ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {showPresets && (
              <div className="p-3 pt-0 grid grid-cols-3 sm:grid-cols-4 gap-2 animate-in slide-in-from-top-2 duration-200">
                {PRESET_SERVICES.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-background border border-border hover:border-primary/50 hover:shadow-sm transition-all gap-1.5 group"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: preset.color }}
                    >
                      {preset.icon}
                    </div>
                    <span className="text-[10px] text-muted-foreground group-hover:text-foreground font-medium truncate w-full text-center">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    {entryType === "recurring"
                      ? "Service Name"
                      : "Concept / Description"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        entryType === "recurring"
                          ? "e.g. Netflix"
                          : "e.g. Dinner, Uber..."
                      }
                      {...field}
                      className="h-9"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs">Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-9"
                        value={field.value}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem className="w-[85px]">
                    <FormLabel className="text-xs">Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="EUR" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs">Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Entertainment">
                          Entertainment
                        </SelectItem>
                        <SelectItem value="Software">Software</SelectItem>
                        <SelectItem value="Utilities">Utilities</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* BILLING CYCLE: SOLO VISIBLE SI ES RECURRENTE */}
              {entryType === "recurring" && (
                <FormField
                  control={form.control}
                  name="billingCycle"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs">Cycle</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs">
                    {entryType === "recurring"
                      ? "First Payment"
                      : "Expense Date"}
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal h-9",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => date && field.onChange(date)}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workspace"
              render={({ field }) => (
                <FormItem className="space-y-2 pt-1">
                  <FormLabel className="text-xs">Assign Workspace</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value || currentWorkspace}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="personal" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm cursor-pointer flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> Personal
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="business" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm cursor-pointer flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5" /> Business
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
              <Button
                variant="ghost"
                type="button"
                onClick={closeModal}
                className="h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-9 bg-primary hover:bg-primary/90"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing
                  ? "Update"
                  : entryType === "recurring"
                    ? "Create Subscription"
                    : "Log Expense"}
              </Button>
            </div>
          </form>
        </Form>

        {/* BOTÓN CANCELAR SUSCRIPCIÓN (Solo si es recurrente y estamos editando) */}
        {isEditing && entryType === "recurring" && (
          <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Thinking of leaving?
            </span>
            <Button
              type="button"
              variant="link"
              className="text-red-500 hover:text-red-600 h-auto p-0 text-xs font-medium"
              onClick={() => setShowCancelHelper(true)}
            >
              Get Cancellation Help
            </Button>
          </div>
        )}
      </div>

      <CancellationModal
        isOpen={showCancelHelper}
        onClose={() => setShowCancelHelper(false)}
        subscription={subscriptionToEdit || null}
      />
    </>
  );
}

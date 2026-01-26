"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Briefcase, User } from "lucide-react";

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
import { Currency, SubscriptionCategory } from "@/types";

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

  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: "",
      price: 0,
      currency: "EUR",
      billingCycle: "monthly",
      category: "Entertainment",
      startDate: new Date(),
      workspace: currentWorkspace,
    },
  });

  // --- EFECTO DE SINCRONIZACIÓN ---
  useEffect(() => {
    if (isModalOpen) {
      const editing = !!subscriptionToEdit;

      // FIX: Silenciamos el linter aquí porque necesitamos actualizar el estado local
      // basándonos en el store global ANTES de que el usuario interactúe.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsEditing(editing);

      if (editing && subscriptionToEdit) {
        // MODO EDICIÓN
        form.reset({
          name: subscriptionToEdit.name,
          price: subscriptionToEdit.price,
          currency: subscriptionToEdit.currency,
          billingCycle: subscriptionToEdit.billingCycle,
          category: subscriptionToEdit.category,
          startDate: new Date(subscriptionToEdit.startDate),
          workspace: subscriptionToEdit.workspace || "personal",
        });
      } else {
        // MODO CREACIÓN
        form.reset({
          name: "",
          price: 0,
          currency: "EUR",
          billingCycle: "monthly",
          category: "Entertainment",
          startDate: new Date(),
          workspace: currentWorkspace,
        });
      }
    }
  }, [isModalOpen, subscriptionToEdit, form, currentWorkspace]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (data: SubscriptionFormValues) => {
    try {
      if (isEditing) {
        // Usamos el estado sticky
        // Aseguramos que existe el ID (typescript safety)
        if (subscriptionToEdit) {
          await updateSubscription(subscriptionToEdit.id, data);
        }
      } else {
        await addSubscription(data);
      }
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
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      closeModal();
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      {trigger && (
        <DialogTrigger asChild onClick={() => openModal()}>
          {trigger}
        </DialogTrigger>
      )}

      {/* FIX RESPONSIVE:
         - w-full: Ocupa el ancho disponible
         - max-h-[85vh]: Nunca supera el 85% de la altura de la pantalla (deja espacio arriba y abajo)
         - overflow-y-auto: Si el contenido es mayor que el 85%, aparece barra de scroll dentro del modal
      */}
      <DialogContent className="w-full sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-background text-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEditing ? "Edit Subscription" : "New Subscription"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modify your subscription details."
              : "Choose a popular service or create a custom one."}
          </DialogDescription>
        </DialogHeader>

        {!isEditing && (
          <div className="grid grid-cols-3 gap-2 py-4 border-b border-border mb-4">
            {PRESET_SERVICES.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-muted/50 hover:bg-muted border border-border hover:border-primary/50 transition-all gap-2 group"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: preset.color }}
                >
                  {preset.icon}
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground font-medium">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Netflix, Spotify..."
                      {...field}
                      className="bg-background border-input focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="bg-background border-input"
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
                  <FormItem className="w-[100px]">
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-input">
                          <SelectValue placeholder="EUR" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-input">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        <SelectItem value="Entertainment">
                          Entertainment
                        </SelectItem>
                        <SelectItem value="Software">Software</SelectItem>
                        <SelectItem value="Utilities">Utilities</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billingCycle"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Cycle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-input">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>First Payment</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-background border-input hover:bg-accent hover:text-accent-foreground",
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
                    <PopoverContent
                      className="w-auto p-0 bg-popover border-border text-popover-foreground shadow-md"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workspace"
              render={({ field }) => (
                <FormItem className="space-y-3 pt-2">
                  <FormLabel>Assign Workspace</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value || currentWorkspace}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="personal" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                          <User className="w-4 h-4" /> Personal
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="business" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                          <Briefcase className="w-4 h-4" /> Business
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="ghost" type="button" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update" : "Save"} Subscription
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import {
  Calendar,
  CreditCard,
  LayoutGrid,
  Moon,
  Plus,
  Sun,
  Laptop,
  Bell,
} from "lucide-react";
import { useTheme } from "next-themes";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription.store";

import {
  requestNotificationPermission,
  sendNotification,
} from "@/lib/notifications";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const { setTheme } = useTheme();
  const { setView, openModal, subscriptions } = useSubscriptionStore();

  // Escuchar Cmd+K / Ctrl+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Helper para ejecutar y cerrar
  const run = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      {/* Hint visual sutil en desktop */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground border border-border px-2 py-1 rounded bg-muted/20">
        <span className="text-xs">⌘</span>K
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => run(() => openModal())}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Add New Subscription</span>
            </CommandItem>
            <CommandItem onSelect={() => run(() => setView("calendar"))}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Go to Calendar</span>
            </CommandItem>
            <CommandItem onSelect={() => run(() => setView("overview"))}>
              <LayoutGrid className="mr-2 h-4 w-4" />
              <span>Go to Overview</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Your Stack">
            {subscriptions.map((sub) => (
              <CommandItem
                key={sub.id}
                onSelect={() => run(() => openModal(sub))} // Abre el modal en modo EDITAR
                className="cursor-pointer"
              >
                <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{sub.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {sub.category}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="System">
            <CommandItem
              onSelect={() =>
                run(async () => {
                  const granted = await requestNotificationPermission();
                  if (granted) {
                    sendNotification(
                      "Notifications Active",
                      "You will now receive alerts for upcoming payments.",
                    );
                  }
                })
              }
            >
              <Bell className="mr-2 h-4 w-4" />
              <span>Enable Notifications</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => run(() => setTheme("light"))}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light Mode</span>
            </CommandItem>
            <CommandItem onSelect={() => run(() => setTheme("dark"))}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark Mode</span>
            </CommandItem>
            <CommandItem onSelect={() => run(() => setTheme("system"))}>
              <Laptop className="mr-2 h-4 w-4" />
              <span>System</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

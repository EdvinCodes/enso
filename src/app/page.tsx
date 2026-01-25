"use client";

import { useEffect } from "react";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription.store";
import { AddSubscriptionModal } from "@/features/subscriptions/components/AddSubscriptionModal";
import { SubscriptionCard } from "@/features/subscriptions/components/SubscriptionCard";
import { BackgroundGlow } from "@/components/ui/background-glow";
import { EnsoLogo } from "@/components/ui/enso-logo";
import { Card } from "@/components/ui/card";
import { Wallet, TrendingUp, ShieldCheck } from "lucide-react";

export default function DashboardPage() {
  const { subscriptions, fetchSubscriptions, deleteSubscription } =
    useSubscriptionStore();

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Cálculos de KPIs
  const monthlyTotal = subscriptions.reduce((acc, sub) => {
    let price = sub.price;
    if (sub.billingCycle === "yearly") price = price / 12;
    if (sub.billingCycle === "weekly") price = price * 4;
    return acc + price;
  }, 0);

  const yearlyProjection = monthlyTotal * 12;

  return (
    <main className="relative min-h-screen text-zinc-100 font-sans selection:bg-primary/30">
      <BackgroundGlow />

      <div className="relative mx-auto max-w-5xl px-6 py-12 md:py-20 space-y-12">
        {/* Navbar / Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-md shadow-2xl">
              <EnsoLogo className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                ENSO
              </h1>
              <p className="text-xs text-zinc-500 font-medium tracking-widest uppercase">
                Finance OS
              </p>
            </div>
          </div>
          <AddSubscriptionModal />
        </header>

        {/* Bento Grid Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main KPI */}
          <Card className="md:col-span-2 p-6 bg-zinc-900/40 border-zinc-800 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wallet className="w-32 h-32 rotate-[-15deg]" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-zinc-400 mb-1">
                Monthly Run Rate
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                {new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "EUR",
                }).format(monthlyTotal)}
                <span className="text-lg text-zinc-500 font-normal ml-2">
                  /mo
                </span>
              </h2>
              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm bg-emerald-400/10 w-fit px-2 py-1 rounded-full border border-emerald-400/20">
                <TrendingUp className="w-3 h-3" />
                <span>Active Tracking</span>
              </div>
            </div>
          </Card>

          {/* Secondary KPI */}
          <Card className="p-6 bg-zinc-900/40 border-zinc-800 backdrop-blur-md flex flex-col justify-center">
            <p className="text-sm font-medium text-zinc-400 mb-2">
              Yearly Projection
            </p>
            <p className="text-2xl font-bold text-zinc-200">
              {new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              }).format(yearlyProjection)}
            </p>
            <div className="mt-4 text-xs text-zinc-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Local & Encrypted</span>
            </div>
          </Card>
        </section>

        {/* List Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl font-semibold tracking-tight text-white">
              Your Stack
            </h3>
            <span className="text-xs font-mono text-zinc-500 border border-zinc-800 px-2 py-1 rounded-md">
              {subscriptions.length} ITEMS
            </span>
          </div>

          <div className="grid gap-4">
            {subscriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                <div className="h-16 w-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                  <EnsoLogo className="w-8 h-8 text-zinc-600 opacity-50" />
                </div>
                <p className="text-zinc-400 font-medium">
                  No subscriptions yet
                </p>
                <p className="text-zinc-600 text-sm mt-1">
                  Start by adding your first recurring expense
                </p>
              </div>
            ) : (
              subscriptions.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  onDelete={deleteSubscription}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

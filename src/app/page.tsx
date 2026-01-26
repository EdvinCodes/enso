"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BackgroundGlow } from "@/components/ui/background-glow";
import { EnsoLogo } from "@/components/ui/enso-logo";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  TrendingUp,
  Sparkles,
  Github,
  CheckCircle2,
  Smartphone,
  Database, // <--- Icono para Sincronización
  Lock, // <--- Icono para Seguridad/Auth
} from "lucide-react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

// --- COMPONENTS UTILS ---

function SpotlightCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn(
        "group relative border border-border bg-card/50 overflow-hidden rounded-3xl",
        className,
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.1),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

// --- MAIN PAGE ---

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col font-sans bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      <BackgroundGlow />

      {/* --- NAVBAR --- */}
      <header className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-lg group-hover:bg-primary/40 transition-colors rounded-full" />
              <EnsoLogo className="relative w-6 h-6 text-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">ENSO</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            {["Features", "Cloud Sync", "Open Source"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="hover:text-foreground transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-medium hover:text-primary transition-colors"
            >
              Log in
            </Link>
            <Link href="/register">
              <Button
                variant="default"
                size="sm"
                className="font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-20">
        {/* --- HERO SECTION --- */}
        <section className="px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50 text-secondary-foreground text-xs font-medium backdrop-blur-md"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent font-bold">
                v3.0
              </span>
              <span className="text-muted-foreground">
                Now with Secure Cloud Sync & Auth
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-extrabold tracking-tight text-foreground leading-[0.9]"
            >
              Master your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/40">
                Wealth Engine
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              The intelligence layer for your subscriptions.
              <span className="text-foreground font-medium">
                {" "}
                Encrypted synchronization across all your devices.
              </span>{" "}
              <br className="hidden sm:block" />
              Your finances, perfectly tracked and always secure.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
            >
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 text-base shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all rounded-full"
                >
                  Create Free Account <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="https://github.com/EdvinCodes/enso" target="_blank">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 text-base rounded-full hover:bg-secondary/50 border-border/50"
                >
                  <Github className="mr-2 w-4 h-4" /> Open Source
                </Button>
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground/60"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />{" "}
                Multi-device Sync
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Google &
                GitHub Login
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Privacy
                Focused
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- 3D MOCKUP PREVIEW --- */}
        <section className="mt-20 px-4 md:px-0 perspective-1000 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-primary/20 blur-[120px] rounded-full -z-10" />

          <motion.div
            initial={{ rotateX: 20, y: 100, opacity: 0 }}
            whileInView={{ rotateX: 0, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-6xl mx-auto"
          >
            <div className="rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm p-2 shadow-2xl ring-1 ring-white/10 overflow-hidden">
              <div className="aspect-[16/10] bg-zinc-900 rounded-lg overflow-hidden relative group">
                <Image
                  src="/dashboard-screenshot.png"
                  alt="ENSO Dashboard"
                  fill
                  className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* --- BENTO FEATURES --- */}
        <section
          id="features"
          className="max-w-7xl mx-auto px-6 py-32 space-y-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Feature 1: Cloud Sync (REEMPLAZA A LOCAL-ONLY) */}
            <SpotlightCard className="col-span-1 md:col-span-2">
              <div className="p-8 h-full flex flex-col justify-between relative z-10">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Database className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">
                    Seamless Cloud Sync
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    Your financial data is automatically synchronized across all
                    your devices using Supabase. Start tracking on your desktop
                    and check your limits on your phone instantly.
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10">
                  <Database className="w-64 h-64 -mb-10 -mr-10" />
                </div>
              </div>
            </SpotlightCard>

            {/* Feature 2: Security */}
            <SpotlightCard className="col-span-1">
              <div className="p-8 h-full flex flex-col relative z-10">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
                  <Lock className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Secure Authentication
                </h3>
                <p className="text-muted-foreground">
                  Login securely with Google, GitHub, or Email. Your session is
                  protected by enterprise-grade security.
                </p>
              </div>
            </SpotlightCard>

            {/* Feature 3: Forecast */}
            <SpotlightCard className="col-span-1">
              <div className="p-8 h-full flex flex-col relative z-10">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Cashflow Projection</h3>
                <p className="text-muted-foreground">
                  Visualize your spending curve and predict future expenses
                  before they happen.
                </p>
              </div>
            </SpotlightCard>

            {/* Feature 4: PWA */}
            <SpotlightCard className="col-span-1 md:col-span-2">
              <div className="p-8 h-full flex flex-col sm:flex-row gap-8 relative z-10">
                <div className="flex-1 space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Smartphone className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">
                    Native PWA Experience
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    Install ENSO on your home screen. Experience a
                    lightning-fast interface with offline support and a native
                    feel on iOS and Android.
                  </p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-32 h-64 border-4 border-muted rounded-[2rem] relative bg-zinc-900 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 w-full h-4 bg-zinc-800" />
                    <div className="p-4 space-y-2">
                      <div className="w-full h-2 bg-primary/20 rounded" />
                      <div className="w-2/3 h-2 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-lg py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <EnsoLogo className="w-5 h-5" />
            <span className="font-bold">ENSO</span>
          </div>
          <div className="flex gap-8 text-xs text-muted-foreground">
            <Link
              href="/login"
              className="hover:text-foreground transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="hover:text-foreground transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="https://github.com/EdvinCodes/enso"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 ENSO. Built for the modern web.
          </p>
        </div>
      </footer>
    </div>
  );
}

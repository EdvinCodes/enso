"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BackgroundGlow } from "@/components/ui/background-glow";
import { EnsoLogo } from "@/components/ui/enso-logo";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  Globe,
  Calendar,
  BellRing,
  Sparkles,
  Github,
  CheckCircle2,
  Zap,
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

const BRANDS = [
  "Netflix",
  "Spotify",
  "AWS",
  "Adobe",
  "Vercel",
  "Apple",
  "Notion",
  "Linear",
  "ChatGPT",
];

function InfiniteMarquee() {
  return (
    <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
      {/* Usamos la clase CSS que definimos en globals.css */}
      <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll">
        {[...BRANDS, ...BRANDS].map((brand, i) => (
          <li
            key={i}
            className="text-xl font-bold text-muted-foreground/30 uppercase tracking-widest select-none whitespace-nowrap"
          >
            {brand}
          </li>
        ))}
      </ul>
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
            {["Features", "Security", "Open Source"].map((item) => (
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
              href="https://github.com/EdvinCodes/enso"
              target="_blank"
              className="hidden sm:block"
            >
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <Github className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="default"
                size="sm"
                className="font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105"
              >
                Launch App
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
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50 text-secondary-foreground text-xs font-medium backdrop-blur-md"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent font-bold">
                v2.0
              </span>
              <span className="text-muted-foreground">Is finally here</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-6xl md:text-8xl font-extrabold tracking-tight text-foreground leading-[0.9]"
            >
              Control your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/40">
                Digital Wallet
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              The privacy-first finance OS.
              <span className="text-foreground font-medium">
                {" "}
                No servers. No tracking.
              </span>{" "}
              <br className="hidden sm:block" />
              Just you and your recurring expenses in perfect harmony.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
            >
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 text-base shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all rounded-full"
                >
                  Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-12 px-8 text-base rounded-full hover:bg-secondary/50 border-border/50"
              >
                <Github className="mr-2 w-4 h-4" /> Star on GitHub
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="pt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground/60"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free
                Forever
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Local
                Storage
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Open
                Source
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- 3D MOCKUP PREVIEW --- */}
        <section className="mt-20 px-4 md:px-0 perspective-1000 relative">
          {/* Glow behind dashboard */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-primary/20 blur-[120px] rounded-full -z-10" />

          <motion.div
            initial={{ rotateX: 20, y: 100, opacity: 0 }}
            whileInView={{ rotateX: 0, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-6xl mx-auto"
          >
            <div className="rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm p-2 shadow-2xl ring-1 ring-white/10">
              {/* Browser Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/20 rounded-t-lg">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="ml-4 flex-1 max-w-sm bg-background/50 h-6 rounded-md border border-border/30 flex items-center justify-center text-[10px] text-muted-foreground font-mono">
                  https://enso-three.vercel.app/dashboard
                </div>
              </div>

              {/* Real UI Content */}
              <div className="relative aspect-[16/10] bg-background w-full overflow-hidden rounded-b-lg group-hover:scale-[1.02] transition-transform duration-500">
                {/* Asegúrate de poner la foto en la carpeta public */}
                <Image
                  src="/dashboard-screenshot.png"
                  alt="App Screenshot"
                  width={1600}
                  height={1000}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* --- MARQUEE BRANDS --- */}
        <div className="py-20 border-y border-border/30 bg-background/30 backdrop-blur-sm mt-20">
          <InfiniteMarquee />
        </div>

        {/* --- BENTO FEATURES --- */}
        <section
          id="features"
          className="max-w-7xl mx-auto px-6 py-32 space-y-16"
        >
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold">
              Not just another tracker.
            </h2>
            <p className="text-xl text-muted-foreground">
              We stripped away the complexity and focused on what matters:{" "}
              <span className="text-foreground font-semibold">
                Privacy, Speed, and Clarity.
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Feature 1 */}
            <SpotlightCard className="col-span-1 md:col-span-2">
              <div className="p-8 h-full flex flex-col justify-between relative z-10">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    Local-First Architecture
                  </h3>
                  {/* FIX ESLINT: &apos; */}
                  <p className="text-muted-foreground text-lg">
                    Your data lives in your browser&apos;s IndexedDB. We
                    literally cannot see your finances even if we wanted to. No
                    login required.
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10">
                  <ShieldCheck className="w-64 h-64 -mb-10 -mr-10" />
                </div>
              </div>
            </SpotlightCard>

            {/* Feature 2 */}
            <SpotlightCard className="col-span-1">
              <div className="p-8 h-full flex flex-col relative z-10">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
                  <Globe className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Multi-Currency</h3>
                <p className="text-muted-foreground">
                  Pay in USD, track in EUR. Real-time forex normalization for
                  accurate Monthly Run Rate.
                </p>

                {/* Decorator */}
                <div className="mt-auto pt-6 flex gap-2">
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs rounded border border-blue-500/20">
                    € 1.00
                  </span>
                  <span className="px-2 py-1 bg-zinc-800 text-zinc-500 text-xs rounded border border-zinc-700">
                    =
                  </span>
                  <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded border border-green-500/20">
                    $ 1.09
                  </span>
                </div>
              </div>
            </SpotlightCard>

            {/* Feature 3 */}
            <SpotlightCard className="col-span-1">
              <div className="p-8 h-full flex flex-col relative z-10">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
                  <Calendar className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Visual Calendar</h3>
                <p className="text-muted-foreground">
                  See your month at a glance. Identify spending clusters and
                  annual renewal traps instantly.
                </p>
              </div>
            </SpotlightCard>

            {/* Feature 4 */}
            <SpotlightCard className="col-span-1 md:col-span-2">
              <div className="p-8 h-full flex flex-col sm:flex-row gap-8 relative z-10">
                <div className="flex-1 space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20">
                    <BellRing className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    Smart Notifications
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    The system wakes up when you do. Get native alerts 3 days
                    before any payment hits your card.
                  </p>
                </div>

                {/* Notification Mockup */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full max-w-[280px] bg-background/80 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-2xl relative rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xs">
                        N
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-sm">Netflix</h4>
                          <span className="text-[10px] text-muted-foreground">
                            Now
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Payment of 17.99€ is due tomorrow.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SpotlightCard>

            {/* Feature 5 (God Mode) */}
            <SpotlightCard className="col-span-1 md:col-span-3 bg-gradient-to-r from-background to-primary/5">
              <div className="p-8 flex flex-col items-center text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border shadow-sm mb-6">
                  <span className="text-xs font-mono text-muted-foreground">
                    ⌘ K
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />{" "}
                  God Mode Included
                </h3>
                {/* FIX ESLINT: &apos; */}
                <p className="text-muted-foreground max-w-2xl">
                  Power users don&apos;t touch the mouse. Use the Command
                  Palette to navigate, search, creating subscriptions, or toggle
                  dark mode instantly.
                </p>
              </div>
            </SpotlightCard>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto py-12 px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <EnsoLogo className="w-5 h-5 text-foreground" />
                <span className="font-bold tracking-tight">ENSO</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Built for individuals who value design, privacy, and speed.{" "}
                <br />
                Open Source and free forever.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Changelog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">Community</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Discord
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <span>© 2026 ENSO. All rights reserved.</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

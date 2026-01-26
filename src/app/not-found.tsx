"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BackgroundGlow } from "@/components/ui/background-glow";
import { ArrowLeft, RefreshCcw, Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#09090b] text-foreground overflow-hidden selection:bg-primary/30">
      {/* Reutilizamos tu fondo para mantener la consistencia */}
      <BackgroundGlow />

      {/* Efectos de fondo adicionales específicos para el 404 */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 z-0 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10 animate-pulse" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 space-y-8">
        {/* Icono Temático */}
        <div className="p-4 bg-card/50 border border-border/50 rounded-2xl backdrop-blur-md shadow-lg shadow-primary/10 mb-4 animate-bounce-slow">
          <Terminal className="w-12 h-12 text-primary" />
        </div>

        {/* EL GRAN TÍTULO GLITCH */}
        <div className="relative">
          {/* Capas para el efecto glitch */}
          <h1
            className="glitch-text text-8xl md:text-[10rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 leading-none select-none"
            data-text="404"
          >
            404
          </h1>
          <p className="text-xs font-mono text-primary/70 tracking-[0.3em] uppercase mt-2 animate-pulse">
            System_Error: Asset_Not_Found
          </p>
        </div>

        {/* Textos Creativos Financieros */}
        <div className="space-y-3 max-w-md mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold">
            This entry is off the books.
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            The page you&apos;re looking for seems to have vanished into the
            digital void. It might have been liquidated, delisted, or never
            existed in this fiscal reality.
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
          <Button
            asChild
            size="lg"
            className="group relative shadow-lg shadow-primary/20 overflow-hidden"
          >
            <Link href="/dashboard">
              {/* Efecto de brillo al pasar el mouse en el botón principal */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
              <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
              Return to Dashboard
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-primary/30 hover:bg-primary/10 hover:text-primary group"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="mr-2 h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
            Try Reconnecting
          </Button>
        </div>
      </div>

      {/* Estilos CSS Inline para el efecto Glitch */}
      <style jsx>{`
        .glitch-text {
          position: relative;
          text-shadow:
            0.05em 0 0 rgba(0, 255, 255, 0.75),
            -0.025em -0.05em 0 rgba(0, 0, 255, 0.75),
            0.025em 0.05em 0 rgba(255, 0, 255, 0.75);
          animation: glitch 2.5s infinite;
        }

        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0.8;
        }

        .glitch-text::before {
          animation: glitch-it 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both
            infinite;
          color: #00ffff;
          z-index: -1;
        }

        .glitch-text::after {
          animation: glitch-it 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse
            both infinite;
          color: #ff00ff;
          z-index: -2;
        }

        @keyframes glitch {
          0% {
            text-shadow:
              0.05em 0 0 rgba(0, 255, 255, 0.75),
              -0.05em -0.025em 0 rgba(0, 0, 255, 0.75),
              -0.025em 0.05em 0 rgba(255, 0, 255, 0.75);
          }
          14% {
            text-shadow:
              0.05em 0 0 rgba(0, 255, 255, 0.75),
              -0.05em -0.025em 0 rgba(0, 0, 255, 0.75),
              -0.025em 0.05em 0 rgba(255, 0, 255, 0.75);
          }
          15% {
            text-shadow:
              -0.05em -0.025em 0 rgba(0, 255, 255, 0.75),
              0.025em 0.025em 0 rgba(0, 0, 255, 0.75),
              -0.05em -0.05em 0 rgba(255, 0, 255, 0.75);
          }
          49% {
            text-shadow:
              -0.05em -0.025em 0 rgba(0, 255, 255, 0.75),
              0.025em 0.025em 0 rgba(0, 0, 255, 0.75),
              -0.05em -0.05em 0 rgba(255, 0, 255, 0.75);
          }
          50% {
            text-shadow:
              0.025em 0.05em 0 rgba(0, 255, 255, 0.75),
              0.05em 0 0 rgba(0, 0, 255, 0.75),
              0 -0.05em 0 rgba(255, 0, 255, 0.75);
          }
          99% {
            text-shadow:
              0.025em 0.05em 0 rgba(0, 255, 255, 0.75),
              0.05em 0 0 rgba(0, 0, 255, 0.75),
              0 -0.05em 0 rgba(255, 0, 255, 0.75);
          }
          100% {
            text-shadow:
              -0.025em 0 0 rgba(0, 255, 255, 0.75),
              -0.025em -0.025em 0 rgba(0, 0, 255, 0.75),
              -0.025em -0.05em 0 rgba(255, 0, 255, 0.75);
          }
        }

        @keyframes glitch-it {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }
      `}</style>
    </main>
  );
}

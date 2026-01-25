export function BackgroundGlow() {
  return (
    <div className="fixed inset-0 -z-50 h-full w-full bg-zinc-950">
      {/* Grid sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Luces Ambientales (Auroras) */}
      <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] opacity-40 animate-pulse" />
      <div className="absolute right-[-5%] bottom-[-10%] h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[100px] opacity-30" />
    </div>
  );
}

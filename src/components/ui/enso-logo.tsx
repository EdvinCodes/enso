export function EnsoLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* El círculo Enso imperfecto y tecnológico */}
      <path
        d="M50 10 C 27.9086 10 10 27.9086 10 50 C 10 72.0914 27.9086 90 50 90 C 72.0914 90 90 72.0914 90 50"
        stroke="url(#gradient)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <circle
        cx="75"
        cy="25"
        r="6"
        fill="currentColor"
        className="text-primary animate-pulse"
      />
      <defs>
        <linearGradient
          id="gradient"
          x1="10"
          y1="90"
          x2="90"
          y2="10"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" className="text-primary" />
          <stop
            offset="1"
            stopColor="currentColor"
            stopOpacity="0"
            className="text-primary"
          />
        </linearGradient>
      </defs>
    </svg>
  );
}

import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    // ImageResponse JSX element
    <div
      style={{
        fontSize: 24,
        background: "transparent",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white", // Color del icono en la pestaña
      }}
    >
      {/* El mismo logo geométrico pero simplificado para tamaño pequeño */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <path
          d="M50 10 C 27.9086 10 10 27.9086 10 50 C 10 72.0914 27.9086 90 50 90 C 72.0914 90 90 72.0914 90 50"
          stroke="currentColor"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <circle cx="75" cy="25" r="10" fill="#3b82f6" />
      </svg>
    </div>,
    // ImageResponse options
    {
      ...size,
    },
  );
}

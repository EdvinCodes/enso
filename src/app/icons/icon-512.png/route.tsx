import { ImageResponse } from "next/og";

export const runtime = "edge";

const size = {
  width: 512,
  height: 512,
};

export function GET() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 320,
        background: "#09090b",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        borderRadius: "100px",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "70%", height: "70%" }}
      >
        <path
          d="M50 10 C 27.9086 10 10 27.9086 10 50 C 10 72.0914 27.9086 90 50 90 C 72.0914 90 90 72.0914 90 50"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <circle cx="75" cy="25" r="8" fill="#3b82f6" />
      </svg>
    </div>,
    { ...size },
  );
}

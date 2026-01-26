import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public", // Donde se generan los archivos del worker
  register: true, // Registrar el worker automáticamente
  skipWaiting: true, // Actualizar la app en cuanto haya nueva versión
  disable: process.env.NODE_ENV === "development", // Desactivar en desarrollo para que no moleste
});

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
};

// Envolvemos la config con PWA
export default withPWA(nextConfig);

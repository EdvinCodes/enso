export const PRESET_SERVICES = [
  // --- ENTERTAINMENT ---
  {
    id: "netflix",
    name: "Netflix",
    price: 17.99,
    currency: "EUR",
    color: "#E50914",
    category: "Entertainment",
    icon: "N",
  },
  {
    id: "spotify",
    name: "Spotify",
    price: 10.99,
    currency: "EUR",
    color: "#1DB954",
    category: "Entertainment",
    icon: "S",
  },
  {
    id: "youtube",
    name: "YouTube Premium",
    price: 11.99,
    currency: "EUR",
    color: "#FF0000",
    category: "Entertainment",
    icon: "Y",
  },
  {
    id: "prime",
    name: "Amazon Prime",
    price: 4.99,
    currency: "EUR",
    color: "#00A8E1",
    category: "Entertainment",
    icon: "P",
  },
  {
    id: "hbo",
    name: "HBO Max",
    price: 9.99,
    currency: "EUR",
    color: "#5C2D91", // Morado HBO
    category: "Entertainment",
    icon: "H",
  },
  {
    id: "disney",
    name: "Disney+",
    price: 8.99,
    currency: "EUR",
    color: "#113CCF", // Azul Disney
    category: "Entertainment",
    icon: "D",
  },

  // --- SOFTWARE & AI ---
  {
    id: "chatgpt",
    name: "ChatGPT Plus",
    price: 20.0,
    currency: "USD",
    color: "#10A37F",
    category: "Software",
    icon: "AI",
  },
  {
    id: "icloud",
    name: "iCloud+",
    price: 2.99,
    currency: "EUR",
    color: "#007AFF",
    category: "Software",
    icon: "i",
  },
  {
    id: "adobe",
    name: "Adobe Creative Cloud",
    price: 60.49, // Precio medio del paquete completo
    currency: "EUR",
    color: "#FF0000",
    category: "Software",
    icon: "Ps",
  },
  {
    id: "figma",
    name: "Figma Professional",
    price: 12.0, // Precio por editor
    currency: "EUR",
    color: "#0ACF83", // Verde Figma
    category: "Software",
    icon: "Fi",
  },
  {
    id: "github",
    name: "GitHub Copilot",
    price: 10.0,
    currency: "USD",
    color: "#181717", // Negro GitHub
    category: "Software",
    icon: "Gh",
  },
  {
    id: "notion",
    name: "Notion Plus",
    price: 8.0,
    currency: "USD",
    color: "#000000",
    category: "Software",
    icon: "No",
  },

  // --- UTILITIES ---
  {
    id: "dropbox",
    name: "Dropbox Plus",
    price: 11.99,
    currency: "EUR",
    color: "#0061FF",
    category: "Utilities",
    icon: "Db",
  },
  {
    id: "googleone",
    name: "Google One",
    price: 1.99,
    currency: "EUR",
    color: "#4285F4",
    category: "Utilities",
    icon: "G1",
  },
] as const;

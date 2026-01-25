export const PRESET_SERVICES = [
  {
    id: "netflix",
    name: "Netflix",
    price: 17.99, // Standard plan avg
    currency: "EUR",
    color: "#E50914", // Brand Color
    category: "Entertainment",
    icon: "N" // Podríamos usar SVGs, pero la inicial con brand color queda muy clean
  },
  {
    id: "spotify",
    name: "Spotify",
    price: 10.99,
    currency: "EUR",
    color: "#1DB954",
    category: "Entertainment",
    icon: "S"
  },
  {
    id: "youtube",
    name: "YouTube Premium",
    price: 11.99,
    currency: "EUR",
    color: "#FF0000",
    category: "Entertainment",
    icon: "Y"
  },
  {
    id: "prime",
    name: "Amazon Prime",
    price: 4.99,
    currency: "EUR",
    color: "#00A8E1",
    category: "Entertainment",
    icon: "P"
  },
  {
    id: "chatgpt",
    name: "ChatGPT Plus",
    price: 20.00,
    currency: "USD",
    color: "#10A37F",
    category: "Software",
    icon: "AI"
  },
  {
    id: "icloud",
    name: "iCloud+",
    price: 2.99,
    currency: "EUR",
    color: "#007AFF",
    category: "Software",
    icon: "i"
  }
] as const;
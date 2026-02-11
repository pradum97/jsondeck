import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./pages/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        section: "var(--section)",
        card: "var(--card)",
        border: "var(--border)",
        text: "var(--text)",
        secondary: "var(--secondary)",
        muted: "var(--muted)",
        disabled: "var(--disabled)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-soft": "var(--accent-soft)",
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
      },
    },
  },
  plugins: [],
};

export default config;

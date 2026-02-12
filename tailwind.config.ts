import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gpt: {
          dark: '#343541',      // Fundo principal
          sidebar: '#202123',   // Sidebar
          input: '#40414f',     // Campo de texto
          green: '#10a37f',     // Botão/Acento
          hover: '#1a1b1e',     // Hover states
          text: '#ececf1',      // Texto principal
        }
      },
    },
  },
  plugins: [],
};
export default config;

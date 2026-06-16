import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1d1d1b",
        paper: "#f7f3eb",
        clay: "#bd4b34",
        jade: "#21665b",
        maize: "#e7b94d",
        violet: "#5b4b8a",
        fog: "#e7e0d5"
      },
      boxShadow: {
        editorial: "0 18px 50px rgba(29, 29, 27, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

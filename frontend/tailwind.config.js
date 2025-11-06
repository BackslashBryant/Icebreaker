/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "oklch(0.12 0.02 250)",
        foreground: "oklch(0.92 0 0)",
        card: {
          DEFAULT: "oklch(0.15 0.02 250)",
          foreground: "oklch(0.92 0 0)",
        },
        popover: {
          DEFAULT: "oklch(0.13 0.02 250)",
          foreground: "oklch(0.92 0 0)",
        },
        primary: {
          DEFAULT: "oklch(0.7 0.12 195)",
          foreground: "oklch(0.12 0.02 250)",
        },
        secondary: {
          DEFAULT: "oklch(0.18 0.02 250)",
          foreground: "oklch(0.78 0 0)",
        },
        muted: {
          DEFAULT: "oklch(0.18 0.02 250)",
          foreground: "oklch(0.55 0 0)",
        },
        accent: {
          DEFAULT: "oklch(0.7 0.12 195)",
          foreground: "oklch(0.12 0.02 250)",
        },
        destructive: {
          DEFAULT: "oklch(0.577 0.245 27.325)",
          foreground: "oklch(0.985 0 0)",
        },
        border: "oklch(0.2 0.02 250)",
        input: "oklch(0.18 0.02 250)",
        ring: "oklch(0.7 0.12 195)",
      },
      borderRadius: {
        lg: "1rem",
        md: "calc(1rem - 2px)",
        sm: "calc(1rem - 4px)",
      },
      fontFamily: {
        sans: ['"Space Mono"', '"IBM Plex Mono"', "monospace"],
        mono: ['"Space Mono"', '"IBM Plex Mono"', "monospace"],
      },
      keyframes: {
        sweep: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "radar-ping": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
      },
      animation: {
        sweep: "sweep 3s ease-in-out infinite",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "radar-ping": "radar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        blink: "blink 1s step-end infinite",
      },
    },
  },
  plugins: [],
}

import type { Config } from "tailwindcss";

/**
 * Tailwind config for the TTU web app.
 *
 * Note: HeroUI v3 requires Tailwind v4. For this phase we use Tailwind v3
 * (stable, widely supported) and rely on `@ttu/design-system` primitives
 * which compose pure Tailwind utilities. If we adopt HeroUI components
 * later, we'll migrate to Tailwind v4 + the HeroUI plugin.
 *
 * Design tokens here are mapped from the Figma Variables panel of
 * `Fekw3aQtCfQbHq2aoho859` — see apps/web/src/styles/globals.css for the
 * literal source values. Any Figma update MUST be reflected in globals.css
 * first, then re-mapped here.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // Tailwind needs to scan package sources for utility classes.
    "../../packages/design-system/src/**/*.{ts,tsx}",
    "../../packages/cms-registry/src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    // Exclude auto-generated SVG wrappers via globby `!` negation. They
    // contain no Tailwind utilities of their own (only forwarded props),
    // and reading them from the JIT watcher contends with the editor +
    // OneDrive for file locks on Windows (EBUSY on why-ttu-*.tsx).
    "!./src/components/home/icons/**/*.{ts,tsx}",
    "!./src/components/home/decorations/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand (semantic, used in @ttu/ui primitives)
        primary: {
          DEFAULT: "var(--ttu-primary)",
          foreground: "var(--ttu-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--ttu-secondary)",
          foreground: "var(--ttu-secondary-foreground)",
        },
        // Surfaces / text
        background: "var(--ttu-background)",
        foreground: "var(--ttu-foreground)",
        surface: "var(--ttu-surface)",
        muted: {
          DEFAULT: "var(--ttu-muted)",
          foreground: "var(--ttu-muted-foreground)",
        },
        border: "var(--ttu-border)",
        // Legacy aliases (kept for backward-compat with @ttu/ui)
        ttu: {
          primary: "var(--ttu-primary)",
          secondary: "var(--ttu-secondary)",
        },
        // Extended brand palette — every name is a direct mapping to a
        // Figma Variable. Do not add new shades; update Figma first.
        orange: {
          DEFAULT: "var(--ttu-orange)",
          end: "var(--ttu-orange-end)",
        },
        green: {
          light: "var(--ttu-green-light)", // Xanh Sáng #3DB97D
          DEFAULT: "var(--ttu-green-mid)", // Xanh     #229A68
          deep: "var(--ttu-green-deep)", // Xanh Đậm #1F664C
          text: "var(--ttu-green-text)", // Xanh Đen #103925
        },
        red: {
          DEFAULT: "var(--ttu-red)", // Đỏ #E53D38
        },
        // Surfaces (neutral)
        "ttu-white": "var(--ttu-white)",
        "ttu-gray": {
          light: "var(--ttu-gray-light)", // Xám       #F2F2F2
          DEFAULT: "var(--ttu-gray-bg)", // #D9D9D9
          dark: "var(--ttu-gray-dark)", // Xám Đậm #D2D2D2
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
      },
      // Type scale from Figma Variables (D1, D2, H1, H2, B1, B2, B3, Text, BUTTON)
      fontSize: {
        display: ["64px", { lineHeight: "100%", fontWeight: "700" }], // D1
        hero: ["clamp(32px, 5vw, 56px)", { lineHeight: "1.05", fontWeight: "700" }], // Hero h1 (responsive)
        section: ["clamp(24px, 4vw, 40px)", { lineHeight: "1.25", fontWeight: "700" }], // D2 / H1 responsive
        h2: ["24px", { lineHeight: "30px", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "100%", fontWeight: "400" }], // B1
        "body-base": ["16px", { lineHeight: "100%", fontWeight: "600" }], // B2 (semi-bold)
        "body-sm": ["14px", { lineHeight: "100%", fontWeight: "400" }], // B3
        "body-xs": ["12px", { lineHeight: "100%", fontWeight: "300" }], // Text (light)
        button: ["16px", { lineHeight: "100%", fontWeight: "500" }], // BUTTON
      },
      // Gradients from Figma nodes — use via `bg-ttu-gradient-*` utilities
      backgroundImage: {
        "ttu-gradient-hero-overlay": "var(--ttu-gradient-hero-overlay)",
        "ttu-gradient-cta": "var(--ttu-gradient-cta)",
        "ttu-gradient-primary-secondary":
          "var(--ttu-gradient-primary-secondary)",
        "ttu-gradient-primary-secondary-tb":
          "var(--ttu-gradient-primary-secondary-tb)",
      },
      boxShadow: {
        "ttu-500": "var(--ttu-shadow-500)",
      },
      maxWidth: {
        "8xl": "1536px",
      },
    },
  },
  plugins: [],
};

export default config;

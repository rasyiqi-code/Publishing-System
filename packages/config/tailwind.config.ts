import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "../../packages/ui/src/**/*.{tsx,ts}",
        "../../packages/features/*/src/**/*.{tsx,ts}",
        "./app/**/*.{tsx,ts}",
        "./src/**/*.{tsx,ts}"
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    blue: "#003366", // KBM Blue (Placeholder - Update with exact hex)
                    red: "#CC0000",  // KBM Red (Placeholder - Update with exact hex)
                    dark: "#0f172a", // Slate 900
                    light: "#f8fafc", // Slate 50
                },
                sidebar: {
                    bg: "rgba(255, 255, 255, 0.8)",
                    border: "rgba(255, 255, 255, 0.5)",
                }
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
            },
        },
    },
    plugins: [],
};

export default config;

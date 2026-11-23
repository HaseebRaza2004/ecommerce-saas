export const DEFAULT_THEME_ID = "nordic-teal";
export const DEFAULT_COLOR_MODE = "light";

export const THEMES_REGISTRY = Object.freeze([
  {
    id: "nordic-teal",
    name: "Nordic Abyssal Teal",
    vibe: "Modern Fintech & Commerce",
    swatches: ["#0B292E", "#0F766E", "#F4F7F7"],
  },
  {
    id: "velvet-plum",
    name: "Velvet Plum & Warm Stone",
    vibe: "Next-Gen Creator SaaS",
    swatches: ["#2D1123", "#7E1E5C", "#F7F6F4"],
  },
  {
    id: "titanium-mint",
    name: "Titanium Graphite & Cobalt Mint",
    vibe: "Ultra-Clean Swiss UI",
    swatches: ["#18181B", "#00A88F", "#F6F7F9"],
  },
]);

export const isValidThemeId = (id) =>
  THEMES_REGISTRY.some((theme) => theme.id === id);
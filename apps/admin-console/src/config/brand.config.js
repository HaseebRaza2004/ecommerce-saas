export const BRAND_CONFIG = Object.freeze({
  name: "Commercia",
  consoleLabel: "Merchant Console",
  tagline: "Run your commerce empire with clarity, not chaos.",
  subtitle: "The zero-trust operating system for modern omnichannel brands.",
  securityBadge: "Protected by Cloudflare WAF & Zero-Trust Shield",
  supportEmail: "support@commercia.app",
  plans: Object.freeze({
    basic: { label: "Basic", badgeTone: "neutral" },
    standard: { label: "Standard", badgeTone: "info" },
    enterprise: { label: "Enterprise", badgeTone: "accent" },
  }),
  features: Object.freeze({
    v1Enabled: true,
    v2PosModule: false,
    v2MobileBuilder: false,
  }),
});
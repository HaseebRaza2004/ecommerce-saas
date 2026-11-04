import { AppError } from "../../../../core/errors/AppError.js";

const cleanStr = (val, max = 200) =>
  typeof val === "string"
    ? val
        .replace(/[<>'"`;(){}]/g, "")
        .trim()
        .slice(0, max)
    : "";

// Validate the input for updating storefront theme settings
export const validateStoreThemeInput = (body) => {
  if (!body || typeof body !== "object") {
    throw new AppError("Invalid storefront theme payload.", 400);
  }

  const storeName = body.storeName ? cleanStr(body.storeName, 150) : undefined;
  if (storeName !== undefined && storeName.length < 2) {
    throw new AppError("Store name must be at least 2 characters.", 400);
  }

  const rawTheme = body.themeConfig || {};
  const themeConfig = {
    primaryColor: cleanStr(rawTheme.primaryColor || "#000000", 20),
    secondaryColor: cleanStr(rawTheme.secondaryColor || "#ffffff", 20),
    accentColor: cleanStr(rawTheme.accentColor || "#ff6600", 20),
    fontFamily: cleanStr(rawTheme.fontFamily || "Inter", 50),
    logoUrl:
      typeof rawTheme.logoUrl === "string" &&
      rawTheme.logoUrl.startsWith("https://")
        ? rawTheme.logoUrl.trim()
        : null,
    faviconUrl:
      typeof rawTheme.faviconUrl === "string" &&
      rawTheme.faviconUrl.startsWith("https://")
        ? rawTheme.faviconUrl.trim()
        : null,
    borderRadius: cleanStr(rawTheme.borderRadius || "8px", 20),
  };

  const rawUi = body.uiComponents || {};
  const heroBanners = Array.isArray(rawUi.heroBanners)
    ? rawUi.heroBanners
        .filter((u) => typeof u === "string" && u.startsWith("https://"))
        .slice(0, 6)
    : [];

  const uiComponents = {
    categoryDisplayStyle:
      rawUi.categoryDisplayStyle === "text_bar" ? "text_bar" : "visual_grid",
    showAnnouncementBar: rawUi.showAnnouncementBar !== false,
    announcementText: cleanStr(rawUi.announcementText || "", 250),
    heroBanners,
    enableQuickViewModal: rawUi.enableQuickViewModal !== false,
    enableWhatsappFloatingButton: rawUi.enableWhatsappFloatingButton !== false,
  };

  const localization =
    body.localization && typeof body.localization === "object"
      ? {
          defaultCurrency: cleanStr(
            body.localization.defaultCurrency || "PKR",
            10,
          ).toUpperCase(),
          defaultLanguage: cleanStr(
            body.localization.defaultLanguage || "en",
            10,
          ).toLowerCase(),
          enableAutoGeoCurrency:
            body.localization.enableAutoGeoCurrency !== false,
        }
      : undefined;

  return { storeName, themeConfig, uiComponents, localization };
};
// Utility function to generate SEO-friendly slugs from text.
export const generateSeoSlug = (text) => {
  if (!text || typeof text !== "string") return "";

  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

// Utility function to build a category path based on parent path and current slug.
export const buildCategoryPath = (parentPath, currentSlug) => {
  if (!parentPath || parentPath === "/") {
    return `/${currentSlug}`;
  }
  return `${parentPath.replace(/\/$/, "")}/${currentSlug}`;
};
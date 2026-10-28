/**
 * 🧹 LIST OF COMMON HONORIFICS, PREFIXES & TITLES
 * Why: Prevents false-rejections when bank titles abbreviate or omit prefixes.
 */
const IGNORED_HONORIFICS = new Set([
  "muhammad", "mohammad", "mohammed", "mohd", "md", "m",
  "syed", "sayed", "sayyid", "syeda",
  "sheikh", "shaikh", "sh",
  "ch", "chaudhry", "chaudhary", "chowdhury",
  "malik", "mirza", "sardar", "nawab", "raja", "rana", "mian", "khawaja",
  "haji", "alhaj", "hafiz", "qari", "maulana", "mufti", "pir",
  "mr", "mrs", "ms", "miss", "dr", "engr", "prof",
  "mst", "musammat", "bibi", "begum", "binte", "bin", "ibn",
]);

/**
 * 🧼 MICRO-FUNCTION 1: Sanitize & Tokenize Name String
 */
export const tokenizeRawName = (rawName) => {
  if (!rawName || typeof rawName !== "string") return [];

  return rawName
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ") // Remove dots, hyphens, numbers, special chars
    .split(/\s+/)
    .filter((token) => token.length > 0);
};

/**
 * 🎯 MICRO-FUNCTION 2: Extract Core Identity Tokens
 * Why: Strips honorifics, but safely falls back to original tokens if all words were honorifics (e.g., "Muhammad Syed").
 */
export const extractCoreNameTokens = (rawName) => {
  const allTokens = tokenizeRawName(rawName);
  const coreTokens = allTokens.filter((token) => !IGNORED_HONORIFICS.has(token));

  return coreTokens.length > 0 ? coreTokens : allTokens;
};

/**
 * 🤝 MICRO-FUNCTION 3: Reconcile CNIC Exact Name vs Bank Account Title
 * Rule: Every core token in the shorter name (or >= 60% minimum overlap) must exist in the other.
 */
export const reconcileKycNames = (cnicExactName, bankAccountTitle) => {
  const cnicTokens = extractCoreNameTokens(cnicExactName);
  const bankTokens = extractCoreNameTokens(bankAccountTitle);

  if (cnicTokens.length === 0 || bankTokens.length === 0) {
    return {
      cnicTokens,
      bankTokens,
      overlapScore: 0,
      overlapPassed: false,
    };
  }

  const bankTokenSet = new Set(bankTokens);
  const matchedTokens = cnicTokens.filter((token) => bankTokenSet.has(token));

  // Calculate overlap against the smaller token array (handles "M. Hassan" vs "Muhammad Hassan Ali")
  const minTokenCount = Math.min(cnicTokens.length, bankTokens.length);
  const overlapScore = Number((matchedTokens.length / minTokenCount).toFixed(2));

  // Pass if at least 1 strong core token matches AND overlap score >= 0.60 (60%)
  const overlapPassed = matchedTokens.length >= 1 && overlapScore >= 0.6;

  return {
    cnicTokens,
    bankTokens,
    matchedTokens,
    overlapScore,
    overlapPassed,
  };
};
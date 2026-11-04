import { redisClient } from "../../../../config/redis.client.js";
import { getL1Cache, setL1Cache } from "../../../../core/redis/l1Cache.util.js";

const FALLBACK_PKR_RATES = {
  PKR: 1.0,
  USD: 0.0036,
  EUR: 0.0033,
  GBP: 0.0028,
  AED: 0.0132,
  SAR: 0.0135,
  CAD: 0.005,
  AUD: 0.0055,
};

const COUNTRY_TO_CURRENCY = {
  PK: "PKR",
  US: "USD",
  GB: "GBP",
  AE: "AED",
  SA: "SAR",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  CA: "CAD",
  AU: "AUD",
};

// Fetch Live PKR Exchange Rates with 2.5s Timeout & 24-Hour Redis Cache (86400s)
const fetchLivePkrRates = async () => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch("https://open.er-api.com/v6/latest/PKR", {
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return FALLBACK_PKR_RATES;
    const data = await res.json();
    return data?.rates || FALLBACK_PKR_RATES;
  } catch {
    return FALLBACK_PKR_RATES;
  }
};

export const getCurrencyDisplayQuoteService = async (
  countryCode = "PK",
  amountPkr = 1000,
) => {
  const cleanCountry = String(countryCode || "PK")
    .toUpperCase()
    .trim();
  const targetCurrency = COUNTRY_TO_CURRENCY[cleanCountry] || "USD";
  const cacheKey = "global:fx:live_pkr_rates_24h";

  let rates = getL1Cache(cacheKey);
  if (!rates) {
    const cachedRedis = await redisClient.get(cacheKey);
    if (cachedRedis) {
      rates = JSON.parse(cachedRedis);
    } else {
      rates = await fetchLivePkrRates();
      await redisClient.set(cacheKey, JSON.stringify(rates), "EX", 86400); // Locked for 24 Hours
    }
    setL1Cache(cacheKey, rates, 600);
  }

  const rate = Number(rates[targetCurrency] || FALLBACK_PKR_RATES.USD);
  const numericPkr = Math.max(0, Number(amountPkr) || 0);

  return {
    detected_country: cleanCountry,
    base_currency: "PKR",
    base_amount: numericPkr.toFixed(2),
    display_currency: targetCurrency,
    exchange_rate: rate,
    display_amount_approx: (numericPkr * rate).toFixed(2),
    cache_ttl_policy: "24_hours_live_fx",
    settlement_rule: "Charged in PKR at checkout (Zero FX loss for merchant).",
  };
};
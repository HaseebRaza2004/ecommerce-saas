import { redisClient } from "../../../../config/redis.client.js";
import { getL1Cache, setL1Cache } from "../../../../core/redis/l1Cache.util.js";

// Fallback benchmark rates (1 PKR -> Target Currency) if external FX feed is offline
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

// Retrieve Currency Display Quote for Checkout (PKR -> Target Currency)
export const getCurrencyDisplayQuoteService = async (
  countryCode = "PK",
  amountPkr = 1000,
) => {
  const cleanCountry = String(countryCode || "PK")
    .toUpperCase()
    .trim();
  const targetCurrency = COUNTRY_TO_CURRENCY[cleanCountry] || "USD";
  const cacheKey = "global:fx:pkr_rates";

  let rates = getL1Cache(cacheKey);
  if (!rates) {
    const cachedRedis = await redisClient.get(cacheKey);
    if (cachedRedis) {
      rates = JSON.parse(cachedRedis);
    } else {
      rates = FALLBACK_PKR_RATES;
      await redisClient.set(cacheKey, JSON.stringify(rates), "EX", 21600); // 6 Hours TTL
    }
    setL1Cache(cacheKey, rates, 300);
  }

  const rate = rates[targetCurrency] || rates.USD;
  const numericPkr = Math.max(0, Number(amountPkr) || 0);
  const convertedDisplayAmount = (numericPkr * rate).toFixed(2);

  return {
    detected_country: cleanCountry,
    base_currency: "PKR",
    base_amount: numericPkr.toFixed(2),
    display_currency: targetCurrency,
    exchange_rate: rate,
    display_amount_approx: convertedDisplayAmount,
    settlement_rule: "Charged in PKR at checkout (Zero FX loss for merchant).",
  };
};
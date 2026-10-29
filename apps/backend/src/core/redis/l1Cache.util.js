/**
 * ⚡ L1 IN-MEMORY NEAR-CACHE (Zero Network Hop Latency Boost)
 * Why: Eliminates 100ms+ cross-continent Redis network hops for hot keys & token checks.
 */
const l1Store = new Map();
const MAX_L1_ITEMS = 2000;

export const getL1Cache = (key) => {
  const item = l1Store.get(key);
  if (!item) return null;

  if (Date.now() > item.expiresAt) {
    l1Store.delete(key);
    return null;
  }
  return item.value;
};

export const setL1Cache = (key, value, ttlSeconds = 15) => {
  if (l1Store.size >= MAX_L1_ITEMS) {
    const oldestKey = l1Store.keys().next().value;
    l1Store.delete(oldestKey);
  }
  l1Store.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

export const clearL1ByPrefix = (prefix) => {
  for (const key of l1Store.keys()) {
    if (key.startsWith(prefix)) l1Store.delete(key);
  }
};
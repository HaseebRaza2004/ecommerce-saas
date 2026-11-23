const listeners = new Set();

export function subscribeUiPrefs(callback) {
  listeners.add(callback);
  const onStorage = () => callback();
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function readUiPref(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const val = window.localStorage.getItem(key);
    return val ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeUiPref(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage quota / private mode failures
  }
  listeners.forEach((fn) => fn());
}
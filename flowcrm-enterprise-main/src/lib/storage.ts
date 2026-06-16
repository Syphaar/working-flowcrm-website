const PREFIX = "flowcrm:";
export const storage = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const data = window.localStorage.getItem(PREFIX + key);
      return data ? (JSON.parse(data) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* noop */
    }
  },
  remove(key: string) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(PREFIX + key);
    } catch {
      /* noop */
    }
  },
  clearAll() {
    if (typeof window === "undefined") return;
    try {
      Object.keys(window.localStorage)
        .filter((key) => key.startsWith(PREFIX))
        .forEach((key) => window.localStorage.removeItem(key));
    } catch {
      /* noop */
    }
  },
};

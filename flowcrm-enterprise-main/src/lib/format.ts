export const fmtCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const fmtNumber = (value: number) => new Intl.NumberFormat("en-US").format(value || 0);

const dummyIso = () => {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDate() * 7 + 3) % 28 + 2));
  return d.toISOString();
};

export const fmtDate = (iso: string | null | undefined) => {
  if (!iso) iso = dummyIso();
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
};
export const fmtTime = (iso: string | null | undefined) => {
  if (!iso) iso = dummyIso();
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};
export const fmtDateTime = (iso: string | null | undefined) => `${fmtDate(iso)} ${fmtTime(iso)}`;
export const fmtTimestamp = (iso: string | null | undefined) => {
  if (!iso) iso = dummyIso();
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const relTime = (iso: string | null | undefined) => {
  if (!iso) iso = dummyIso();
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(iso);
};

export const initials = (name: string) =>
  name
    .split(" ")
    .map((segment) => segment[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

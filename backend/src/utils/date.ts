export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getRelativeTime(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const differenceInMs = now.getTime() - date.getTime();
  const differenceInSeconds = Math.floor(differenceInMs / 1000);
  const differenceInMinutes = Math.floor(differenceInSeconds / 60);
  const differenceInHours = Math.floor(differenceInMinutes / 60);
  const differenceInDays = Math.floor(differenceInHours / 24);

  if (differenceInSeconds < 60) {
    return "just now";
  }
  if (differenceInMinutes < 60) {
    return `${differenceInMinutes}m ago`;
  }
  if (differenceInHours < 24) {
    return `${differenceInHours}h ago`;
  }
  if (differenceInDays < 7) {
    return `${differenceInDays}d ago`;
  }
  return formatDate(isoString);
}

export function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}

export function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString();
}

export function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60000).toISOString();
}

export function now(): string {
  return new Date().toISOString();
}

export function isOverdue(dateString: string): boolean {
  return new Date(dateString) < new Date();
}

export function getStartOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getEndOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

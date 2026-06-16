let seedValue = 20260612;

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    let value = (state += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const randomGenerator = mulberry32(seedValue);

export function setSeed(seed: number): void {
  seedValue = seed;
}

export function generateId(prefix: string, index: number): string {
  return `${prefix}_${(index + 1).toString().padStart(4, "0")}`;
}

export function pickRandom<T>(array: T[]): T {
  return array[Math.floor(randomGenerator() * array.length)];
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(randomGenerator() * (max - min + 1)) + min;
}

export function randomBoolean(): boolean {
  return randomGenerator() > 0.5;
}

export function generateEmail(name: string, domain: string): string {
  return `${name.toLowerCase().replace(/[^a-z]/g, ".")}@${domain
    .toLowerCase()
    .replace(/[^a-z]/g, "")}.com`;
}

export function generatePhone(): string {
  return `+1 (${randomBetween(200, 999)}) ${randomBetween(
    100,
    999
  )}-${randomBetween(1000, 9999)}`;
}

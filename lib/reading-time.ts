export function readingMinutes(charCount: number): number {
  return Math.max(1, Math.round(charCount / 500));
}

export function readingTime(charCount: number): string {
  return `${readingMinutes(charCount)}분`;
}

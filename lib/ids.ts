export function toIdOrNull(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function isStaleAttemptError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('no longer in progress') ||
    lower.includes('not in progress') ||
    lower.includes('cannot modify') ||
    lower.includes('attempt not found') ||
    message.includes('409') ||
    message.includes('404')
  );
}

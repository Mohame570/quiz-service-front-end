// this is to enusre the safe timezone
export function getSafeTimezone(tz?: string | null): string {
  if (!tz) return 'UTC';

  const trimmed = tz.trim();

  // Try the raw value first — handles clean IANA identifiers like "Africa/Cairo"
  if (isValidTimezone(trimmed)) return trimmed;

  // Try normalizing common malformed patterns, e.g. "Africa, Cairo" -> "Africa/Cairo"
  const normalized = trimmed.replace(/,\s*/g, '/');
  if (isValidTimezone(normalized)) return normalized;

  // Strip trailing descriptive suffixes like "(EET)" or extra text after a space
  const beforeParen = trimmed.split('(')[0].trim();
  if (isValidTimezone(beforeParen)) return beforeParen;

  return 'UTC';
}

function isValidTimezone(candidate: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: candidate });
    return true;
  } catch {
    return false;
  }
}

function isSameDayInTimezone(a: Date, b: Date, timeZone: string): boolean {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  });
  return formatter.format(a) === formatter.format(b);
}

export function formatScheduleWindow(
  startStr: string | null | undefined,
  endStr: string | null | undefined,
  timezoneLabel: string
): string {
  const safeTz = getSafeTimezone(timezoneLabel);

  const startLabel = 'Anytime';
  const endLabel = 'No deadline';

  // Both missing
  if (!startStr && !endStr) {
    return `${startLabel} → ${endLabel}`;
  }

  const fullFormat: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: safeTz,
  };

  try {
    // Only end date missing
    if (startStr && !endStr) {
      const start = new Date(startStr);
      return `${new Intl.DateTimeFormat('en-US', fullFormat).format(start)} → ${endLabel}`;
    }

    // Only start date missing
    if (!startStr && endStr) {
      const end = new Date(endStr);
      return `${startLabel} → ${new Intl.DateTimeFormat('en-US', fullFormat).format(end)}`;
    }

    // Both present — original logic
    const start = new Date(startStr as string);
    const end = new Date(endStr as string);
    const isSameDay = isSameDayInTimezone(start, end, safeTz);

    if (isSameDay) {
      const timeOnly: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone: safeTz,
      };
      return `${new Intl.DateTimeFormat('en-US', fullFormat).format(start)} → ${new Intl.DateTimeFormat('en-US', timeOnly).format(end)}`;
    }

    return `${new Intl.DateTimeFormat('en-US', fullFormat).format(start)} → ${new Intl.DateTimeFormat('en-US', fullFormat).format(end)}`;
  } catch {
    const startFallback = startStr ? new Date(startStr).toLocaleDateString() : startLabel;
    const endFallback = endStr ? new Date(endStr).toLocaleDateString() : endLabel;
    return `${startFallback} → ${endFallback}`;
  }
}
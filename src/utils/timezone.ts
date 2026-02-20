import { TIMEZONE } from '../constants';

export function getChileOffsetMs(dateStr: string): number {
  const ref = new Date(`${dateStr}T12:00:00Z`);
  const utcStr = ref.toLocaleString('en-US', { timeZone: 'UTC' });
  const chileStr = ref.toLocaleString('en-US', { timeZone: TIMEZONE });
  return new Date(chileStr).getTime() - new Date(utcStr).getTime();
}

export function getDateRangeUTC(dateStr: string): { start: string; end: string } {
  const offsetMs = getChileOffsetMs(dateStr);
  const start = new Date(new Date(`${dateStr}T00:00:00Z`).getTime() - offsetMs);
  const end = new Date(new Date(`${dateStr}T23:59:59.999Z`).getTime() - offsetMs);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function toUTCTimestamp(dateStr: string, timeStr: string): string {
  const offsetMs = getChileOffsetMs(dateStr);
  const local = new Date(`${dateStr}T${timeStr}:00Z`);
  return new Date(local.getTime() - offsetMs).toISOString();
}

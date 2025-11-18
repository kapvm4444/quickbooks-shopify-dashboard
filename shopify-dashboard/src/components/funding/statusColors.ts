
/**
 * Shared status utilities for funding UI.
 * Normalizes statuses and provides consistent theming colors.
 */
export type NormalizedStatus = 'pending' | 'funded' | 'closed';

export function normalizeStatus(status?: string | null): NormalizedStatus | null {
  if (!status) return null;
  const s = String(status).trim().toLowerCase();
  if (s === 'pending' || s === 'proposed' || s === 'proposal') return 'pending';
  if (s === 'funded' || s === 'committed' || s === 'commitment') return 'funded';
  // Treat "received" as closed for visualization and milestone logic
  if (s === 'closed' || s === 'received' || s === 'paid') return 'closed';
  return null;
}

// Use design tokens from theme (no hard-coded hex); reuse chart palette for clarity.
// - pending: chart-3
// - funded: chart-1
// - closed: chart-2
export const STATUS_COLOR_MAP: Record<NormalizedStatus, string> = {
  pending: 'hsl(var(--chart-3))',
  funded: 'hsl(var(--chart-1))',
  closed: 'hsl(var(--chart-2))',
};

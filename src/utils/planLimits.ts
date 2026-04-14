// planLimits.ts
//
// SoloMarket is a one-time purchase — everyone who buys gets the founder plan.
// Two states only: free (trial) and founder (purchased = unlimited).

export interface PlanLimits {
  campaigns: number;        // max active campaign systems (Infinity = unlimited)
  aiDraftsPerMonth: number; // max AI content drafts per calendar month
  leads: number;            // max leads stored
}

const LIMITS: Record<string, PlanLimits> = {
  free:    { campaigns: 1, aiDraftsPerMonth: 3, leads: 100 },
  founder: { campaigns: Infinity, aiDraftsPerMonth: Infinity, leads: Infinity },
};

const ADMIN_EMAILS = ['ketorah.digital@gmail.com'];

export function isAdmin(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}

export function getPlanLimits(plan: string, email?: string | null): PlanLimits {
  if (isAdmin(email)) return LIMITS.founder;
  return LIMITS[plan] ?? LIMITS.free;
}

// ── AI draft counter (localStorage, resets each calendar month) ──────────────

function draftKey(userId: string): string {
  const now = new Date();
  return `sm_ai_drafts_${userId}_${now.getFullYear()}_${now.getMonth()}`;
}

export function getAiDraftsUsed(userId: string): number {
  return parseInt(localStorage.getItem(draftKey(userId)) || '0', 10);
}

export function incrementAiDrafts(userId: string): void {
  const key = draftKey(userId);
  const current = parseInt(localStorage.getItem(key) || '0', 10);
  localStorage.setItem(key, String(current + 1));
}

export function planLabel(plan: string): string {
  return plan === 'founder' ? 'Founder' : 'Free';
}

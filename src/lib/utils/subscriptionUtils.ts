import type { Plan } from '@/lib/types/plan.types';

/**
 * Cleanly formats the plan billing period label (e.g. "/mo", "/yr"),
 * preventing "undefinedmo" when durationMonths is missing or undefined.
 */
export function formatPlanBillingPeriod(plan?: { durationMonths?: number; billingCycle?: string } | null): string {
  if (!plan) return '/mo';

  if (plan.durationMonths) {
    if (plan.durationMonths === 1) return '/mo';
    if (plan.durationMonths === 12) return '/yr';
    return `/${plan.durationMonths}mo`;
  }

  if (plan.billingCycle) {
    const cycle = plan.billingCycle.toUpperCase();
    if (cycle === 'ANNUALLY' || cycle === 'YEARLY') return '/yr';
    if (cycle === 'MONTHLY') return '/mo';
    return `/${cycle.toLowerCase()}`;
  }

  return '/mo';
}

/**
 * Sanitizes static typographical errors in plan feature lists
 * (e.g. reconcilation -> Reconciliation, complience -> Compliance).
 */
export function cleanPlanFeature(feature: string): string {
  if (!feature) return '';
  return feature
    .replace(/\breconcilation\b/gi, 'Reconciliation')
    .replace(/\bcomplience\b/gi, 'Compliance')
    .replace(/\bmanagment\b/gi, 'Management')
    .replace(/\bautomtic\b/gi, 'Automatic')
    .replace(/\bunlimted\b/gi, 'Unlimited')
    .replace(/\breciepts?\b/gi, 'Receipts')
    .replace(/\binvoies\b/gi, 'Invoices')
    .replace(/\bsuport\b/gi, 'Support')
    .replace(/\bmuti-user\b/gi, 'Multi-user')
    .replace(/\bdocumnt\b/gi, 'Document')
    .replace(/\s+/g, ' ')
    .trim();
}

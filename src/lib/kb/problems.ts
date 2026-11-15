// What #4471 actually holds, problem by problem. causes.ts tells `parser` from `hint` by tenant
// and channel, but both show the same thing: day and month swapped. A one-day move
// (desk-notes.json) shows something else: a problem of its own. Counts follow the desk's view
// (CauseTable): every report stays under its cause, so the swap count includes the one-day moves.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'swap' | 'one-day' | 'unplaced';

export function problemOf(r: Report, t: Tenant | undefined): Problem {
  return causeOf(r, t) ? 'swap' : 'unplaced';
}

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
};

export function groupByProblem(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDay: readonly string[],
): { merged: Report[]; groups: ProblemGroup[] } {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const by = new Map<Problem, Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r));
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const moved = merged.filter((r) => oneDay.includes(r.id));
  if (moved.length) by.set('one-day', moved);
  const groups = [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: new Set(rs.map((r) => r.tenant)).size,
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
  return { merged, groups };
}

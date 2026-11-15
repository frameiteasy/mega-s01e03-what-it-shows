<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import tickets from '#lib/data/tickets-4471.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { groupByProblem, type Problem } from '#lib/kb/problems';

  let { ticket }: { ticket: number } = $props();

  const WHAT: Record<Problem, string> = {
    swap: 'day and month swapped: a day-first date read month first',
    'one-day': 'date moves by one day; nothing is swapped',
    unplaced: 'no tenant on file: cause unknown',
  };

  const result = $derived(groupByProblem(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const link = (p: Problem) => (tickets as Record<string, string>)[p] ?? '';
</script>

<p class="sum">
  <strong>{result.merged.length}</strong> reports in #{ticket} ·
  <strong>{result.groups.length}</strong>
  {result.groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>what it shows</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each result.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{WHAT[g.problem]}</td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if link(g.problem)}<a href={link(g.problem)}>{link(g.problem).replace(/^.*\/issues\//, '#')}</a>{:else}none yet{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<p class="note">Counted the desk's way (<code>CauseTable</code>): every report stays under its cause, so <code>swap</code> includes the reports read as a one-day move.</p>

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>

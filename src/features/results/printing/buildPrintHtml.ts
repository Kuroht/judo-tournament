/**
 * =====================================================
 * FILE: buildPrintHtml.ts
 * PURPOSE: Builds the pages to print: results, the medal
 *          table, and each category's bracket or poules.
 *          Pure functions, so they're easy to test.
 * USED BY: usePrintResults.ts
 * =====================================================
 */
import type { CategoryContests, Contest } from '@/features/matches';
import type { useT } from '@/lib/i18n/useT';

import { buildMedalTable, toCategoryResult } from '../buildResults';

type Translate = ReturnType<typeof useT>;

const PAGE_STYLE = `
  body { font-family: sans-serif; color: #000; }
  h1 { font-size: 22px; }
  h2 { font-size: 18px; margin-top: 20px; }
  h3 { font-size: 15px; margin-bottom: 4px; }
  table { border-collapse: collapse; width: 100%; font-size: 13px; }
  th, td { border: 1px solid #555; padding: 4px 6px; text-align: left; }
  section { break-inside: avoid; }
`;

/**
 * Makes text safe to put in a page. Names come from the trainer or an imported file, so
 * without this, a name like "<b>" would break the page.
 * @example
 * escapeHtml('Ana & <Rui>'); // "Ana &amp; &lt;Rui&gt;"
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Builds a table. Every value is escaped here, so callers can't forget to. */
function buildTable(headings: readonly string[], rows: readonly (readonly string[])[]): string {
  const headingCells = headings.map((heading) => `<th>${escapeHtml(heading)}</th>`).join('');
  const bodyRows = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
    .join('');

  return `<table><thead><tr>${headingCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
}

function buildPage(title: string, body: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>${PAGE_STYLE}</style></head><body><h1>${escapeHtml(title)}</h1>${body}</body></html>`;
}

/** Names the group a contest is printed under, such as "Poule A" or "Repescagem". */
function groupNameOf(contest: Contest, t: Translate): string {
  const part =
    contest.pouleName === null
      ? t(`matches.part.${contest.part}`)
      : t('draw.poule', { poule: contest.pouleName });

  return contest.isPlayoff ? `${part} · ${t('matches.playoff')}` : part;
}

/** Writes who won a contest and how, or leaves it blank for writing in by hand. */
function describeResult(contest: Contest, t: Translate): [string, string] {
  if (!contest.isFinished) {
    return ['', ''];
  }

  const how = contest.resultType === null ? '' : t(`matches.result.${contest.resultType}`);
  if (contest.winnerEntryId === null) {
    return [t('matches.bothLost'), how];
  }

  const winner = contest.winnerEntryId === contest.white?.entryId ? contest.white : contest.blue;

  return [winner?.name ?? '', how];
}

/**
 * Builds the page of results: the medal table, then each category's places.
 * @param tournamentName the title of the page
 * @param categories the categories to print
 * @param t the translation function
 * @returns the page
 */
export function buildResultsHtml(
  tournamentName: string,
  categories: readonly CategoryContests[],
  t: Translate,
): string {
  const results = categories.map(toCategoryResult);
  const medalRows = buildMedalTable(results).map((row) => [
    row.clubName ?? t('results.noClub'),
    String(row.gold),
    String(row.silver),
    String(row.bronze),
  ]);
  const medals = buildTable(
    [
      t('results.print.club'),
      t('results.print.gold'),
      t('results.print.silver'),
      t('results.print.bronze'),
    ],
    medalRows,
  );

  const sections = results.map((result) => {
    const body = result.isComplete
      ? buildTable(
          [t('results.print.place'), t('results.print.athlete'), t('results.print.club')],
          result.placed.map(({ place, athlete }) => [
            t('results.place', { place }),
            athlete.name,
            athlete.clubName ?? '',
          ]),
        )
      : `<p>${escapeHtml(t('results.inProgress', { done: result.finishedCount, total: result.totalCount }))}</p>`;

    return `<section><h3>${escapeHtml(result.title)}</h3>${body}</section>`;
  });

  return buildPage(
    `${tournamentName} · ${t('results.title')}`,
    `<h2>${escapeHtml(t('results.medals'))}</h2>${medals}<h2>${escapeHtml(t('results.categories'))}</h2>${sections.join('')}`,
  );
}

/**
 * Builds the page of each category's contests, grouped by part of the bracket or poule.
 * Contests still to be fought have blank results, so the page can be filled in by hand.
 * @param tournamentName the title of the page
 * @param categories the categories to print
 * @param t the translation function
 * @returns the page
 */
export function buildContestsHtml(
  tournamentName: string,
  categories: readonly CategoryContests[],
  t: Translate,
): string {
  const sections = categories.map((category) => {
    const groupNames = [...new Set(category.contests.map((contest) => groupNameOf(contest, t)))];
    const groups = groupNames.map((groupName) => {
      const rows = category.contests
        .filter((contest) => groupNameOf(contest, t) === groupName)
        .map((contest) => [
          contest.white?.name ?? '—',
          contest.blue?.name ?? '—',
          ...describeResult(contest, t),
        ]);
      const table = buildTable(
        [
          t('matches.side.white'),
          t('matches.side.blue'),
          t('results.print.winner'),
          t('results.print.how'),
        ],
        rows,
      );

      return `<h3>${escapeHtml(groupName)}</h3>${table}`;
    });

    return `<section><h2>${escapeHtml(category.title)}</h2>${groups.join('')}</section>`;
  });

  return buildPage(`${tournamentName} · ${t('matches.title')}`, sections.join(''));
}

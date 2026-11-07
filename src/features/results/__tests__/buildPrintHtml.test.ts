/**
 * =====================================================
 * FILE: buildPrintHtml.test.ts
 * PURPOSE: Checks what is printed, and that names can't
 *          break the page.
 * USED BY: npm test
 * =====================================================
 */
import type { CategoryContests, Contest, ContestAthlete } from '@/features/matches';

import { buildContestsHtml, buildResultsHtml, escapeHtml } from '../printing/buildPrintHtml';

// The translation function just gives back its key, so tests don't depend on wording.
const t = ((key: string) => key) as Parameters<typeof buildResultsHtml>[2];

function athlete(id: number, name: string, clubName: string | null): ContestAthlete {
  return { entryId: `e${id}`, name, clubId: clubName, clubName, position: id, weighedKg: 50 };
}

const ana = athlete(1, 'Ana & <b>Rui</b>', 'Clube "A"');
const eva = athlete(2, 'Eva', null);

function contest(overrides: Partial<Contest>): Contest {
  return {
    key: 'final',
    part: 'final',
    pouleName: null,
    isPlayoff: false,
    white: ana,
    blue: eva,
    isFinished: true,
    winnerEntryId: ana.entryId,
    resultType: 'ippon',
    ...overrides,
  };
}

function category(contests: Contest[], places = [{ position: 1, place: 1 }]): CategoryContests {
  return {
    categoryId: 'c1',
    title: 'Cadetes · -60 kg',
    format: 'directKnockout',
    isReady: true,
    runningKeys: [],
    athletes: [ana, eva],
    finished: [],
    contests,
    places,
  };
}

describe('escapeHtml', () => {
  it('makes every special character safe', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;',
    );
  });
});

describe('buildResultsHtml', () => {
  it('shows the tournament, the places and the medal table', () => {
    const html = buildResultsHtml('Taça', [category([contest({})])], t);

    expect(html).toContain('<h1>Taça');
    expect(html).toContain('Cadetes · -60 kg');
    expect(html).toContain('<td>Clube &quot;A&quot;</td><td>1</td><td>0</td><td>0</td>');
  });

  it('never lets a name become part of the page', () => {
    const html = buildResultsHtml('<script>x</script>', [category([contest({})])], t);

    expect(html).not.toContain('<b>Rui');
    expect(html).not.toContain('<script>');
    expect(html).toContain('Ana &amp; &lt;b&gt;Rui&lt;/b&gt;');
  });

  it('shows no places for a category that has not finished', () => {
    const html = buildResultsHtml('Taça', [category([contest({ isFinished: false })])], t);

    expect(html).toContain('results.inProgress');
    expect(html).not.toContain('Ana &amp;');
  });
});

describe('buildContestsHtml', () => {
  it('groups contests by part, with who won and how', () => {
    const html = buildContestsHtml(
      'Taça',
      [
        category([
          contest({ part: 'semiFinal', key: 's' }),
          contest({ blue: null, isFinished: false }),
        ]),
      ],
      t,
    );

    expect(html).toContain('<h3>matches.part.semiFinal</h3>');
    expect(html).toContain('<h3>matches.part.final</h3>');
    expect(html).toContain('matches.result.ippon');
    // A contest still to come has blank results, to be filled in by hand.
    expect(html).toContain('<td>—</td><td></td><td></td>');
  });

  it('names a poule, and marks a tie contest', () => {
    const html = buildContestsHtml(
      'Taça',
      [
        category([
          contest({ part: 'poule', pouleName: 'A', key: 'p1' }),
          contest({ part: 'poule', pouleName: 'A', key: 'p2', isPlayoff: true }),
        ]),
      ],
      t,
    );

    expect(html).toContain('<h3>draw.poule</h3>');
    expect(html).toContain('<h3>draw.poule · matches.playoff</h3>');
  });

  it('says when both athletes lost', () => {
    const html = buildContestsHtml(
      'Taça',
      [category([contest({ winnerEntryId: null, resultType: 'hansokuMake' })])],
      t,
    );

    expect(html).toContain('<td>matches.bothLost</td>');
  });
});

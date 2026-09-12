import { expect, test } from '@playwright/test';

const routes = [
  { hash: '#/', heading: /bug catcher rick/i },
  { hash: '#/dossier', heading: /dossier/i },
];

for (const route of routes) {
  test(`${route.hash} loads with heading`, async ({ page }) => {
    await page.goto(route.hash);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(route.heading);
    // The empty Dossier state has no sprite by design; the example flow below asserts it there.
    if (route.hash === '#/') {
      await expect(page.getByRole('img', { name: 'Bug Catcher Rick sprite' }).first()).toBeVisible();
    }
  });
}

test('dossier example renders a SEV1 card with mitigation-first route', async ({ page }) => {
  await page.goto('#/dossier');
  await page.getByRole('button', { name: /load example/i }).click();
  await expect(page.getByTestId('sev-badge')).toHaveAttribute('data-sev', '1');
  await expect(page.getByTestId('route-callout')).toContainText('mitigation FIRST');
  await expect(page.getByRole('img', { name: 'Bug Catcher Rick sprite' }).first()).toBeVisible();
});

test('an unknown hash (including the removed #/battle) redirects to #/', async ({ page }) => {
  for (const hash of ['#/battle', '#/nope/deeper']) {
    await page.goto(hash);
    await expect(page).toHaveURL(/#\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/bug catcher rick/i);
  }
});

// Acceptance criterion 10 (motion): under prefers-reduced-motion nothing animates or transitions.
test('prefers-reduced-motion disables every animation and transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const hash of ['#/', '#/dossier']) {
    await page.goto(hash);
    if (hash === '#/dossier') await page.getByRole('button', { name: /load example/i }).click();
    const offenders = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('body *')]
        .flatMap((el) =>
          ['', '::before', '::after'].map((pseudo) => {
            const cs = getComputedStyle(el, pseudo || null);
            const animated = cs.animationName !== 'none' && cs.animationDuration !== '0s';
            const transitions = cs.transitionDuration.split(',').some((d) => d.trim() !== '0s');
            return animated || transitions ? `${el.tagName.toLowerCase()}.${el.className}${pseudo}` : null;
          }),
        )
        .filter((x): x is string => x !== null),
    );
    expect(offenders, `${hash} animated elements`).toEqual([]);
  }
  // Sanity: the sprite does bob when motion is allowed, so the assertion above is meaningful.
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('#/');
  const name = await page.getByRole('img', { name: 'Bug Catcher Rick sprite' }).first().evaluate((e) => getComputedStyle(e).animationName);
  expect(name).not.toBe('none');
});

// Acceptance criterion 9: layout holds on narrow phones with no horizontal page scroll.
for (const width of [400, 375]) {
  test(`no horizontal page scroll at ${width}px on both routes`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    for (const hash of ['#/', '#/dossier']) {
      await page.goto(hash);
      if (hash === '#/dossier') await page.getByRole('button', { name: /load example/i }).click();
      const [sw, cw] = await page.evaluate(() => [
        document.documentElement.scrollWidth,
        document.documentElement.clientWidth,
      ]);
      expect(sw, `${hash} at ${width}px`).toBeLessThanOrEqual(cw);
    }
  });
}

// Acceptance criterion 10: every interactive element shows a focus ring that contrasts with its surface.
const INK = 'rgb(15, 56, 15)';
const CREAM = 'rgb(246, 241, 223)';

async function focusedOutline(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const cs = getComputedStyle(el);
    // Walk up to the nearest painted background so the ring is compared with what is actually behind it.
    let node: HTMLElement | null = el;
    let bg = cs.backgroundColor;
    while (node && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
      node = node.parentElement;
      if (node) bg = getComputedStyle(node).backgroundColor;
    }
    return { outlineColor: cs.outlineColor, outlineWidth: cs.outlineWidth, outlineStyle: cs.outlineStyle, surface: bg };
  });
}

async function tabUntil(page: import('@playwright/test').Page, predicate: string, max = 20) {
  for (let i = 0; i < max; i += 1) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(predicate)) return;
  }
  throw new Error(`No focusable element matched ${predicate} within ${max} tabs`);
}

test('dossier controls show an ink focus ring on light surfaces; tabs show a cream ring on the shell', async ({ page }) => {
  await page.goto('#/dossier');
  await page.locator('textarea').fill('SYMPTOM — x\nPROPOSED SEV — SEV3');
  await page.locator('body').click({ position: { x: 1, y: 1 } }); // park focus outside the controls

  // Keyboard-driven focus is what AC10 is about, and it is what makes :focus-visible match in every browser.
  const targets: Array<[string, string]> = [
    ['textarea', "document.activeElement?.id === 'dossier-input'"],
    ['Load example', "document.activeElement?.textContent?.trim() === 'Load example'"],
    ['Clear', "document.activeElement?.textContent?.trim() === 'Clear'"],
    ['SEV3 checkbox', "document.activeElement?.getAttribute('type') === 'checkbox'"],
  ];
  for (const [name, predicate] of targets) {
    await tabUntil(page, predicate);
    const o = await focusedOutline(page);
    expect(o, name).toMatchObject({ outlineStyle: 'solid', outlineWidth: '3px', outlineColor: INK });
    expect(o.outlineColor, name).not.toBe(o.surface);
  }

  await page.locator('body').click({ position: { x: 1, y: 1 } });
  await tabUntil(page, "document.activeElement?.textContent?.trim() === 'Dex'");
  const tab = await focusedOutline(page);
  expect(tab, 'Dex tab').toMatchObject({ outlineStyle: 'solid', outlineWidth: '3px', outlineColor: CREAM });
  expect(tab.outlineColor).not.toBe(tab.surface);
});

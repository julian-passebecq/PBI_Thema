const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');

const APP_URL = process.env.THEME_FORGE_URL || pathToFileURL(path.resolve(__dirname, '..', 'theme-forge.html')).href;
const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1141, height: 963 },
  { width: 1024, height: 768 },
  { width: 768, height: 900 },
  { width: 420, height: 844 },
];

function assert(ok, message) {
  if (!ok) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: VIEWPORTS[0] });
  const errors = [];
  page.on('pageerror', err => errors.push(`pageerror: ${err.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('fonts.googleapis.com')) {
      errors.push(`console: ${msg.text()}`);
    }
  });

  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.app');

  const contract = await page.evaluate(() => ({
    title: document.title,
    appVersion: document.querySelector('.ver')?.textContent?.trim(),
    schemaVersion: typeof SCHEMA_VER === 'undefined' ? null : SCHEMA_VER,
    vocabulary: typeof VOCAB === 'undefined' ? null : VOCAB.length,
    families: typeof FAMILIES === 'undefined' ? null : FAMILIES.length,
    variants: typeof FAMILIES === 'undefined' ? null : FAMILIES.reduce((n, f) => n + f.variants.length, 0),
    formattingTargets: typeof FMT_TARGETS === 'undefined' ? null : FMT_TARGETS.length,
    stories: typeof STORIES === 'undefined' ? null : STORIES.length,
    objects: typeof OBJ_KINDS === 'undefined' ? null : Object.keys(OBJ_KINDS).length,
    specIssues: typeof validateSpec === 'undefined' ? ['validator missing'] : validateSpec(SPEC),
    nativeSave: typeof browserSave === 'function' && typeof saveText === 'function',
    assistantStatus: document.querySelector('#aiStatus')?.textContent?.trim() || '',
    hasClaude: !!window.claude,
    targetControls: typeof buildTargetMap === 'undefined' ? null : buildTargetMap().controls.length,
  }));

  assert(contract.title === 'Power BI Theme Forge', `unexpected title: ${contract.title}`);
  assert(contract.schemaVersion === 3, `dashboard-spec version is ${contract.schemaVersion}`);
  assert(contract.vocabulary === 27, `visual vocabulary is ${contract.vocabulary}`);
  assert(contract.families === 11, `style family count is ${contract.families}`);
  assert(contract.variants === 35, `style variant count is ${contract.variants}`);
  assert(contract.formattingTargets === 181, `formatting target count is ${contract.formattingTargets}`);
  assert(contract.stories === 10, `story count is ${contract.stories}`);
  assert(contract.objects === 21, `object-kind count is ${contract.objects}`);
  assert(contract.specIssues.length === 0, `current spec is invalid: ${contract.specIssues.join('; ')}`);
  assert(contract.nativeSave, 'native browser download fallback is missing');
  assert(contract.targetControls === 44, `target-map control count is ${contract.targetControls}`);
  assert(contract.assistantStatus.includes('Standalone mode'), `standalone assistant status missing: ${contract.assistantStatus}`);

  const downloads = [
    ['theme', () => download(), /\.json$/],
    ['spec', () => downloadSpec(), /^dashboard-spec\.json$/],
    ['target map', () => downloadTargetMap(), /^export-target-map\.json$/],
  ];
  for (const [label, trigger, name] of downloads) {
    const [saved] = await Promise.all([
      page.waitForEvent('download'),
      page.evaluate(trigger),
    ]);
    assert(name.test(saved.suggestedFilename()), `${label} downloaded ${saved.suggestedFilename()}`);
  }

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(80);
    const layout = await page.evaluate(() => {
      const style = el => el ? getComputedStyle(el) : null;
      const toolbar = document.querySelector('.toolbar');
      const lrail = document.querySelector('.lrail');
      const rrail = document.querySelector('.rrail');
      const app = document.querySelector('.app');
      return {
        bodyOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        toolbarOverflow: toolbar ? toolbar.scrollWidth - toolbar.clientWidth : 999,
        lrail: lrail ? style(lrail).display !== 'none' : false,
        rrail: rrail ? style(rrail).display !== 'none' : false,
        app: !!app,
        fitText: [...document.querySelectorAll('.toolbar button')].some(b => b.textContent.includes('Fit')),
        editText: [...document.querySelectorAll('.toolbar button')].some(b => b.textContent.includes('Edit layout')),
      };
    });
    assert(layout.app, `app missing at ${viewport.width}`);
    assert(layout.bodyOverflow <= 1, `document horizontally overflows by ${layout.bodyOverflow}px at ${viewport.width}`);
    assert(layout.toolbarOverflow <= 1, `toolbar horizontally overflows by ${layout.toolbarOverflow}px at ${viewport.width}`);
    assert(layout.lrail && layout.rrail, `rail hidden at ${viewport.width}`);
    if (viewport.width >= 1024) {
      assert(layout.fitText, `Fit label missing at ${viewport.width}`);
      assert(layout.editText, `Edit layout label missing at ${viewport.width}`);
    }
  }

  await page.setViewportSize({ width: 1141, height: 963 });
  await page.click('#tbEdit');
  const editing = await page.getAttribute('#tbEdit', 'aria-pressed');
  assert(editing === 'true', 'Edit layout did not activate');

  await page.keyboard.press('Alt+P');
  await page.waitForTimeout(60);
  const dockVisible = await page.evaluate(() => {
    const d = document.querySelector('.dock');
    return d && getComputedStyle(d).display !== 'none';
  });
  assert(dockVisible, 'Pages shortcut did not open the dock');

  assert(errors.length === 0, errors.join('\n'));
  console.log('Theme Forge standalone smoke audit: PASS');
  console.log(JSON.stringify(contract, null, 2));
  await browser.close();
})().catch(err => {
  console.error(err.stack || err);
  process.exit(1);
});

const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1141, height: 963 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto((process.env.THEME_FORGE_URL || pathToFileURL(path.resolve(__dirname, '../theme-forge.html')).href));
    await page.waitForSelector('.app');
    const baseline = await page.evaluate(() => JSON.stringify(SPEC));

    // Rejected input must not mutate the active document or crash its validator.
    for (const spec of [
      { contractVersion: 3, pages: [null] },
      { contractVersion: 3, pages: [{ visuals: {} }] },
      { contractVersion: 3, pages: [{ visuals: [null] }] },
      { contractVersion: 3, pages: Array.from({ length: 41 }, () => ({ visuals: [] })) },
      { contractVersion: 3, pages: [{ visuals: [], filters: {} }] },
    ]) {
      const result = await page.evaluate(spec => applySpecText(JSON.stringify(spec)), spec);
      assert.equal(result.ok, false);
      assert.equal(await page.evaluate(() => JSON.stringify(SPEC)), baseline);
    }
    for (const model of [
      { tables: [null] },
      { tables: [{ name: 'Sales', columns: {} }] },
      { tables: [{ name: 'Sales', measures: {} }] },
    ]) {
      assert(await page.evaluate(m => validateModel(m).length, model));
      assert(await page.evaluate(m => { const previous = MODEL; loadModel(m, 'invalid.json'); return MODEL === previous; }, model));
    }

    // Named styles survive generated exports, including names shared with built-ins.
    const presets = {
      '*': { AuditPreset: { background: [{ show: true, color: { solid: { color: '#123456' } } }] }, Quiet: { title: [{ show: false }] } },
      card: { CustomCard: { labels: [{ fontSize: 19 }] } },
    };
    const imported = await page.evaluate(visualStyles => {
      const result = applyThemeText(JSON.stringify({ name: 'Audit /*literal*/ theme', visualStyles }));
      return { result, theme: buildThemeJson(S) };
    }, presets);
    assert(imported.result.ok);
    assert.equal(imported.theme.name, 'Audit /*literal*/ theme');
    for (const [kind, styles] of Object.entries(presets))
      for (const [name, value] of Object.entries(styles)) assert.deepEqual(imported.theme.visualStyles[kind][name], value);

    // Check the actual parsed download, not just its filename.
    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#btnDownload').click()]);
    const fs = require('node:fs');
    const saved = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
    assert.deepEqual(saved.visualStyles.card.CustomCard, presets.card.CustomCard);

    // Immediate blur used to overwrite the draft before its delayed application.
    await page.evaluate(() => openTool('r:json'));
    await page.locator('#jsonarea').fill('{"name":"Fast blur retained"}');
    await page.locator('#themename').click();
    await page.waitForTimeout(400);
    assert.equal(await page.locator('#themename').inputValue(), 'Fast blur retained');
    await page.locator('#jsonarea').fill('{ invalid draft');
    await page.locator('#themename').click();
    assert.equal(await page.locator('#jsonarea').inputValue(), '{ invalid draft');
    assert.equal(await page.locator('#jsonState').textContent(), 'JSON error');
    // Switching files must retain independent invalid drafts.
    await page.locator('#jsSpec').click();
    await page.locator('#jsonarea').fill('{ unfinished spec');
    await page.locator('#jsTheme').click();
    assert.equal(await page.locator('#jsonarea').inputValue(), '{ invalid draft');
    const beforeTextUndo=await page.evaluate(()=>S.name);
    await page.locator('#jsonarea').press('End');
    await page.locator('#jsonarea').pressSequentially('X');
    await page.locator('#jsonarea').press('Control+z');
    assert.equal(await page.locator('#jsonarea').inputValue(), '{ invalid draft');
    assert.equal(await page.evaluate(()=>S.name),beforeTextUndo);
    await page.locator('#jsonarea').fill('{"name":"Fast blur retained"}');
    await page.locator('#jsonarea').press('Control+Enter');
    assert.equal(await page.evaluate(()=>S.name),'Fast blur retained');
    await page.locator('#jsSpec').click();
    assert.equal(await page.locator('#jsonarea').inputValue(), '{ unfinished spec');
    await page.locator('#btnRevert').click();
    await page.locator('#jsTheme').click();
    await page.locator('#btnRevert').click();

    // Comparison rejects bad structure without replacing an existing comparison.
    assert(await page.evaluate(()=>{
      const before=DIFF;
      compareSpec({contractVersion:3,pages:[null]},'invalid.json');
      return DIFF===before&&document.querySelector('#ctxMsg').textContent.startsWith('Rejected');
    }));
    // Failed recovery must never leave half-restored state behind.
    const session=await page.evaluate(()=>({theme:structuredClone(S),spec:structuredClone(SPEC),model:null}));
    for(const invalid of [
      {...session,spec:{contractVersion:3,pages:[null]}},
      {...session,theme:{...session.theme,data:{}}},
      {...session,model:{tables:[null]}},
    ]){
      assert(await page.evaluate(saved=>{
        const before=[S,SPEC,MODEL];
        try{restoreSession(saved);return false;}catch{}
        return S===before[0]&&SPEC===before[1]&&MODEL===before[2];
      },invalid));
    }
    const restoredIndexes=await page.evaluate(saved=>{
      restoreSession({...saved,page:-8,cfgPage:10000});
      return {page,cfgPage,last:PAGES.length-1};
    },session);
    assert.equal(restoredIndexes.page,0);
    assert.equal(restoredIndexes.cfgPage,restoredIndexes.last);

    // Both pending edits and immediate post-undo edits must remain undoable.
    await page.evaluate(() => { histPush(); S.name = 'History A'; renderAll(); histGo(-1); S.name = 'History B'; renderAll(); });
    await page.waitForTimeout(450);
    assert.equal(await page.evaluate(() => HIST[HPOS].theme.name), 'History B');
    await page.evaluate(() => histGo(-1));
    assert.equal(await page.evaluate(() => S.name), 'Fast blur retained');
    await page.evaluate(() => histGo(1));
    assert.equal(await page.evaluate(() => S.name), 'History B');

    // The open-panel state was absent from the original responsive smoke test.
    for (const width of [420, 768, 1024]) {
      await page.setViewportSize({ width, height: 844 });
      const geometry = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        close: document.querySelector('#dockClose').getBoundingClientRect().right,
        width: document.documentElement.clientWidth,
      }));
      assert(geometry.overflow <= 1, `open JSON panel overflows ${geometry.overflow}px at ${width}`);
      assert(geometry.close <= geometry.width + 1, `Close is off-screen at ${width}`);
    }

    // pagehide flushes the most recent edit without waiting for autosave's debounce.
    await page.evaluate(() => { S.name = 'Saved on immediate reload'; renderAll(); });
    await page.reload();
    assert.equal(await page.locator('#themename').inputValue(), 'Saved on immediate reload');
    // Storage failure must be visible even with the context panel closed.
    await page.evaluate(() => {
      const setItem=Storage.prototype.setItem;
      try {
        Storage.prototype.setItem=()=>{throw new DOMException('Quota exceeded','QuotaExceededError');};
        flushSession();
      } finally {Storage.prototype.setItem=setItem;}
    });
    assert(await page.locator('#saveStatus').isVisible());
    await page.evaluate(() => flushSession());
    assert.equal(await page.locator('#saveStatus').isVisible(), false);
    assert.deepEqual(errors, []);
    const recovery=await browser.newPage();
    const recoveryErrors=[];
    recovery.on('pageerror',e=>recoveryErrors.push(e.message));
    await recovery.addInitScript(saved=>localStorage.setItem('theme-forge.session.v2',JSON.stringify(saved)),
      {...session,spec:{contractVersion:3,pages:[null]}});
    await recovery.goto((process.env.THEME_FORGE_URL || pathToFileURL(path.resolve(__dirname,'../theme-forge.html')).href));
    assert.equal(await recovery.locator('#themename').inputValue(),'Editorial Red · Tinted panel');
    assert.equal(await recovery.evaluate(()=>validateSpec(SPEC,true).length),0);
    assert.deepEqual(recoveryErrors,[]);
    await recovery.close();
    console.log('Theme Forge import/edit/history/mobile regressions: PASS');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

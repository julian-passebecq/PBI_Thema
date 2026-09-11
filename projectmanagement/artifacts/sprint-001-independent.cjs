const {chromium}=require('../../node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const {spec,model,lossyTheme}=require('../../test/fixtures/reliability');
const out='test-artifacts/sprint-001-test-round-1';
const results=[];
(async()=>{
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(fs.readFileSync('theme-forge.html'));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch();
 for(const url of ['file:///D:/PROJ/PBI_Thema/theme-forge.html',`http://127.0.0.1:${server.address().port}/`]){
 const transport=url.startsWith('file:')?'file':'http';
 async function check(name,fn){const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));try{await page.goto(url);await fn(page);assert.deepEqual(errors,[]);results.push({transport,name,status:'PASS'});}catch(e){results.push({transport,name,status:'FAIL',error:e.stack});await page.screenshot({path:`${out}/${transport}-${name}.png`});}finally{await page.close();}}
 await check('rollback-rebuild-and-editor',async p=>{
  for(const target of ['rebuildPages','renderJsonEd']){
   const r=await p.evaluate(({target,s})=>{
    clearTimeout(_histT);histPush();clearTimeout(_saveT);flushSession();
    const snap=()=>JSON.stringify({S,SPEC,MODEL,PAGES,specIssues,page,cfgPage,selVis,selSet,DIFF,HPOS,HIST,saved:localStorage.getItem(LS_KEY)});
    const before=snap(),original=window[target];let once=true;
    window[target]=(...args)=>{if(once){once=false;throw Error('tester injection');}return original(...args);};
    let result;try{result=loadSpec(s,'independent');}finally{window[target]=original;}
    return {result,before,after:snap()};
   },{target,s:spec()});assert.equal(r.result.applied,false);assert.equal(r.after,r.before);
   await p.waitForTimeout(850);assert((await p.evaluate(s=>loadSpec(s,'valid'),spec())).applied);
  }
 });
 await check('migration-collisions-null-binding',async p=>{
  const s={pages:[{id:'page-1',visuals:[{id:'visual-1-1',kind:'card'}]},{visuals:[{kind:'card',bindings:{value:null}}]}]};
  const r=await p.evaluate(s=>{const before=JSON.stringify(s),a=prepareDocument(s,'spec'),b=prepareDocument(s,'spec');return {before,after:JSON.stringify(s),a,b};},s);
  assert.equal(r.a.status,'ready');assert.deepEqual(r.a.candidate,r.b.candidate);assert.equal(r.before,r.after);
  const pages=r.a.candidate.pages;assert.equal(new Set(pages.map(x=>x.id)).size,2);assert.equal(new Set(pages.flatMap(x=>x.visuals.map(v=>v.id))).size,2);
  assert((await p.evaluate(s=>loadSpec(s,'null binding'),s)).applied);
 });
 await check('editor-recovery-conflict-reload',async p=>{
  await p.evaluate(()=>setMode('jsoned'));await p.locator('#jeSpec').fill(JSON.stringify({...spec(),report:{title:'stale full'}}));
  await p.evaluate(s=>restoreSession({theme:S,spec:s,model:MODEL}),{...spec(),report:{title:'recovered'}});
  await p.locator('#jeSpecApply').click();assert(await p.locator('#draftConflict').isVisible());await p.locator('#draftKeep').click();
  assert.equal(await p.evaluate(()=>SPEC.report.title),'recovered');await p.reload();assert.equal(await p.evaluate(()=>SPEC.report.title),'recovered');
 });
 await check('keyboard-conversion-long-paths',async p=>{
  await p.evaluate(()=>{setMode('jsoned');});
  const theme=lossyTheme();for(let i=0;i<50;i++)theme['long_extension_'+i+'_'.repeat(120)]='unknown';
  await p.locator('#jeTheme').fill(JSON.stringify(theme));await p.locator('#jeTheme').press('Control+Enter');
  for(const width of [420,768,1024,1440]){await p.setViewportSize({width,height:900});await p.screenshot({path:`${out}/${transport}-long-conversion-${width}.png`});const box=await p.locator('#conversionCancel').boundingBox();assert(box.x>=0&&box.x+box.width<=width&&box.y+box.height<=900);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
  assert.equal(await p.evaluate(()=>document.activeElement.id),'conversionCancel');await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.id),'conversionApply');await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.activeElement.id),'jeTheme');
 });
 await check('editor-rejections-and-export-semantics',async p=>{
  await p.evaluate(m=>loadModel(m,'model'),model());await p.evaluate(()=>setMode('jsoned'));
  const duplicate=spec();duplicate.pages.push(structuredClone(duplicate.pages[0]));
  const before=await p.evaluate(()=>JSON.stringify(SPEC));await p.locator('#jeSpec').fill(JSON.stringify(duplicate));await p.locator('#jeSpecApply').click();assert.equal(await p.evaluate(()=>JSON.stringify(SPEC)),before);
  const missing=spec();missing.pages[0].visuals[0].bindings.value.name='Missing revenue';
  await p.locator('#jeSpec').fill(JSON.stringify(missing));await p.locator('#jeSpecApply').click();
  async function download(action){const [d]=await Promise.all([p.waitForEvent('download'),action()]);return JSON.parse(fs.readFileSync(await d.path(),'utf8'));}
  const exported=await download(()=>p.evaluate(()=>downloadSpec()));assert.deepEqual(exported.pages[0].visuals[0].bindings,missing.pages[0].visuals[0].bindings);assert(exported.validation.errors>0);
  await p.locator('#themename').fill('Semantic journey');
  const theme=await download(()=>p.locator('#btnDownload').click());const map=await download(()=>p.evaluate(()=>downloadTargetMap()));
  assert.equal(theme.name,'Semantic journey');assert.equal(map.currentTheme.name,theme.name);assert.equal(map.contractVersion,exported.contractVersion);assert.equal(map.controls.find(x=>x.control==='data').class,'ThemeDefault');
  await p.reload();assert.equal(await p.evaluate(()=>SPEC.pages[0].visuals[0].bindings.value.name),'Missing revenue');
 });
 await check('real-undo-redo-storage-retry',async p=>{
  const original=await p.locator('#themename').inputValue();await p.locator('#themename').fill('Independent edit');await p.locator('#btnUndo').click();assert.equal(await p.locator('#themename').inputValue(),original);await p.locator('#btnRedo').click();assert.equal(await p.locator('#themename').inputValue(),'Independent edit');
  for(let i=0;i<2;i++){await p.evaluate(()=>{const fn=Storage.prototype.setItem;try{Storage.prototype.setItem=()=>{throw new DOMException('Blocked','SecurityError');};flushSession();}finally{Storage.prototype.setItem=fn;}});assert(await p.locator('#saveStatus').isVisible());}
  await p.evaluate(()=>flushSession());assert.equal(await p.locator('#saveStatus').isVisible(),false);
 });
 }
 await browser.close();await new Promise(r=>server.close(r));fs.writeFileSync(`${out}/independent-results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));if(results.some(x=>x.status==='FAIL'))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});

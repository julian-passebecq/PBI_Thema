const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const fixtures=require('./fixtures/reliability');
const url=process.env.THEME_FORGE_URL||pathToFileURL(path.resolve(__dirname,'../theme-forge.html')).href;
const artifacts=path.resolve(process.env.THEME_FORGE_ARTIFACT_DIR||path.resolve(__dirname,'../test-artifacts/sprint-001'),url.startsWith('file:')?'file':'http');
fs.mkdirSync(artifacts,{recursive:true});
const snapshot=page=>page.evaluate(()=>{
  clearTimeout(_histT);histPush();clearTimeout(_saveT);flushSession();
  return JSON.stringify({S,SPEC,MODEL,page,cfgPage,selVis,selSet,selObj,DIFF,history:HIST.map(h=>h.sig),HPOS,saved:localStorage.getItem(LS_KEY)});
});
const accepted=page=>page.evaluate(()=>JSON.stringify({S,SPEC,MODEL,page,cfgPage,selVis,selSet,selObj,DIFF,history:HIST.map(h=>h.sig),HPOS,saved:localStorage.getItem(LS_KEY)}));
const download=async(page,action)=>{
  const [d]=await Promise.all([page.waitForEvent('download'),action()]);
  return JSON.parse(fs.readFileSync(await d.path(),'utf8'));
};
async function picker(page,kind,data){
  await page.evaluate(k=>{fileMode=k;},kind);
  await page.locator('#fileIn').setInputFiles({name:kind+'.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
}
async function drop(page,data){
  await page.evaluate(async j=>{
    const dt=new DataTransfer();dt.items.add(new File([JSON.stringify(j)],'fixture.json',{type:'application/json'}));
    document.querySelector('.ctx').dispatchEvent(new DragEvent('drop',{bubbles:true,dataTransfer:dt}));
  },data);
}
(async()=>{
  const browser=await chromium.launch({headless:true});let page;
  const errors=[];
  try{
    page=await browser.newPage({viewport:{width:1440,height:900}});
    page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.waitForSelector('.app');
    // T01/02/03/05: shared refusal contract, including delayed state/storage.
    for(const change of ['future','duplicate','geometry','null','depth']){
      const before=await snapshot(page);
      const r=await page.evaluate(change=>{
        const s=structuredClone(SPEC);
        if(change==='future')s.contractVersion=999;
        if(change==='duplicate')s.pages.push(structuredClone(s.pages[0]));
        if(change==='geometry')s.pages[0].visuals[0].position.x='42';
        if(change==='null')s.pages[0].visuals[0]=null;
        if(change==='depth'){let x={};s.extra=x;for(let n=0;n<65;n++)x=x.x={};}
        return applySpecText(JSON.stringify(s));
      },change);
      assert.equal(r.applied,false,change);assert(r.issues[0].blocking);assert.equal(await accepted(page),before,change);
    }
    // Real file picker and drop routes: one accepted and one rejected for each type.
    const model=fixtures.model(),spec=fixtures.spec();
    await picker(page,'model',model);await page.waitForFunction(()=>MODEL.modelName==='Fixture model');
    let before=await snapshot(page);await picker(page,'model',{tables:[{name:123}]});
    await page.waitForFunction(()=>document.querySelector('#ctxMsg').textContent.startsWith('Rejected'));assert.equal(await accepted(page),before);
    await picker(page,'spec',spec);await page.waitForFunction(()=>SPEC.report.title==='Fixture report');
    before=await snapshot(page);await picker(page,'spec',{...spec,contractVersion:999});
    await page.waitForFunction(()=>document.querySelector('#ctxMsg').textContent.startsWith('Rejected'));assert.equal(await accepted(page),before);
    await drop(page,{...model,modelName:'Dropped model'});await page.waitForFunction(()=>MODEL.modelName==='Dropped model');
    before=await snapshot(page);await drop(page,{tables:[null]});
    await page.waitForFunction(()=>document.querySelector('#ctxMsg').textContent.startsWith('Rejected'));assert.equal(await accepted(page),before);
    await drop(page,{...spec,report:{title:'Dropped spec'}});await page.waitForFunction(()=>SPEC.report.title==='Dropped spec');
    before=await snapshot(page);await drop(page,{pages:[null]});
    await page.waitForFunction(()=>document.querySelector('#ctxMsg').textContent.startsWith('Rejected'));assert.equal(await accepted(page),before);
    const compare=await page.evaluate(j=>compareSpec(j,'fixture'),spec);assert.equal(compare.status,'compared');
    before=await snapshot(page);await picker(page,'compare',{...spec,contractVersion:999});
    await page.waitForFunction(()=>document.querySelector('#ctxMsg').textContent.startsWith('Rejected'));assert.equal(await accepted(page),before);
    await picker(page,'compare',spec);await page.waitForFunction(()=>document.querySelector('#ctxMsg').textContent.includes('Nothing was changed'));
    // Same legacy fixture prepares identically across application, comparison and recovery.
    assert(await page.evaluate(s=>{
      delete s.contractVersion;delete s.pages[0].id;delete s.pages[0].visuals[0].id;
      const expected=JSON.stringify(prepareDocument(s,'spec').candidate);
      const a=applySpecText(JSON.stringify(s));const first=JSON.stringify(SPEC);
      const b=loadSpec(s,'legacy');const second=JSON.stringify(SPEC);
      const c=compareSpec(s,'legacy');
      restoreSession({theme:S,spec:s,model:MODEL});
      return a.applied&&b.applied&&first===expected&&second===expected&&JSON.stringify(c.candidate)===expected&&JSON.stringify(SPEC)===expected;
    },spec));
    // Actual file byte boundary, and no direct theme/model size bypass.
    const boundarySpec={...spec,report:{title:'Byte boundary accepted'}};
    const raw=JSON.stringify(boundarySpec),at=raw+' '.repeat(4*1024*1024-Buffer.byteLength(raw));
    await page.evaluate(()=>{fileMode='spec';});
    await page.locator('#fileIn').setInputFiles({name:'at-limit.json',mimeType:'application/json',buffer:Buffer.from(at)});
    await page.waitForFunction(()=>SPEC.report.title==='Byte boundary accepted');
    before=await snapshot(page);
    await page.locator('#fileIn').setInputFiles({name:'above-limit.json',mimeType:'application/json',buffer:Buffer.from(at+' ')});
    await page.waitForFunction(()=>document.querySelector('#ctxMsg').textContent.includes('too large'));
    assert.equal(await accepted(page),before);
    assert(await page.evaluate(()=>{
      const theme=applyThemeText('{"name":"oversize"}'+ ' '.repeat(INPUT_LIMIT));
      const model=loadModel({tables:[{name:'T',columns:[{name:'C'}]}],extra:'x'.repeat(INPUT_LIMIT)},'oversize');
      return !theme.applied&&!model.applied&&theme.issues[0].code==='limit.bytes'&&model.issues[0].code==='limit.bytes';
    }));
    assert.equal(await accepted(page),before);
    // Safe incomplete intent applies truthfully, and stays in actual exported JSON.
    const incomplete=fixtures.spec();incomplete.pages[0].visuals[0].kind='constructor';incomplete.report.extra={filters:'inert'};
    let r=await page.evaluate(s=>applySpecText(JSON.stringify(s)),incomplete);
    assert.equal(r.applied,true);assert(r.issues.some(i=>i.msg.includes('unsupported')));
    let output=await download(page,()=>page.evaluate(()=>downloadSpec()));
    assert.equal(output.pages[0].visuals[0].kind,'constructor');assert.equal(output.report.extra.filters,'inert');assert(output.validation.errors>0);
    const markup=fixtures.spec();markup.report.title=markup.pages[0].title=markup.pages[0].visuals[0].title='<img src=x onerror="window.importMarkupRan=true">';
    assert((await page.evaluate(s=>applySpecText(JSON.stringify(s)),markup)).applied);
    assert.equal(await page.evaluate(()=>window.importMarkupRan),undefined);
    assert.equal(await page.locator('img[onerror]').count(),0);
    output=await download(page,()=>page.evaluate(()=>downloadSpec()));assert.equal(output.pages[0].title,markup.pages[0].title);
    // T13: one-time render failure rolls all accepted/derived/history/storage state back.
    before=await snapshot(page);
    r=await page.evaluate(s=>{
      const original=renderAll;let once=true;renderAll=()=>{if(once){once=false;throw Error('injected');}return original();};
      try{return loadSpec(s,'forced.json');}finally{renderAll=original;}
    },spec);
    assert.equal(r.applied,false);assert.equal(r.issues[0].code,'application.failed');assert.equal(await accepted(page),before);
    await page.waitForTimeout(850); // Both history (420ms) and storage (700ms) callbacks must remain harmless.
    assert.equal(await accepted(page),before);
    assert((await page.evaluate(s=>loadSpec(s,'valid.json'),spec)).applied);
    // T06/07: report, cancel, explicit conversion, named collisions, actual theme download.
    const theme=fixtures.lossyTheme();before=await snapshot(page);
    r=await page.evaluate(t=>applyThemeText(JSON.stringify(t)),theme);
    assert.equal(r.status,'needs-conversion');assert.equal(r.applied,false);
    assert(r.changes.some(c=>c.path==='theme.dataColors'));assert(r.changes.some(c=>c.path.endsWith('title[0].show')));
    assert.equal(await accepted(page),before);await page.locator('#conversionCancel').click();assert.equal(await accepted(page),before);
    for(const malformed of [{visualStyles:'bad'},{visualStyles:{card:'bad'}},{textClasses:[]},{visualStyles:{card:{Quiet:{title:'bad'}}}}]){
      r=await page.evaluate(t=>applyThemeText(JSON.stringify(t)),malformed);assert.equal(r.status,'rejected');assert.equal(await accepted(page),before);
    }
    await page.evaluate(t=>applyThemeText(JSON.stringify(t)),theme);
    for(const width of [420,768,1024,1440]){
      await page.setViewportSize({width,height:900});
      const g=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,
        buttons:[...document.querySelectorAll('#conversionDialog button')].map(b=>{const r=b.getBoundingClientRect();return {left:r.left,right:r.right,bottom:r.bottom};})}));
      assert(g.overflow<=1);assert(g.buttons.every(b=>b.left>=0&&b.right<=width&&b.bottom<=900));
      await page.screenshot({path:path.join(artifacts,'conversion-'+width+'.png')});
    }
    assert.equal(await page.evaluate(()=>document.activeElement.id),'conversionCancel');
    await page.locator('#conversionApply').click();
    output=await download(page,()=>page.locator('#btnDownload').click());
    assert.equal(output.dataColors.length,8);assert.equal(output.visualStyles['*']['*'].title[0].show,true);
    assert.deepEqual(output.visualStyles['*'].Quiet,theme.visualStyles['*'].Quiet);
    const arbitrary=JSON.parse('{"name":"Literal /*value*/ https://example.test/é","visualStyles":{"__proto__":{"constructor":{"title":[{"show":false}]}}}}');
    // Pass literal JSON: the automation protocol's object serializer treats prototype keys specially.
    r=await page.evaluate(t=>applyThemeText(t),JSON.stringify(arbitrary));assert.equal(r.applied,true);
    output=await download(page,()=>page.locator('#btnDownload').click());assert.deepEqual(output.visualStyles.__proto__.constructor,arbitrary.visualStyles.__proto__.constructor);
    assert.equal(output.name,arbitrary.name);assert.equal(await page.evaluate(()=>({}).polluted),undefined);
    // T08/09: dock/full editor policy, real typing/blur, conflicts and pending conversion.
    await page.evaluate(()=>{openTool('r:json');setJsonView('spec');});
    const dock=page.locator('#jsonarea');
    await dock.fill(JSON.stringify({...spec,contractVersion:999}));await dock.press('Control+Enter');
    assert.equal(await page.evaluate(()=>SPEC.contractVersion),3);
    await dock.fill(JSON.stringify({...spec,report:{title:'Dock applied'}}));await page.locator('#themename').click();
    assert.equal(await page.evaluate(()=>SPEC.report.title),'Dock applied');
    await dock.fill('{ invalid retained');await page.locator('#themename').click();
    await page.evaluate(()=>{closeDock();setMode('gallery');openTool('r:json');});assert.equal(await dock.inputValue(),'{ invalid retained');
    await dock.fill(JSON.stringify({...spec,report:{title:'Obsolete draft'}}));
    await page.evaluate(s=>loadSpec({...s,report:{title:'External accepted'}},'external'),spec);
    // Wait beyond debounce to prove an obsolete callback cannot win.
    await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>SPEC.report.title),'External accepted');
    await dock.press('Control+Enter');assert(await page.locator('#draftConflict').isVisible());
    await page.locator('#draftKeep').click();assert.equal(await page.evaluate(()=>SPEC.report.title),'External accepted');
    await dock.press('Control+Enter');await page.locator('#draftReapply').click();assert.equal(await page.evaluate(()=>SPEC.report.title),'Obsolete draft');
    await page.evaluate(()=>setJsonView('theme'));await dock.fill(JSON.stringify(theme));await dock.press('Control+Enter');
    assert(await page.locator('#conversionDialog').isVisible());await page.locator('#conversionCancel').click();
    await dock.fill('{"name":"Later draft"}');await dock.press('Control+Enter');assert.equal(await page.evaluate(()=>S.name),'Later draft');
    await page.evaluate(()=>setMode('jsoned'));
    await page.locator('#jeSpec').fill(JSON.stringify({...spec,contractVersion:0}));await page.locator('#jeSpecApply').click();
    assert.equal(await page.evaluate(()=>SPEC.report.title),'Obsolete draft');
    await page.locator('#jeSpec').fill(JSON.stringify({...spec,report:{title:'Full editor accepted'}}));await page.locator('#jeSpecApply').click();
    assert.equal(await page.evaluate(()=>SPEC.report.title),'Full editor accepted');
    await page.locator('#jeTheme').fill('{"visualStyles":false}');await page.locator('#jeThemeApply').click();
    assert.equal(await page.evaluate(()=>S.name),'Later draft');
    await page.locator('#jeTheme').fill('{"name":"Full theme"}');await page.locator('#jeTheme').press('Control+Enter');
    assert.equal(await page.evaluate(()=>S.name),'Full theme');
    await page.locator('#jeTheme').fill(JSON.stringify(theme));await page.locator('#jeThemeApply').click();
    assert(await page.locator('#conversionDialog').isVisible());
    await page.evaluate(()=>applyThemeText('{"name":"External full"}'));
    assert.equal(await page.locator('#conversionDialog').isVisible(),false);
    assert.equal(await page.locator('#jeTheme').inputValue(),JSON.stringify(theme));
    await page.locator('#jeTheme').press('Control+Enter');assert(await page.locator('#draftConflict').isVisible());
    await page.locator('#draftKeep').click();assert.equal(await page.evaluate(()=>S.name),'External full');
    await page.evaluate(()=>applyThemeText('{"name":"Full theme"}'));
    for(const width of [420,768,1024,1440]){
      await page.setViewportSize({width,height:900});
      assert(await page.locator('#jeThemeApply').isVisible());
      assert((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=1);
      await page.screenshot({path:path.join(artifacts,'editors-'+width+'.png')});
      await page.locator('#jeThemeApply').scrollIntoViewIfNeeded();
      const button=await page.locator('#jeThemeApply').boundingBox();assert(button.x>=0&&button.x+button.width<=width&&button.y+button.height<=900);
      await page.screenshot({path:path.join(artifacts,'theme-editor-'+width+'.png')});
    }
    // T10/11/15: model-aware history, fast control edits, parsed exports and reload.
    await page.evaluate(()=>{setMode('report');closeDock();});
    const oldModel=await page.evaluate(()=>JSON.stringify(MODEL));
    await picker(page,'model',{...model,modelName:'History model'});
    await page.waitForFunction(()=>MODEL.modelName==='History model');await page.evaluate(()=>histGo(-1));
    assert.equal(await page.evaluate(()=>JSON.stringify(MODEL)),oldModel);
    await page.evaluate(()=>histGo(1));assert.equal(await page.evaluate(()=>MODEL.modelName),'History model');
    await page.locator('#themename').fill('Immediate edit');await page.evaluate(()=>histGo(-1));
    assert.equal(await page.evaluate(()=>S.name),'Full theme');
    await page.locator('#themename').fill('After undo');await page.evaluate(()=>{histPush();histGo(1);});
    assert.equal(await page.evaluate(()=>S.name),'After undo');assert(await page.evaluate(()=>HPOS===HIST.length-1));
    const historyCount=await page.evaluate(()=>HIST.length);
    await page.evaluate(()=>{setMode('gallery');setMode('report');renderAll();histPush();});assert.equal(await page.evaluate(()=>HIST.length),historyCount);
    const themeExport=await download(page,()=>page.locator('#btnDownload').click());
    const specExport=await download(page,()=>page.evaluate(()=>downloadSpec()));
    const map=await download(page,()=>page.evaluate(()=>downloadTargetMap()));
    assert.equal(themeExport.name,'After undo');assert.equal(specExport.modelName,'History model');assert(map.controls.length>0);
    await page.locator('#themename').fill('Lifecycle latest');await page.reload();
    assert.equal(await page.locator('#themename').inputValue(),'Lifecycle latest');
    assert.equal(await page.evaluate(()=>MODEL.modelName),'History model');
    // Large combined session is legal when each document is within its limit.
    assert(await page.evaluate(()=>{const j={theme:structuredClone(S),spec:structuredClone(SPEC),model:structuredClone(MODEL)};
      j.spec.extra='x'.repeat(2200000);j.model.extra='x'.repeat(2200000);return prepareSession(j).status==='ready';}));
    assert.deepEqual(errors,[]);
    // T12: corrupt/unsupported originals survive boot/render/lifecycle and can be downloaded.
    const session=await page.evaluate(()=>({v:APPVER,theme:S,spec:SPEC,model:MODEL}));
    for(const [name,raw] of [['syntax','{broken'],['future',JSON.stringify({...session,sessionVersion:999})],['shape',JSON.stringify({...session,spec:{pages:[null]}})]]){
      const recovery=await browser.newPage({viewport:{width:420,height:900}});
      await recovery.addInitScript(raw=>localStorage.setItem('theme-forge.session.v2',raw),raw);await recovery.goto(url);
      assert(await recovery.locator('#recoveryNotice').isVisible());
      await recovery.evaluate(()=>{renderAll();dispatchEvent(new Event('pagehide'));});await recovery.waitForTimeout(800);
      assert.equal(await recovery.evaluate(()=>localStorage.getItem(LS_KEY)),raw);
      const [d]=await Promise.all([recovery.waitForEvent('download'),recovery.locator('#recoveryDownload').click()]);
      assert.equal(fs.readFileSync(await d.path(),'utf8'),raw);
      for(const width of [420,768,1024,1440]){
        await recovery.setViewportSize({width,height:900});assert(await recovery.locator('#recoveryReplace').isVisible());
        assert((await recovery.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=1);
        if(name==='syntax')await recovery.screenshot({path:path.join(artifacts,'recovery-'+width+'.png')});
      }
      await recovery.locator('#recoveryReplace').click();assert.notEqual(await recovery.evaluate(()=>localStorage.getItem(LS_KEY)),raw);
      await recovery.close();
    }
    fs.writeFileSync(path.join(artifacts,'result.json'),JSON.stringify({url,node:process.version,playwright:require('playwright/package.json').version,errors,status:'PASS'},null,2));
    console.log('Sprint 001 cross-route, conversion, transaction, drafts, history and recovery: PASS');
  }catch(e){
    if(page){await page.screenshot({path:path.join(artifacts,'failure.png'),fullPage:true}).catch(()=>{});
      fs.writeFileSync(path.join(artifacts,'failure.txt'),String(e.stack)+'\nPage errors: '+JSON.stringify(errors));}
    throw e;
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

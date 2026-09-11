const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'../..');
const output=path.join(root,'test-artifacts/sprint-001-lead');
fs.mkdirSync(output,{recursive:true});
(async()=>{
  const results=[];
  const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync(path.join(root,'theme-forge.html')));});
  let browser;
  try{
    await new Promise(r=>server.listen(0,'127.0.0.1',r));
    browser=await chromium.launch();
    for(const url of [pathToFileURL(path.join(root,'theme-forge.html')).href,`http://127.0.0.1:${server.address().port}/`]){
      const transport=url.startsWith('file:')?'file':'http';
      async function probe(name,fn){
        const p=await browser.newPage({viewport:{width:1440,height:1000}});
        p.setDefaultTimeout(5000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
        try{await p.goto(url);results.push({transport,name,observed:await fn(p),errors});}
        catch(e){results.push({transport,name,probeError:String(e),errors});}
        finally{await p.close();}
      }
      await probe('hidden-page-session',async p=>{
        await p.locator('#themename').fill('Lead hidden-page recovery');
        await p.evaluate(()=>{setMode('config');document.querySelector('[data-pgt]').click();});
        const before=await p.evaluate(()=>{const r=prepareSession({theme:S,spec:SPEC,model:MODEL});return {pagesOff:S.pagesOff,preparation:{status:r.status,issues:r.issues}};});
        await p.reload();
        const after=await p.evaluate(()=>({name:S.name,pagesOff:S.pagesOff,recovery:!!document.querySelector('#recoveryNotice')}));
        await p.screenshot({path:path.join(output,transport+'-hidden-page-recovery.png')});
        return {before,after};
      });
      await probe('cross-filter-edit-autosave-history',async p=>{
        await p.evaluate(()=>{setSel(0,SPEC.pages[0].visuals[0].id);renderBind();openTool('r:inter');});
        await p.waitForTimeout(1100);
        const snap=()=>p.evaluate(()=>({HPOS,history:HIST.length,active:SPEC.pages[0].visuals[0].interaction??null,
          saved:JSON.parse(localStorage.getItem(LS_KEY)).spec.pages[0].visuals[0].interaction??null,undoDisabled:document.querySelector('#btnUndo').disabled}));
        const before=await snap();await p.locator('#bInter').fill('Lead cross-filter edit only');
        await p.locator('#bInter').press('Tab');await p.waitForTimeout(1100);
        return {before,after:await snap()};
      });
      await probe('report-filter-autosave-history',async p=>{
        await p.evaluate(()=>setMode('config'));await p.waitForTimeout(1100);
        const snap=()=>p.evaluate(()=>({HPOS,history:HIST.length,active:SPEC.filters?.length||0,
          saved:JSON.parse(localStorage.getItem(LS_KEY)).spec.filters?.length||0,undoDisabled:document.querySelector('#btnUndo').disabled}));
        const before=await snap();
        await p.evaluate(()=>document.querySelector('#rfFAdd').click());await p.waitForTimeout(1100);
        return {before,after:await snap()};
      });
      await probe('empty-bookmark-name-recovery',async p=>{
        await p.evaluate(()=>{setMode('config');document.querySelector('#bmAdd').click();
          const field=document.querySelector('[data-bmname]');field.value='';field.dispatchEvent(new Event('change',{bubbles:true}));});
        const before=await p.evaluate(()=>{const r=prepareSession({theme:S,spec:SPEC,model:MODEL});return {bookmarks:SPEC.bookmarks,preparation:{status:r.status,issues:r.issues}};});
        await p.reload();return {before,after:await p.evaluate(()=>({bookmarks:SPEC.bookmarks,recovery:!!document.querySelector('#recoveryNotice')}))};
      });
      await probe('conditional-formatting-imported-markup',async p=>{
        const applied=await p.evaluate(()=>{
          const candidate=structuredClone(SPEC);
          const visual=candidate.pages[0].visuals.find(v=>v.formatting?.conditional?.length);
          visual.formatting.conditional[0].rules[0].value='0"><img data-lead-marker="true" src="data:image/png;base64,AA==" onerror="window.leadMarkupExecuted=true"><input value="';
          const result=applySpecText(JSON.stringify(candidate));
          setSel(0,visual.id);renderBind();
          return {applied:result.applied,issues:result.issues};
        });
        await p.waitForTimeout(100);
        return {import:applied,...await p.evaluate(()=>({injectedImage:!!document.querySelector('[data-lead-marker]'),executed:window.leadMarkupExecuted===true}))};
      });
    }
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));
    console.log(JSON.stringify(results,null,2));
    if(results.some(r=>r.probeError))process.exitCode=1;
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});

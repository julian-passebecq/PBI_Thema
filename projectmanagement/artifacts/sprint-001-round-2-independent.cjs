const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const {chromium}=require('../../node_modules/playwright');
const root=require('node:path').resolve(__dirname,'../..');
const output=root+'/test-artifacts/sprint-001-test-round-2';
const results=[];
// Observation only: no render, save, revision notification, or history mutation.
const settled=p=>p.waitForFunction(()=>{
 const s=JSON.parse(localStorage.getItem(LS_KEY)||'null');
 return _saveT===null&&s&&JSON.stringify(s.spec)===JSON.stringify(SPEC)&&JSON.stringify(s.theme)===JSON.stringify(S)&&HIST[HPOS]?.sig===histSig();
},null,{timeout:6000});
const config=p=>p.evaluate(()=>{setMode('config');setLevel(3);setAllSections(true);});
const download=async p=>{const [d]=await Promise.all([p.waitForEvent('download'),p.evaluate(()=>downloadSpec())]);return JSON.parse(fs.readFileSync(await d.path(),'utf8'));};
async function change(p,action){await settled(p);const old=await p.evaluate(()=>HPOS);await action();await settled(p);assert.equal(await p.evaluate(()=>HPOS),old+1);}
const snapshot=p=>p.evaluate(()=>JSON.stringify({S,SPEC,MODEL,HPOS,HIST,revision:documentRevision,saved:localStorage.getItem(LS_KEY)}));
(async()=>{
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync(root+'/theme-forge.html'));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();
 try{
 for(const url of [require('node:url').pathToFileURL(root+'/theme-forge.html').href,`http://127.0.0.1:${server.address().port}/`]){
 const transport=url.startsWith('file:')?'file':'http';
 async function scenario(name,fn){const p=await browser.newPage({viewport:{width:1440,height:1000}});p.setDefaultTimeout(6000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{await p.goto(url);await settled(p);await fn(p);assert.deepEqual(errors,[]);results.push({transport,name,status:'PASS'});}
 catch(e){results.push({transport,name,status:'FAIL',error:e.stack,errors});await p.screenshot({path:`${output}/${transport}-${name}-failure.png`,fullPage:true});}
 finally{await p.close();fs.writeFileSync(output+'/independent-results.json',JSON.stringify(results,null,2));}}
 await scenario('T17-second-threshold-and-gradient-endpoints',async p=>{
  const marker='é &quot; "><img data-round2-marker src="data:image/png;base64,AA==" onerror="window.round2Executed=true"><input value="';
  const result=await p.evaluate(marker=>{
   const s=structuredClone(SPEC),v=s.pages[0].visuals.find(v=>v.kind==='table');
   v.formatting={conditional:[{id:'round2-rule',target:{layer:'visualObjects',object:'values',property:'fontColor'},basedOn:{kind:'Measure',table:'Measures',name:'Revenue'},mode:'rules',rules:[{operator:'between',value:'start',value2:marker,result:{type:'color',value:'#123456'}}]}]};
   const r=applySpecText(JSON.stringify(s));setSel(0,v.id);renderBind();openTool('r:format');setLevel(3);setAllSections(true);return {applied:r.applied,id:v.id};
  },marker);assert(result.applied);
  assert.equal(await p.locator('[data-cfval2="0.0"]').inputValue(),marker);
  await change(p,async()=>{await p.locator('[data-cfval2="0.0"]').fill(marker+' 🧪');await p.locator('[data-cfval2="0.0"]').press('Tab');});
  assert.equal(await p.locator('[data-round2-marker]').count(),0);assert.equal(await p.evaluate(()=>window.round2Executed),undefined);
  await p.reload();await p.evaluate(id=>{setSel(0,id);renderBind();openTool('r:format');setLevel(3);setAllSections(true);},result.id);
  assert.equal(await p.locator('[data-cfval2="0.0"]').inputValue(),marker+' 🧪');assert.equal(await p.locator('[data-round2-marker]').count(),0);
  const spec=await download(p);assert.equal(spec.pages[0].visuals.find(v=>v.id===result.id).formatting.conditional[0].rules[0].value2,marker+' 🧪');
  for(const endpoint of ['max','center']){await settled(p);const before=await snapshot(p);const r=await p.evaluate(({endpoint,marker,id})=>{const s=structuredClone(SPEC),v=s.pages[0].visuals.find(v=>v.id===id);const c=v.formatting.conditional[0];c.mode='gradient';c.gradient={min:{value:0,color:'#000000'},max:{value:100,color:'#ffffff'},[endpoint]:{value:marker,color:'#123456'}};return applySpecText(JSON.stringify(s));},{endpoint,marker,id:result.id});assert.equal(r.applied,false);assert(r.issues.some(i=>i.code==='type.number'&&i.path.endsWith(endpoint+'.value')));await p.waitForTimeout(850);assert.equal(await snapshot(p),before);}
  for(const width of [420,768,1024,1440]){await p.setViewportSize({width,height:1000});await p.locator('[data-cfval2="0.0"]').scrollIntoViewIfNeeded();await p.screenshot({path:`${output}/${transport}-threshold-${width}.png`});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 });
 await scenario('T18-two-hidden-pages-undo-redo-unhide',async p=>{
  await config(p);const names=await p.locator('[data-pgt]').evaluateAll(es=>es.slice(0,2).map(e=>e.dataset.pgt));assert.equal(names.length,2);
  await change(p,()=>p.locator('[data-pgt]').nth(0).click());await change(p,()=>p.locator('[data-pgt]').nth(1).click());
  assert.deepEqual(await p.evaluate(()=>S.pagesOff),names);await p.locator('#btnUndo').click();await settled(p);assert.deepEqual(await p.evaluate(()=>S.pagesOff),[names[0]]);
  await p.locator('#btnRedo').click();await settled(p);await p.reload();assert.equal(await p.locator('#recoveryNotice').count(),0);assert.deepEqual(await p.evaluate(()=>S.pagesOff),names);
  await config(p);await change(p,()=>p.locator('[data-pgt]').nth(0).click());await p.reload();assert.deepEqual(await p.evaluate(()=>S.pagesOff),[names[1]]);
  await settled(p);const before=await snapshot(p);const r=await p.evaluate(()=>prepareSession({theme:{...S,pagesOff:[12]},spec:SPEC,model:MODEL}));assert.equal(r.status,'rejected');assert.equal(await snapshot(p),before);
 });
 await scenario('T19-advanced-filter-and-bookmark-flags',async p=>{
  await config(p);await change(p,()=>p.locator('#rfFAdd').click());await change(p,()=>p.locator('[data-filters="rf"] [data-ftype]').selectOption('advanced'));
  await change(p,async()=>{await p.locator('[data-filters="rf"] [data-fcval]').fill('literal é <threshold>');await p.locator('[data-filters="rf"] [data-fcval]').press('Tab');});
  await change(p,()=>p.locator('[data-filters="rf"] [data-flock]').click());await change(p,()=>p.locator('[data-filters="rf"] [data-fhide]').click());
  await change(p,()=>p.locator('#bmAdd').click());await change(p,()=>p.locator('[data-bmcap="0.currentPage"]').click());await change(p,()=>p.locator('[data-bmcap="0.display"]').click());
  const expected=await p.evaluate(()=>({filter:structuredClone(SPEC.filters[0]),bookmark:structuredClone(SPEC.bookmarks[0])}));assert.equal(expected.filter.conditions[0].value,'literal é <threshold>');assert(expected.filter.locked&&expected.filter.hidden);assert(expected.bookmark.captures.currentPage);assert.equal(expected.bookmark.captures.display,false);
  await p.reload();assert.equal(await p.locator('#recoveryNotice').count(),0);assert.deepEqual(await p.evaluate(()=>({filter:SPEC.filters[0],bookmark:SPEC.bookmarks[0]})),expected);
  await config(p);await settled(p);const before=await snapshot(p);await p.locator('#bmPreview').selectOption(expected.bookmark.id);await p.waitForTimeout(900);assert.equal(await snapshot(p),before);
 });
 await scenario('T20-two-blank-bookmarks-roundtrip',async p=>{
  await config(p);for(let i=0;i<2;i++){await change(p,()=>p.locator('#bmAdd').click());await change(p,async()=>{await p.locator(`[data-bmname="${i}"]`).fill('');await p.locator(`[data-bmname="${i}"]`).press('Tab');});}
  const bookmarks=await p.evaluate(()=>structuredClone(SPEC.bookmarks));assert.notEqual(bookmarks[0].id,bookmarks[1].id);await p.reload();assert.equal(await p.locator('#recoveryNotice').count(),0);assert.deepEqual(await p.evaluate(()=>SPEC.bookmarks),bookmarks);
  const spec=await download(p);assert.deepEqual(spec.bookmarks,bookmarks);assert((await p.evaluate(s=>applySpecText(JSON.stringify(s)),spec)).applied);await settled(p);
  const before=await snapshot(p);spec.bookmarks[1].id=spec.bookmarks[0].id;assert.equal((await p.evaluate(s=>applySpecText(JSON.stringify(s)),spec)).applied,false);await p.waitForTimeout(850);assert.equal(await snapshot(p),before);
  await config(p);await change(p,async()=>{await p.locator('[data-bmname="1"]').fill('é & "literal" <bookmark>');await p.locator('[data-bmname="1"]').press('Tab');});await p.reload();assert.equal(await p.evaluate(()=>SPEC.bookmarks[1].name),'é & "literal" <bookmark>');assert.equal(await p.evaluate(()=>SPEC.bookmarks[0].name),'');
 });
 }
 console.log(JSON.stringify(results,null,2));if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});

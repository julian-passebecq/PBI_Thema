const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const url=process.env.THEME_FORGE_URL||pathToFileURL(path.resolve(__dirname,'../theme-forge.html')).href;
const transport=url.startsWith('file:')?'file':'http';
const output=path.resolve(__dirname,'../test-artifacts/sprint-001-dev-02',transport);
fs.mkdirSync(output,{recursive:true});
const marker='0"><img data-repair-marker="true" src="data:image/png;base64,AA==" onerror="window.repairMarkupExecuted=true"><input value="';
const noMarkup=async p=>{
  assert.equal(await p.locator('[data-repair-marker]').count(),0);
  assert.equal(await p.evaluate(()=>window.repairMarkupExecuted===true),false);
};
// Only observe normal timers. No flushing, pushing, or rendering in this helper.
const settled=p=>p.waitForFunction(()=>{
  const saved=JSON.parse(localStorage.getItem(LS_KEY)||'null');
  return saved&&JSON.stringify(saved.spec)===JSON.stringify(SPEC)&&JSON.stringify(saved.theme)===JSON.stringify(S)&&HIST[HPOS]?.sig===histSig();
},null,{timeout:5000});
const config=async p=>p.evaluate(()=>{setMode('config');setLevel(3);setAllSections(true);});
const exported=async p=>{
  const [d]=await Promise.all([p.waitForEvent('download'),p.evaluate(()=>downloadSpec())]);
  return JSON.parse(fs.readFileSync(await d.path(),'utf8'));
};
// Prove event wiring: await prior timers, act through controls, then read accepted state/history/storage.
// Neither action nor observation invokes a save/history/render helper.
async function changed(p,action,check){
  await settled(p);
  const before=await p.evaluate(()=>({history:HIST.length,pos:HPOS,revision:documentRevision}));
  await action();
  await p.waitForFunction(check,null,{timeout:5000});
  await settled(p);
  const after=await p.evaluate(()=>({history:HIST.length,pos:HPOS,revision:documentRevision}));
  assert.equal(after.pos,before.pos+1,'accepted change needs its own coalesced history step');
  assert(after.revision>before.revision,'accepted change must invalidate older drafts');
}
(async()=>{
  const browser=await chromium.launch();const results=[];
  async function scenario(name,run){
    const p=await browser.newPage({viewport:{width:1440,height:1000}});p.setDefaultTimeout(6000);
    const errors=[];p.on('pageerror',e=>errors.push(e.message));
    try{await p.goto(url);await settled(p);await run(p);assert.deepEqual(errors,[]);results.push({name,status:'PASS'});console.log(name+': PASS');}
    catch(e){await p.screenshot({path:path.join(output,name+'-failure.png'),fullPage:true}).catch(()=>{});fs.writeFileSync(path.join(output,name+'-failure.txt'),String(e.stack)+'\n'+JSON.stringify(errors));throw e;}
    finally{await p.close();}
  }
  try{
    for(const scope of ['visual','page'])await scenario('T17-formatting-'+scope,async p=>{
      const result=await p.evaluate(({scope,marker})=>{
        const s=structuredClone(SPEC),owner=scope==='page'?s.pages[0]:s.pages[0].visuals.find(v=>v.kind==='table');
        const targets=FMT_TARGETS.filter(t=>scope==='page'?t.layer==='pageObjects':t.layer==='visualObjects');
        const color=targets.find(t=>t.type==='color'&&(scope==='page'||t.cond)),numeric=targets.find(t=>t.type==='integer'||t.type==='number');
        const target=t=>({layer:t.layer,object:t.object,property:t.property});
        owner.formatting={overrides:[{id:'retained-invalid-value',target:target(numeric),value:{type:numeric.type,value:marker}}],
          conditional:[{id:'string-rule',target:target(color),basedOn:{kind:'Measure',table:'Measures',name:'Revenue'},mode:'rules',
            rules:[{operator:'between',value:marker,value2:'a "quoted" string <end>',result:{type:'color',value:'#123456'}}]}]};
        const r=applySpecText(JSON.stringify(s));
        if(scope==='visual'){setSel(0,owner.id);renderBind();openTool('r:visual');}else setMode('config');
        setLevel(3);setAllSections(true);
        return {applied:r.applied,ownerId:owner.id,formatting:owner.formatting};
      },{scope,marker});
      assert.equal(result.applied,true);await noMarkup(p);
      const root=scope==='page'?'#cfgBody .pagefmt':'#bindPanel';
      assert.equal(await p.locator(root+' [data-cfval="0.0"]').inputValue(),marker);
      assert.equal(await p.locator(root+' [data-cfval2="0.0"]').inputValue(),'a "quoted" string <end>');
      // Editing a supported string threshold must not coerce it to NaN/zero.
      await p.locator(root+' [data-cfval2="0.0"]').fill('Keep "literal" <text>');
      await p.locator(root+' [data-cfval2="0.0"]').press('Tab');
      result.formatting.conditional[0].rules[0].value2='Keep "literal" <text>';
      // R-A checks lifecycle recovery; T19 below independently checks normal notification timers.
      await p.reload();assert.equal(await p.locator('#recoveryNotice').count(),0);
      await p.evaluate(({scope,id})=>{if(scope==='page')setMode('config');else{setSel(0,id);renderBind();openTool('r:visual');}setLevel(3);setAllSections(true);},{scope,id:result.ownerId});
      await noMarkup(p);
      const saved=await exported(p),owner=scope==='page'?saved.pages[0]:saved.pages[0].visuals.find(v=>v.id===result.ownerId);
      assert.deepEqual(owner.formatting,result.formatting);
      for(const width of [420,1440]){
        await p.setViewportSize({width,height:1000});await p.locator(root+' [data-cfval="0.0"]').scrollIntoViewIfNeeded();
        assert((await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=1);
        const sizes=await p.locator(root+' .fmtrule').evaluateAll(rows=>rows.flatMap(row=>[...row.querySelectorAll('input,select,button')].map(el=>({tag:el.tagName,width:el.getBoundingClientRect().width}))));
        assert(sizes.every(s=>s.width>=(s.tag==='SELECT'?80:24)),'formatting controls must remain usable at '+width);
        await p.screenshot({path:path.join(output,'T17-'+scope+'-'+width+'.png')});
      }
      // Gradient numeric endpoints reject path-specifically before changing state; rendering remains safe independently.
      assert(await p.evaluate(({scope,marker})=>{
        const s=structuredClone(SPEC),o=scope==='page'?s.pages[0]:s.pages[0].visuals.find(v=>v.kind==='table');
        o.formatting.conditional[0].mode='gradient';o.formatting.conditional[0].gradient={min:{value:marker,color:'#123456'},max:{value:100,color:'#654321'}};
        const before=JSON.stringify([S,SPEC,MODEL,HIST,HPOS,localStorage.getItem(LS_KEY)]),r=applySpecText(JSON.stringify(s));
        const unchanged=before===JSON.stringify([S,SPEC,MODEL,HIST,HPOS,localStorage.getItem(LS_KEY)]);
        const sandbox=document.createElement('div');sandbox.id='render-safety-probe';sandbox.innerHTML=fmtHtml(o,scope);document.body.appendChild(sandbox);
        return !r.applied&&r.issues.some(i=>i.path.endsWith('gradient.min.value')&&i.code==='type.number')&&unchanged;
      },{scope,marker}));await noMarkup(p);
      assert(await p.evaluate(marker=>{
        const host=document.createElement('div');host.innerHTML=valueEditor({type:'number'},{toString:marker,valueOf:marker},'data-invalid-editor');document.body.appendChild(host);
        return !host.querySelector('[data-repair-marker]');
      },marker));
    });
    await scenario('T17-retained-preview-values',async p=>{
      assert(await p.evaluate(marker=>{
        const s=structuredClone(SPEC),v=s.pages[0].visuals.find(v=>v.kind==='table');
        v.formatting={overrides:[
          {id:'bad-color',target:{layer:'visualContainerObjects',object:'background',property:'color'},value:{type:'color',value:marker}},
          {id:'bad-size',target:{layer:'visualContainerObjects',object:'title',property:'fontSize'},value:{type:'integer',value:marker}},
          {id:'bar-on',target:{layer:'visualObjects',object:'dataBars',property:'show'},value:{type:'boolean',value:true}},
          {id:'bad-bar-color',target:{layer:'visualObjects',object:'dataBars',property:'positiveColor'},value:{type:'color',value:marker}}],
          conditional:[{id:'bad-result',target:{layer:'visualObjects',object:'values',property:'fontColor'},mode:'rules',
            basedOn:{kind:'Measure',table:'Measures',name:'Revenue'},rules:[{operator:'isNotBlank',result:{type:'color',value:marker}}]}]};
        const r=applySpecText(JSON.stringify(s));return r.applied&&r.issues.length>0;
      },marker));
      await noMarkup(p);await p.reload();await noMarkup(p);assert.equal(await p.locator('#recoveryNotice').count(),0);
      const result=await exported(p),v=result.pages[0].visuals.find(v=>v.kind==='table');
      assert.equal(v.formatting.overrides[0].value.value,marker);assert.equal(v.formatting.conditional[0].rules[0].result.value,marker);
      assert(result.validation.errors>0);
    });
    await scenario('T18-hidden-page-recovery',async p=>{
      await p.locator('#themename').fill('Hidden page retained');await config(p);
      const toggle=p.locator('[data-pgt]').first(),name=await toggle.getAttribute('data-pgt');await toggle.click();await settled(p);
      await p.reload();assert.equal(await p.locator('#recoveryNotice').count(),0);
      assert.equal(await p.locator('#themename').inputValue(),'Hidden page retained');
      assert.deepEqual(await p.evaluate(()=>S.pagesOff),[name]);
      assert.equal(await p.evaluate(n=>shownPages().some(i=>PAGES[i].n===n),name),false);
      const legacy=await p.evaluate(()=>({v:'1.6',theme:S,spec:SPEC,model:MODEL}));
      const old=await browser.newPage();try{await old.addInitScript(s=>localStorage.setItem('theme-forge.session.v2',JSON.stringify(s)),legacy);await old.goto(url);
        assert.equal(await old.locator('#recoveryNotice').count(),0);assert.deepEqual(await old.evaluate(()=>S.pagesOff),[name]);}finally{await old.close();}
    });
    await scenario('T20-bookmark-display-name',async p=>{
      await config(p);await p.locator('#bmAdd').click();
      await p.locator('[data-bmname]').fill('');await p.locator('[data-bmname]').press('Tab');
      await p.reload();assert.equal(await p.locator('#recoveryNotice').count(),0);
      assert.equal(await p.evaluate(()=>SPEC.bookmarks[0].name),'');
      assert(await p.evaluate(()=>specIssues.some(i=>i.msg.includes('has no name'))));
      const output=await exported(p);assert.equal(output.bookmarks[0].name,'');assert(output.bookmarks[0].id);
      assert((await p.evaluate(s=>applySpecText(JSON.stringify(s)),output)).applied);
      for(const [key,val] of [['name',12],['name',null],['id',''],['id',42],['id',undefined]]){
        assert(await p.evaluate(({key,val})=>{const s=structuredClone(SPEC);s.bookmarks[0][key]=val;
          const before=JSON.stringify([S,SPEC,HIST,HPOS,localStorage.getItem(LS_KEY)]),r=applySpecText(JSON.stringify(s));
          return !r.applied&&before===JSON.stringify([S,SPEC,HIST,HPOS,localStorage.getItem(LS_KEY)]);},{key,val}));
      }
      // Another producer/recovery mismatch: arbitrary imported preset names may be blank strings.
      assert(await p.evaluate(()=>{const r=applyThemeText('{"visualStyles":{"card":{"":{"title":[{"show":false}]}}}}');return r.applied&&prepareSession({theme:S,spec:SPEC,model:MODEL}).status==='ready';}));
    });
    if(!process.argv.includes('--ra')){
      await scenario('T19-interaction-focus-history',async p=>{
        await p.evaluate(()=>{setSel(0,SPEC.pages[0].visuals[0].id);renderBind();openTool('r:inter');setLevel(3);setAllSections(true);});
        await changed(p,async()=>{
          await p.locator('#bInter').fill('Unassisted cross-filter edit');
          await p.locator('#bInter').pressSequentially(' retained',{delay:10});
        },()=>SPEC.pages[0].visuals[0].interaction==='Unassisted cross-filter edit retained');
        assert.equal(await p.locator('#bInter').inputValue(),'Unassisted cross-filter edit retained');
        assert.equal(await p.evaluate(()=>document.activeElement.id),'bInter');
        assert.equal(await p.locator('#btnUndo').isEnabled(),true);
        await p.locator('#btnUndo').click(); // Real toolbar action; pending redo then immediate new edit.
        // Undo intentionally clears selection: reselect, then edit without waiting for its save timer.
        await p.evaluate(()=>{setSel(0,SPEC.pages[0].visuals[0].id);renderBind();openTool('r:inter');});
        await p.locator('#bInter').fill('Edit after undo');await settled(p);
        assert.equal(await p.evaluate(()=>SPEC.pages[0].visuals[0].interaction),'Edit after undo');
        assert.equal(await p.locator('#btnRedo').isDisabled(),true);
        await p.reload();assert.equal(await p.evaluate(()=>SPEC.pages[0].visuals[0].interaction),'Edit after undo');
        await p.evaluate(()=>{setSel(0,SPEC.pages[0].visuals[0].id);renderBind();openTool('r:access');setAllSections(true);});
        await changed(p,()=>p.locator('#bAlt').fill('Alt text saved without blur'),()=>SPEC.pages[0].visuals[0].altText==='Alt text saved without blur');
        assert.equal(await p.evaluate(()=>document.activeElement.id),'bAlt');
      });
      for(const scope of ['report','page','visual'])await scenario('T19-filters-'+scope,async p=>{
        await config(p);
        if(scope==='visual')await p.evaluate(()=>{setSel(0,SPEC.pages[0].visuals[0].id);renderBind();openTool('r:filters');setAllSections(true);});
        const prefix={report:'rf',page:'pf',visual:'vf'}[scope],root=`[data-filters="${prefix}"]`;
        await changed(p,()=>p.locator('#'+prefix+'FAdd').click(),()=>true);
        assert.equal(await p.locator(root+' [data-frm]').count(),1);
        await changed(p,()=>p.locator(root+' [data-ftype]').selectOption('range'),()=>true);
        await changed(p,async()=>{await p.locator(root+' [data-fmin]').fill('23');await p.locator(root+' [data-fmin]').press('Tab');},()=>true);
        assert.equal(await p.locator(root+' [data-fmin]').inputValue(),'23');
        const filter=await p.evaluate(scope=>({report:SPEC,page:SPEC.pages[0],visual:SPEC.pages[0].visuals[0]})[scope].filters[0],scope);
        assert.equal(filter.type,'range');assert.equal(filter.min,23);
        await p.reload();assert.equal(await p.locator('#recoveryNotice').count(),0);
        assert.equal(await p.evaluate(scope=>({report:SPEC,page:SPEC.pages[0],visual:SPEC.pages[0].visuals[0]})[scope].filters[0].min,scope),23);
        await config(p);
        if(scope==='visual')await p.evaluate(()=>{setSel(0,SPEC.pages[0].visuals[0].id);renderBind();openTool('r:filters');setAllSections(true);});
        await changed(p,()=>p.locator(root+' [data-frm]').click(),()=>true);
        assert.equal(await p.locator(root+' [data-frm]').count(),0);
        assert.equal(await p.evaluate(scope=>({report:SPEC,page:SPEC.pages[0],visual:SPEC.pages[0].visuals[0]})[scope].filters?.length||0,scope),0);
      });
      await scenario('T19-bookmarks-readonly',async p=>{
        await config(p);
        await changed(p,()=>p.locator('#bmAdd').click(),()=>SPEC.bookmarks?.length===1);
        await changed(p,async()=>{await p.locator('[data-bmname]').fill('Saved bookmark');await p.locator('[data-bmname]').press('Tab');},()=>SPEC.bookmarks[0].name==='Saved bookmark');
        await changed(p,()=>p.locator('[data-bmhide]').first().click(),()=>SPEC.bookmarks[0].hiddenVisualIds.length===1);
        await changed(p,()=>p.locator('[data-bmcap$=".data"]').click(),()=>SPEC.bookmarks[0].captures.data===false);
        const bookmark=await p.evaluate(()=>structuredClone(SPEC.bookmarks[0]));
        const before=await p.evaluate(()=>JSON.stringify({history:HIST.map(h=>h.sig),pos:HPOS,revision:documentRevision,saved:localStorage.getItem(LS_KEY)}));
        await p.locator('#bmPreview').selectOption(bookmark.id);
        await p.evaluate(()=>{setLevel(1);setLevel(3);setSel(0,SPEC.pages[0].visuals[1].id);openTool('r:inter');closeDock();});
        // Deliberately exceed both debounce intervals to catch a delayed workspace-only write.
        await p.waitForTimeout(900);
        assert.equal(await p.evaluate(()=>JSON.stringify({history:HIST.map(h=>h.sig),pos:HPOS,revision:documentRevision,saved:localStorage.getItem(LS_KEY)})),before);
        await p.reload();assert.equal(await p.locator('#recoveryNotice').count(),0);assert.deepEqual(await p.evaluate(()=>SPEC.bookmarks[0]),bookmark);
        await config(p);
        await changed(p,async()=>{await p.locator('[data-bmname]').fill('');await p.locator('[data-bmname]').press('Tab');},()=>SPEC.bookmarks[0].name==='');
        await p.reload();assert.equal(await p.locator('#recoveryNotice').count(),0);assert.equal(await p.evaluate(()=>SPEC.bookmarks[0].name),'');
        await config(p);await changed(p,()=>p.locator('[data-bmrm]').click(),()=>!SPEC.bookmarks?.length);
      });
      for(const scope of ['page','visual'])await scenario('T19-formatting-'+scope,async p=>{
        if(scope==='page')await config(p);
        else await p.evaluate(()=>{setSel(0,SPEC.pages[0].visuals[0].id);renderBind();openTool('r:format');setLevel(3);setAllSections(true);});
        const root=scope==='page'?'#cfgBody .pagefmt':'#bindPanel',prefix=scope==='page'?'pg':'vi';
        const numeric=await p.evaluate(scope=>FMT_TARGETS.find(t=>(scope==='page'?t.layer==='pageObjects':t.layer==='visualContainerObjects')&&(t.type==='number'||t.type==='integer')).id,scope);
        await p.locator('#'+prefix+'AddSel').selectOption(numeric);
        await changed(p,()=>p.locator('#'+prefix+'AddBtn').click(),()=>true);
        await changed(p,async()=>{await p.locator(root+' [data-ovv]').fill('17');await p.locator(root+' [data-ovv]').press('Tab');},()=>true);
        assert.equal(await p.locator(root+' [data-ovv]').inputValue(),'17');
        await changed(p,()=>p.locator(root+' [data-rmov]').click(),()=>true);
      });
      await scenario('T19-page-title-and-draft-revision',async p=>{
        await config(p);
        await changed(p,()=>p.locator('#pgTitle').fill('Page title saved while focused'),()=>SPEC.pages[0].title==='Page title saved while focused');
        assert.equal(await p.evaluate(()=>document.activeElement.id),'pgTitle');
        // Keep a full-editor draft, then edit through a newly notified actual control.
        await p.evaluate(()=>setMode('jsoned'));await p.locator('#jeSpec').fill('{ unfinished retained spec');
        await p.evaluate(()=>{setMode('report');setSel(0,SPEC.pages[0].visuals[0].id);renderBind();openTool('r:inter');setAllSections(true);});
        await changed(p,()=>p.locator('#bInter').fill('Invalidates older draft'),()=>SPEC.pages[0].visuals[0].interaction==='Invalidates older draft');
        await p.evaluate(()=>setMode('jsoned'));assert.equal(await p.locator('#jeSpec').inputValue(),'{ unfinished retained spec');
        await p.locator('#jeSpecApply').click();assert(await p.locator('#draftConflict').isVisible());await p.locator('#draftKeep').click();
        // Race probe: dispatch the existing input handler while a conversion is pending.
        // Pointer interaction is modal; this models a queued handler/external change at that boundary.
        await p.evaluate(()=>{setMode('report');setSel(0,SPEC.pages[0].visuals[0].id);renderBind();openTool('r:inter');
          applyThemeText('{"visualStyles":{"*":{"*":{"title":[{"show":false}]}}}}');});
        assert(await p.locator('#conversionDialog').isVisible());
        await p.evaluate(()=>{const input=document.querySelector('#bInter');input.value='Queued notified edit';input.dispatchEvent(new Event('input',{bubbles:true}));});
        await settled(p);assert.equal(await p.locator('#conversionDialog').isVisible(),false);
        assert(await p.evaluate(()=>pendingConversion===null&&drafts['full:spec'].raw==='{ unfinished retained spec'));
      });
    }
    fs.writeFileSync(path.join(output,'repair-results.json'),JSON.stringify({url,node:process.version,results},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

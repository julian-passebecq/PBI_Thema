const {chromium}=require('../../node_modules/playwright');
const fs=require('node:fs');
(async()=>{
 const b=await chromium.launch();const p=await b.newPage();
 try{
 await p.goto('file:///D:/PROJ/PBI_Thema/theme-forge.html');await p.waitForFunction(()=>_saveT===null&&localStorage.getItem(LS_KEY));await p.reload();
 const before=await p.evaluate(()=>({pendingSave:_saveT!==null,document:JSON.stringify([S,SPEC,MODEL]),history:JSON.stringify([HIST,HPOS]),saved:JSON.parse(localStorage.getItem(LS_KEY))}));
 await p.waitForFunction(()=>_saveT===null);
 const after=await p.evaluate(()=>({document:JSON.stringify([S,SPEC,MODEL]),history:JSON.stringify([HIST,HPOS]),saved:JSON.parse(localStorage.getItem(LS_KEY))}));
 const result={pendingSaveAtReload:before.pendingSave,documentUnchanged:before.document===after.document,historyUnchanged:before.history===after.history,changedStoredKeys:Object.keys(before.saved).filter(k=>JSON.stringify(before.saved[k])!==JSON.stringify(after.saved[k]))};
 fs.writeFileSync('test-artifacts/sprint-001-test-round-2/timer-diagnostic.json',JSON.stringify(result,null,2));console.log(result);
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

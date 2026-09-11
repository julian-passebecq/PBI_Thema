const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spec,model}=require('./fixtures/reliability');
const html=fs.readFileSync(require('node:path').join(__dirname,'../theme-forge.html'),'utf8');
const domain=html.slice(html.indexOf('const INPUT_LIMIT='),html.indexOf('/* DOCUMENT CONTRACTS END */'));
const migration=html.slice(html.indexOf('function migrateSpec(j){'),html.indexOf('/* ---- formatting intent validation ---- */'));
const context=vm.createContext({structuredClone,TextEncoder,SPEC_CONTRACT:3,SPEC_CONTRACT_MIN:1,INTENT_IDS:[],INTENT_ONLY:{}});
vm.runInContext(domain+ '\n'+migration,context);
const prep=(x,k='spec')=>context.prepareDocument(x,k);
for(const version of [undefined,1,2,3]){
  const input=spec();if(version===undefined)delete input.contractVersion;else input.contractVersion=version;
  delete input.pages[0].id;delete input.pages[0].visuals[0].id;
  const before=JSON.stringify(input),r=prep(input);
  assert.equal(r.status,'ready');assert.equal(r.candidate.contractVersion,3);
  assert.equal(JSON.stringify(input),before);assert.equal(JSON.stringify(prep(input).candidate),JSON.stringify(r.candidate));
}
for(const version of [0,-1,4,999,1.5,'3',null]){const s=spec();s.contractVersion=version;assert.equal(prep(s).status,'rejected');}
for(const input of [null,[],1,'true',false,{pages:[null]},{pages:[{visuals:{}}]}])assert.equal(prep(input).status,'rejected');
const mutations=[
  s=>s.pages[0].id=123,s=>s.pages[0].visuals.push(structuredClone(s.pages[0].visuals[0])),
  s=>s.pages[0].visuals[0].position.width='240',s=>s.pages[0].visuals[0].bindings.value=17,
  s=>s.pages[0].filters={},s=>s.pages[0].visuals[0].formatting={conditional:[{rules:[null]}]},
  s=>s.bookmarks=[{hiddenVisualIds:'bad'}],s=>s.pages[0].visuals[0].bindings.value={kind:'Measure',table:null,name:'Revenue'},
];
for(const mutate of mutations){const s=spec();mutate(s);const r=prep(s);assert.equal(r.status,'rejected');assert(r.issues.every(i=>i.path&&i.code&&i.blocking));}
const extension=spec();extension.report.extra={filters:'extension text'};assert.equal(prep(extension).status,'ready');
const emptyText=spec();emptyText.pages[0].visuals[0].altText='';emptyText.report.title='';assert.equal(prep(emptyText).status,'ready');
const bookmark=spec();bookmark.bookmarks=[{id:'bookmark-1',name:''}];assert.equal(prep(bookmark).status,'ready');
for(const [key,value] of [['id',''],['id',12],['id',undefined],['name',12],['name',null]]){
  const s=structuredClone(bookmark);s.bookmarks[0][key]=value;assert.equal(prep(s).status,'rejected');
}
for(const endpoint of ['min','max','center']){
  const s=spec();s.pages[0].formatting={conditional:[{id:'gradient',mode:'gradient',gradient:{[endpoint]:{value:'"<markup>'}}}]};
  const r=prep(s);assert.equal(r.status,'rejected');assert(r.issues.some(i=>i.code==='type.number'&&i.path.endsWith('.'+endpoint+'.value')));
  s.pages[0].formatting.conditional[0].gradient[endpoint].value=null;assert.equal(prep(s).status,'ready');
}
for(const value of ['"<literal markup>',17]){
  const s=spec();s.pages[0].formatting={conditional:[{id:'rules',rules:[{operator:'between',value,value2:value}]}]};assert.equal(prep(s).status,'ready');
  s.pages[0].formatting.conditional[0].rules[0].value={invalid:1};assert.equal(prep(s).status,'rejected');
}
const incomplete=spec();incomplete.pages[0].visuals[0].kind='constructor';assert.equal(prep(incomplete).status,'ready');
const secrets=spec();secrets.report.api_key='DO-NOT-PRINT';const clean=prep(secrets);assert.equal(clean.status,'ready');assert(!JSON.stringify(clean).includes('DO-NOT-PRINT'));
const pages=n=>({pages:Array.from({length:n},()=>({visuals:[]}))});assert.equal(prep(pages(40)).status,'ready');assert.equal(prep(pages(41)).status,'rejected');
const visuals=n=>({pages:[{visuals:Array.from({length:n},()=>({kind:'card'}))}]});assert.equal(prep(visuals(400)).status,'ready');assert.equal(prep(visuals(401)).status,'rejected');
const fields=n=>({tables:[{name:'T',columns:Array.from({length:n},(_,i)=>({name:'F'+i}))}]});assert.equal(prep(fields(4000),'model').status,'ready');assert.equal(prep(fields(4001),'model').status,'rejected');
for(const bad of [null,[],{tables:[null]},{tables:[{name:123,columns:[{name:456}]}]},{...model(),relationships:[null]}])assert.equal(prep(bad,'model').status,'rejected');
const bytes=JSON.stringify(spec());
for(const delta of [-1,0,1]){const text=bytes+' '.repeat(4*1024*1024-Buffer.byteLength(bytes)+delta);assert.equal(prep(text).status,delta>0?'rejected':'ready');}
const unicode=spec();unicode.report.title='é';const u=JSON.stringify(unicode);assert.equal(prep(u+' '.repeat(4*1024*1024-Buffer.byteLength(u))).status,'ready');
function deep(depth){let x='end';for(let i=0;i<depth;i++)x={x};return x;}
for(const depth of [63,64,65])assert.equal(context.inputData(deep(depth),'data').issues.length>0,depth>64);
assert.equal(JSON.stringify(context.suppliedChanges({a:[{show:true}]},{a:[{show:true,extra:1}],extra:2})), '[]');
assert.equal(context.suppliedChanges({a:[{show:false}]},{a:[{show:true}]} )[0].path,'theme.a[0].show');
console.log('Pure document contracts: PASS (versions, shape, IDs, limits, migrations, extensions, cleanup)');

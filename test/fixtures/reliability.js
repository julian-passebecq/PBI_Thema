const spec = () => ({contractVersion:3,report:{title:'Fixture report'},pages:[
  {id:'fixture-page',title:'Fixture page',visuals:[{id:'fixture-card',kind:'card',title:'Fixture value',
    position:{x:24,y:64,width:240,height:120},bindings:{value:{kind:'Measure',table:'Metrics',name:'Revenue'}}}]}]});
const model = () => ({contractVersion:1,modelName:'Fixture model',tables:[{name:'Metrics',measures:[{name:'Revenue'}]}]});
const lossyTheme = () => ({name:'Ten-color conversion',dataColors:Array.from({length:10},(_,i)=>'#'+String(i+1).repeat(6).slice(0,6)),
  visualStyles:{'*':{'*':{title:[{show:false}]},Quiet:{title:[{show:false}]}}}});
module.exports={spec,model,lossyTheme};

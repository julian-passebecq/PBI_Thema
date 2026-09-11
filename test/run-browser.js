const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const run=(file,url)=>new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,[path.join(__dirname,file)],{stdio:'inherit',env:{...process.env,THEME_FORGE_URL:url,
    THEME_FORGE_ARTIFACT_DIR:process.env.THEME_FORGE_ARTIFACT_DIR||path.join(root,'test-artifacts/sprint-001-dev-02/gate')}});
  child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error(file+' exited '+code)));
});
(async()=>{
  const server=http.createServer((req,res)=>{
    if(req.url!=='/theme-forge.html'){res.writeHead(404);res.end();return;}
    res.setHeader('Content-Type','text/html; charset=utf-8');fs.createReadStream(path.join(root,'theme-forge.html')).pipe(res);
  });
  try{
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    for(const url of [pathToFileURL(path.join(root,'theme-forge.html')).href,`http://127.0.0.1:${server.address().port}/theme-forge.html`]){
      console.log('Browser gate:',url);
      for(const file of ['smoke.js','regression.js','reliability.js','repairs.js'])await run(file,url);
    }
  }finally{await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});

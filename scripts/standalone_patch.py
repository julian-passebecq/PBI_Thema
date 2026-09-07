from pathlib import Path

p = Path("theme-forge.html")
s = p.read_text(encoding="utf-8")

if 'name="viewport"' not in s[:500]:
    s = s.replace(
        '<meta charset="utf-8">\n',
        '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n',
        1,
    )

old = '''let DOWNLOADS=null,SAMPLE=null;\nconst slug=s=>(s||'theme').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48)||'theme';\nconst themeText=()=>JSON.stringify(buildThemeJson(S),null,2);\nfunction flash(sel,msg){const b=$(sel),o=b.textContent;b.textContent=msg;setTimeout(()=>b.textContent=o,1400);}\nasync function copyText(txt,sel,msg){\n  try{await navigator.clipboard.writeText(txt);flash(sel,msg||'Copied');}\n  catch{const ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';\n    document.body.appendChild(ta);ta.select();\n    try{document.execCommand('copy');flash(sel,msg||'Copied');}catch{flash(sel,'Copy failed');}\n    finally{ta.remove();}}\n}\nasync function download(){\n  if(!DOWNLOADS){await copyText(themeText(),'#btnDownload','Copied instead');return;}\n  try{await DOWNLOADS.save({filename:slug(S.name)+'.json',data:themeText()});flash('#btnDownload','Saved');}\n  catch(e){if(e&&e.code==='declined')return;await copyText(themeText(),'#btnDownload','Copied instead');}\n}\n'''
new = '''let DOWNLOADS=null,SAMPLE=null;\nconst slug=s=>(s||'theme').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48)||'theme';\nconst themeText=()=>JSON.stringify(buildThemeJson(S),null,2);\nfunction flash(sel,msg){const b=$(sel),o=b.textContent;b.textContent=msg;setTimeout(()=>b.textContent=o,1400);}\nasync function copyText(txt,sel,msg){\n  try{await navigator.clipboard.writeText(txt);flash(sel,msg||'Copied');}\n  catch{const ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';\n    document.body.appendChild(ta);ta.select();\n    try{document.execCommand('copy');flash(sel,msg||'Copied');}catch{flash(sel,'Copy failed');}\n    finally{ta.remove();}}\n}\nfunction browserSave(filename,data,mime='application/json;charset=utf-8'){\n  const blob=new Blob([data],{type:mime});\n  const url=URL.createObjectURL(blob);\n  const a=document.createElement('a');\n  a.href=url;a.download=filename;a.rel='noopener';a.style.display='none';\n  document.body.appendChild(a);a.click();a.remove();\n  setTimeout(()=>URL.revokeObjectURL(url),1000);\n}\nasync function saveText(filename,data,sel){\n  if(DOWNLOADS){\n    try{await DOWNLOADS.save({filename,data});flash(sel,'Saved');return true;}\n    catch(e){if(e&&e.code==='declined')return false;}\n  }\n  try{browserSave(filename,data);flash(sel,'Downloaded');return true;}\n  catch(e){await copyText(data,sel,'Copied instead');return false;}\n}\nasync function download(){\n  await saveText(slug(S.name)+'.json',themeText(),'#btnDownload');\n}\n'''
if old not in s:
    raise SystemExit("Expected export block not found")
s = s.replace(old, new, 1)

old = '''async function downloadSpec(){\n  const txt=specText();\n  if(!DOWNLOADS){await copyText(txt,'#expSpec','Copied instead');return;}\n  try{await DOWNLOADS.save({filename:'dashboard-spec.json',data:txt});flash('#expSpec','Saved');}\n  catch(e){if(e&&e.code==='declined')return;await copyText(txt,'#expSpec','Copied instead');}\n}\n'''
new = '''async function downloadSpec(){\n  await saveText('dashboard-spec.json',specText(),'#expSpec');\n}\n'''
if old not in s:
    raise SystemExit("Expected spec download block not found")
s = s.replace(old, new, 1)

old = '''async function downloadTargetMap(){\n  const txt=JSON.stringify(buildTargetMap(),null,2);\n  if(!DOWNLOADS){await copyText(txt,'#expMap','Copied instead');return;}\n  try{await DOWNLOADS.save({filename:'export-target-map.json',data:txt});flash('#expMap','Saved');}\n  catch(e){if(e&&e.code==='declined')return;await copyText(txt,'#expMap','Copied instead');}\n}\n'''
new = '''async function downloadTargetMap(){\n  await saveText('export-target-map.json',JSON.stringify(buildTargetMap(),null,2),'#expMap');\n}\n'''
if old not in s:
    raise SystemExit("Expected target-map download block not found")
s = s.replace(old, new, 1)

old = '''if(window.claude&&typeof claude.use==='function'){\n  claude.use('downloads').then(d=>{DOWNLOADS=d||null;}).catch(()=>{});\n  claude.use('sample').then(s=>{SAMPLE=s||null;\n    $('#aiStatus').textContent=SAMPLE?'Connected to Claude — restyling runs on your own account.'\n      :'Claude is not available in this view; the keyword matcher will handle it.';}).catch(()=>{});\n}\n'''
new = '''if(window.claude&&typeof claude.use==='function'){\n  claude.use('downloads').then(d=>{DOWNLOADS=d||null;}).catch(()=>{});\n  claude.use('sample').then(s=>{SAMPLE=s||null;\n    $('#aiStatus').textContent=SAMPLE?'Connected to Claude — restyling runs on your own account.'\n      :'Standalone mode — built-in keyword restyling is active.';}).catch(()=>{\n        $('#aiStatus').textContent='Standalone mode — built-in keyword restyling is active.';\n      });\n}else{\n  $('#aiStatus').textContent='Standalone mode — built-in keyword restyling is active.';\n}\n'''
if old not in s:
    raise SystemExit("Expected Claude boot block not found")
s = s.replace(old, new, 1)

p.write_text(s, encoding="utf-8")
print(f"Patched {p}: {p.stat().st_size} bytes")

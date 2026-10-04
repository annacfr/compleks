// Regression coverage: decoded map, stroke About, viewport and consultation.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const root = path.resolve(__dirname, '../PythonProject1/complex-plus');
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
const server = http.createServer(async (req,res) => {
  try {
    const file = path.join(root, new URL(req.url,'http://localhost').pathname);
    const body = await fs.readFile(file);
    res.writeHead(200, {'Content-Type':mime[path.extname(file)] || 'application/octet-stream'});res.end(body);
  } catch {res.writeHead(404);res.end();}
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--disable-gpu']});
 try {
  for(const width of [320,360,390,430,768,1440]) for(const reducedMotion of ['no-preference','reduce']) {
   const page=await browser.newPage({viewport:{width,height:900},isMobile:width<=768,hasTouch:width<=768,reducedMotion});
   const errors=[],missing=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.url().includes('127.0.0.1')&&r.status()>=400)missing.push(r.url());});
   await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
   await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');
   await page.waitForSelector('.services__problem-section');
   await page.waitForSelector('#cpIntroLoader',{state:'hidden'});
   await page.waitForSelector('.hero--ready');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'page overflow '+width);
   const map=await page.locator('.hero__map-image').evaluate(async e=>{await e.decode();const r=e.getBoundingClientRect(),c=document.querySelector('.district-glow-canvas').getBoundingClientRect();return {w:e.naturalWidth,h:e.naturalHeight,opacity:+getComputedStyle(e).opacity,size:r.width,aligned:Math.abs(r.x-c.x)<1&&Math.abs(r.y-c.y)<1&&Math.abs(r.width-c.width)<1&&Math.abs(r.height-c.height)<1};});
   assert.deepEqual([map.w,map.h],[1536,1024]);assert(map.opacity>.2&&map.size>0&&map.aligned,JSON.stringify(map));
   if(width<=768) for(const state of ['true','false']) {
    await page.locator('.mobile-menu').click();
    assert.equal(await page.locator('.mobile-menu').getAttribute('aria-expanded'),state);
    assert(await page.locator('.header__inner').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}));
   }
   if([390,1440].includes(width)&&reducedMotion==='no-preference') await page.screenshot({path:'/tmp/hero-'+width+'.png'});
   const samples=[];
   for(const progress of [0,.15,.5,1,0]) {
    await page.evaluate(p=>{const s=document.querySelector('.about-section');window.scrollTo({top:s.getBoundingClientRect().top+scrollY+(s.offsetHeight-innerHeight)*p,behavior:'instant'});},progress);
    await page.waitForTimeout(100);
    const result=await page.locator('.about__fragment,.about__text-line').evaluateAll(es=>es.map(e=>({text:(e.querySelector('.about__ink-source')||e).textContent,opacity:getComputedStyle(e.querySelector('.about__ink-source')||e).opacity,filter:getComputedStyle(e).filter,transform:getComputedStyle(e).transform,offset:e.querySelector('svg text')?.style.strokeDashoffset})));
    assert(result.every(e=>e.filter==='none'&&e.transform==='none'));
    if(progress===0&&reducedMotion==='no-preference') assert(result.every(e=>+e.opacity===.14&&+e.offset>0),JSON.stringify(result));
    if(progress===1||reducedMotion==='reduce') assert(result.every(e=>e.opacity==='1'),JSON.stringify(result));
    samples.push(result);
    if([390,1440].includes(width)&&reducedMotion==='no-preference'&&[0,.5,1].includes(progress))await page.screenshot({path:'/tmp/stroke-'+width+'-'+progress+'.png'});
   }
   if(reducedMotion==='no-preference') assert(+samples[1][0].offset<+samples[0][0].offset);
   assert.deepEqual(samples[0],samples[4]);
   await page.locator('.hero__button').click();
   await page.waitForSelector('dialog[open]');
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('dialog[open]').count(),0);
   assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
   console.log('PASS map, stroke start/middle/end/reverse, menu, dialog, overflow, console',width,reducedMotion);
   await page.close();
  }
 } finally {await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});

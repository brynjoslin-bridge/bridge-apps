/* Community Connector finder: one shared app and data set, one thin page per lot.
   Each lot page sets window.FINDER = {lot: "<lot-id>", root: "../shared/"}.
   Areas are defined in shared/data/lots.json; listings in shared/data/listings.json. */
(async function(){
"use strict";
const CFG=window.FINDER||{};const R=CFG.root||"../shared/";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function getJSON(u){const r=await fetch(R+u,{cache:"no-cache"});if(!r.ok)throw new Error(u+" "+r.status);return r.json()}
const APP=document.getElementById("app");
let DATA,PCS,TAX,LOTS;
try{[DATA,PCS,TAX,LOTS]=await Promise.all([getJSON("data/listings.json"),getJSON("data/postcode-areas.json"),getJSON("data/categories.json"),getJSON("data/lots.json")])}
catch(e){APP.innerHTML='<p class="empty" style="margin:24px">Sorry, the listings could not be loaded. Please refresh the page.</p>';console.error(e);return}
const LOT=LOTS.lots[CFG.lot];
if(!LOT){APP.innerHTML='<p class="empty" style="margin:24px">Unknown area. <a href="../">See all areas</a>.</p>';return}
// Resolve the lot's places, including any lots it pulls in.
const PLACES=[];(function add(id,seen){const l=LOTS.lots[id];if(!l||seen.has(id))return;seen.add(id);PLACES.push(...(l.places||[]));(l.include||[]).forEach(x=>add(x,seen))})(CFG.lot,new Set());
document.title="What's on in "+LOT.name;
const EX=LOT.examplePostcode||"LN2 2PE", EXOUT=EX.split(" ")[0];
APP.innerHTML=`<header class="hero">
  <div class="hero-in">
    <a class="areas-link" href="../">All areas</a>
    <a class="logo" href="https://wearebridge.org/" target="_blank" rel="noopener"><img src="${R}assets/img/bridge-wordmark.png" alt="Bridge" width="480" height="169"></a>
    <p class="label">Community Connector, ${esc(LOT.name)}</p>
    <h1><span class="h-bold">What's on in</span> <span class="h-script">${esc(LOT.short)}</span></h1>
  </div>
  <svg class="rings" viewBox="0 0 200 200" aria-hidden="true" focusable="false"><circle cx="100" cy="100" r="96"/><circle cx="100" cy="100" r="74"/><circle cx="100" cy="100" r="52"/><circle cx="100" cy="100" r="30" class="disc"/></svg>
</header>
<main class="wrap">
<div class="intro">
  <span class="proto">Prototype, listings checked <span id="snap">recently</span></span>
  <p class="lead">Local groups, activities and support across ${esc(LOT.area)}, with a clear sign of how recently each listing was checked. Every listing comes from, and links to, H.A.Y. Lincolnshire. With no postcode you see everything in ${esc(LOT.area)}; add a postcode to search anywhere in Lincolnshire.</p>
  ${LOT.status==="draft"?`<p class="draftnote">The boundary for this area is a first draft and is still being checked with the local Community Connector.</p>`:""}
</div>

<section class="search-panel" aria-labelledby="search-h">
  <h2 class="label" id="search-h">Find something</h2>
  <div class="srow">
    <label class="f f-q">What are you looking for?
      <input type="search" id="q" placeholder="Try walking, dementia, carers" autocomplete="off">
    </label>
    <label class="f f-pc">Near postcode
      <input type="text" id="pc" placeholder="e.g. ${esc(EX)}" autocomplete="postal-code" inputmode="text" maxlength="9">
    </label>
    <label class="f f-rad">Within
      <select id="rad"><option value="1">1 mile</option><option value="2">2 miles</option><option value="3">3 miles</option><option value="5" selected>5 miles</option><option value="10">10 miles</option><option value="20">20 miles</option></select>
    </label>
    <div class="sbtns"><button class="btn" id="pcgo" type="button">Search</button><button class="btn ghost" id="pcclear" type="button" hidden>Clear postcode</button></div>
  </div>
  <p class="msg" id="pcmsg" aria-live="polite"></p>
  <div class="catnav">
    <span class="flab" id="cat-lab">Category</span>
    <nav class="crumbs" id="crumbs" aria-label="Category path"></nav>
    <div class="chips" id="catchips" role="group" aria-labelledby="cat-lab"></div>
  </div>
  <div class="row2">
    <div class="seg" role="group" aria-label="Listing type" id="type">
      <button aria-pressed="true" data-v="">All</button><button aria-pressed="false" data-v="Activity">Activities</button><button aria-pressed="false" data-v="Support">Support</button>
    </div>
    <label class="f">Who it's for
    <select id="ls"><option value="">Everyone</option></select>
  </label>
    <label class="f">Last checked
      <select id="fr">
        <option value="">Any time</option>
        <option value="fresh">Within 6 months</option>
        <option value="notstale">Within a year</option>
        <option value="stale">Over a year ago</option>
      </select>
    </label>
    <label class="tog"><input type="checkbox" id="cw" checked> Include countywide services</label>
    <label class="f">Sort
      <select id="sort">
        <option value="recent">Recently updated</option>
        <option value="az">A to Z</option>
        <option value="near">Nearest first</option>
      </select>
    </label>
  </div>
  <div id="map" role="region" aria-label="Map of listings"></div>
</section>

<div class="summary" aria-live="polite">
  <span class="count" id="count"></span>
  <div class="freshbar" id="bar" aria-hidden="true"></div>
  <div class="fkey"><span><i style="background:var(--fresh)"></i>Under 6 months</span><span><i style="background:var(--age)"></i>6 to 12 months</span><span><i style="background:var(--stale)"></i>Over a year</span></div>
</div>

<ol class="list" id="list"><li class="empty">Loading listings...</li></ol>
</main>

<footer class="site-foot">
<div class="foot-in">
  <img class="foot-logo" src="${R}assets/img/bridge-wordmark.png" alt="Bridge" width="480" height="169">
  <p>Built by the Community Connector team at <a href="https://wearebridge.org/" target="_blank" rel="noopener">Bridge</a>. Not affiliated with or endorsed by H.A.Y. Lincolnshire. This page holds no contact details: it points you to H.A.Y. Lincolnshire, where every listing, and how to get in touch, lives. All listing content belongs to H.A.Y. Lincolnshire and its providers.</p>
  <p>"Last updated" is the date shown on the H.A.Y. listing. Whether a listing counts as in ${esc(LOT.name)} is worked out from its map location and is approximate. Distances are straight-line from the postcode. Map &copy; OpenStreetMap contributors (ODbL). Postcode locations from postcodes.io (ONS, OGL).</p>
</div>
</footer>`;
// Some H.A.Y. text arrives HTML-encoded (e.g. "&amp;"); decode once so it isn't double-escaped on render.
const dec=t=>typeof t==="string"&&t.includes("&")?(()=>{const x=document.createElement("textarea");x.innerHTML=t;return x.value})():t;
DATA.listings.forEach(o=>{o.n=dec(o.n);o.d=dec(o.d);o.loc.forEach(l=>l.a=dec(l.a))});
document.getElementById("snap").textContent=new Date(DATA.snapshot+"T00:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
const SNAP=new Date(DATA.snapshot+"T00:00:00");
const L=DATA.listings;
L.forEach((o,i)=>o.i=i);
const state={v:"",pc:null,type:"",cat:"",ls:"",fr:"",cw:true,q:"",sort:"recent"};
const days=d=>Math.round((SNAP-new Date(d+"T00:00:00"))/864e5);
const fresh=d=>{const n=days(d);return n<=182?"fresh":n<=365?"age":"stale"};
function ago(d){const n=days(d);if(n<1)return"today";if(n<31)return n+(n==1?" day":" days")+" ago";const m=Math.round(n/30.44);if(m<24)return m+(m==1?" month":" months")+" ago";return (n/365.25).toFixed(1).replace(".0","")+" years ago"}
const fmt=d=>new Date(d+"T00:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
function miles(a,b,c,d){const p=x=>x*Math.PI/180;return 2*3958.8*Math.asin(Math.sqrt(Math.sin(p(c-a)/2)**2+Math.cos(p(a))*Math.cos(p(c))*Math.sin(p(d-b)/2)**2))}
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const nameCount={};L.forEach(o=>{const k=o.n.toLowerCase().trim();nameCount[k]=(nameCount[k]||0)+1});
// Mark each location that falls inside this lot (any place circle).
L.forEach(o=>o.loc.forEach(l=>{l.in=PLACES.some(p=>miles(p.la,p.ln,l.la,l.ln)<=p.r)}));

// ---------- map
const map=window.L.map("map",{zoomControl:true,minZoom:8,maxZoom:16,zoomSnap:.25,zoomDelta:.5,wheelPxPerZoomLevel:90,preferCanvas:true,attributionControl:true,
  maxBounds:[[52.45,-1.2],[53.8,0.7]],maxBoundsViscosity:.8});
map.attributionControl.setPrefix(false).addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors');
// Base map: standard OpenStreetMap tiles (dimmed in dark mode via CSS).
// If tiles can't load (blocked network, outage), fall back to the bundled outline map in data/basemap.json.
const tiles=window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19}).addTo(map);
let tileErrs=0,fellBack=false;
tiles.on("tileerror",()=>{if(++tileErrs>=4&&!fellBack){fellBack=true;tiles.remove();loadFallbackBase()}});
async function loadFallbackBase(){
  let BASE;try{BASE=await getJSON("data/basemap.json")}catch(e){return}
  const rnd=window.L.canvas({padding:.5});
  const casing=css("--casing"),r1=css("--road1"),r2=css("--road2"),r3=css("--road3"),wat=css("--water");
  const lay={
    water:window.L.polyline(BASE.water,{renderer:rnd,color:wat,weight:1.5,interactive:false}),
    coast:window.L.polyline(BASE.coast,{renderer:rnd,color:wat,weight:2.5,interactive:false}),
    r3:window.L.polyline(BASE.roads["3"],{renderer:rnd,color:r3,weight:2,interactive:false}),
    r2c:window.L.polyline(BASE.roads["2"],{renderer:rnd,color:casing,weight:4.5,interactive:false}),
    r2:window.L.polyline(BASE.roads["2"],{renderer:rnd,color:r2,weight:2.5,interactive:false}),
    r1:window.L.polyline(BASE.roads["1"],{renderer:rnd,color:r1,weight:3.5,interactive:false})
  };
  ["water","coast","r2c","r2","r1"].forEach(k=>lay[k].addTo(map));
  const nrNames=new Set(PLACES.map(p=>p.n.toLowerCase()));
  const tiers=[[],[],[],[],[]];
  BASE.places.forEach(([n,t,la,ln])=>{
    const nr=nrNames.has(n.toLowerCase().replace(/-/g," "));
    tiers[nr?4:t].push(window.L.marker([la,ln],{interactive:false,keyboard:false,icon:window.L.divIcon({className:"",html:`<span class="plabel t${t}${nr?" nr":""}">${esc(n)}</span>`,iconSize:[0,0]})}));
  });
  const tg=tiers.map(a=>window.L.layerGroup(a));
  function zoomLayers(){const z=map.getZoom();
    (z>=11?lay.r3.addTo(map):lay.r3.remove());
    tg[0].addTo(map);(z>=9?tg[1].addTo(map):tg[1].remove());(z>=11?tg[2].addTo(map):tg[2].remove());(z>=13?tg[3].addTo(map):tg[3].remove());(z>=9.5?tg[4].addTo(map):tg[4].remove())}
  map.on("zoomend",zoomLayers);zoomLayers();
}
const markers=window.L.layerGroup().addTo(map);let ring=null,pin=null;
const NRB=PLACES.reduce((b,p)=>b.extend(window.L.latLng(p.la,p.ln).toBounds(p.r*2*1609.34)),window.L.latLngBounds([])).pad(.05);
map.fitBounds(NRB);

function chipsState(){}


// ---------- category tree (data/categories.json): max 7 choices per level, empty ones hidden
const NODES={};const leafOf={};
(function build(n,id,parent){n.id=id;n.parent=parent;NODES[id]=n;n.set=new Set();
  if(n.children){if(n.children.length>7)console.warn("More than 7 choices under",n.name||"top level");
    n.children.forEach((c,i)=>{build(c,id===""?String(i):id+"/"+i,n);c.set.forEach(x=>n.set.add(x))})}
  else(n.hay||[]).forEach(x=>{n.set.add(x);(leafOf[x]=leafOf[x]||[]).push(n.name)})})(TAX,"",null);
TAX.name="All categories";
// Any H.A.Y. category not yet placed in the tree lands in "Other" (shown only when it has listings) until categories.json is updated.
{const unm=[...new Set(L.flatMap(o=>o.cat))].filter(x=>!leafOf[x]).sort();
 if(unm.length){console.warn("H.A.Y. categories not in data/categories.json:",unm);
  const oth={name:"Other",hay:unm,set:new Set(unm),id:String(TAX.children.length),parent:TAX};
  TAX.children.push(oth);NODES[oth.id]=oth;unm.forEach(x=>{TAX.set.add(x);(leafOf[x]=leafOf[x]||[]).push(x)})}}
const inNode=(o,n)=>!n||n.id===""||o.cat.some(c=>n.set.has(c));
const catNames=o=>[...new Set(o.cat.flatMap(c=>leafOf[c]||[c]))];
function setCat(id){state.cat=id;render()}
function drawCats(base){
  const cur=NODES[state.cat]||TAX, browse=cur.children?cur:cur.parent;
  const count=n=>base.reduce((k,r)=>k+(inNode(r.o,n)?1:0),0);
  const path=[];for(let n=browse;n;n=n.parent)path.unshift(n);
  document.getElementById("crumbs").innerHTML=path.length>1||cur!==TAX?path.map((n,i)=>{const last=i===path.length-1&&cur===browse;
    return last?`<span aria-current="true">${esc(n.name)}</span>`:`<button type="button" data-c="${n.id}">${esc(n.name)}</button>`}).join('<span class="sep" aria-hidden="true">/</span>'):"";
  const kids=browse.children.map(n=>({n,c:count(n)})).filter(x=>x.c>0||x.n.id===state.cat);
  document.getElementById("catchips").innerHTML=kids.length?kids.map(({n,c})=>`<button type="button" class="chip${n.children?" grp":""}" data-c="${n.id}" aria-pressed="${n.id===state.cat}">${esc(n.name)} <small>${c}</small>${n.children?'<span class="more" aria-hidden="true">&rsaquo;</span>':""}</button>`).join(""):`<span class="none">No categories match the other filters.</span>`;
  document.querySelectorAll("#crumbs button,#catchips button").forEach(b=>b.onclick=()=>setCat(b.dataset.c));
}

// ---------- postcode
const pcIn=document.getElementById("pc"),pcMsg=document.getElementById("pcmsg");
// Live lookup via postcodes.io (any UK postcode or district), falling back to the bundled Lincolnshire table.
let PCF=null;
async function lookup(raw){
  const r=raw.toUpperCase().trim().replace(/\s+/g," "),p=r.replace(/[^A-Z0-9]/g,"");
  const full=/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(p), dist=/^[A-Z]{1,2}\d[A-Z\d]?$/.test(p);
  if(full||dist){
    try{
      const res=await fetch(full?`https://api.postcodes.io/postcodes/${p}`:`https://api.postcodes.io/outcodes/${p}`,{signal:AbortSignal.timeout?AbortSignal.timeout(5000):undefined});
      if(res.status===404){if(full)return{err:`We couldn't find that postcode. Check it, or try just the first half (for example ${EXOUT}).`};}
      else if(res.ok){const j=(await res.json()).result;
        if(j&&j.latitude!=null)return{ll:[j.latitude,j.longitude],level:full?"postcode":"district",label:full?(j.postcode||r):(j.outcode||p)};}
    }catch(e){/* offline or blocked: use bundled table */}
  }
  if(!PCF){try{PCF=await getJSON("data/postcodes.json")}catch(e){PCF={}}}
  return lookupLocal(raw);
}
function lookupLocal(raw){const r=raw.toUpperCase().trim().replace(/\s+/g," ");const p=r.replace(/[^A-Z0-9]/g,"");
  const OUT=/^[A-Z]{1,2}\d[A-Z\d]?$/;
  let out,inw="";
  if(/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(p)){out=p.slice(0,-3);inw=p.slice(-3)}
  else if(r.includes(" ")){[out,inw]=r.split(" ");if(!OUT.test(out)||!/^\d[A-Z]{0,2}$/.test(inw))out=null}
  else if(OUT.test(p))out=p;
  if(!out)return{err:`That doesn't look like a UK postcode. Try something like ${EX} or ${EXOUT}.`};
  if(inw.length===3&&PCF&&PCF[out+inw])return{ll:PCF[out+inw],level:"postcode",label:out+" "+inw};
  if(inw&&PCS.s[out+" "+inw[0]])return{ll:PCS.s[out+" "+inw[0]],level:inw.length===3?"sector":"exact-sector",label:(out+" "+inw).trim()};
  if(PCS.d[out])return{ll:PCS.d[out],level:"district",label:out};
  return{err:`We couldn't find that postcode. Check it, or try just the first half (for example ${EXOUT}).`}}
async function runPc(){pcMsg.className="msg";pcMsg.textContent="Looking up postcode...";const r=await lookup(pcIn.value);
  if(r.err){pcMsg.textContent=r.err+(state.pc?" Still showing results for "+state.pc.label+".":"");pcMsg.className="msg err";return}
  state.pc={ll:r.ll,label:r.label,level:r.level};state.v="";chipsState();
  if(state.sort==="recent"){state.sort="near";document.getElementById("sort").value="near"}
  pcMsg.className="msg";pcMsg.textContent=`Showing listings within ${radius()} of ${r.label}`+(r.level==="postcode"?".":r.level==="sector"?" (located to the postcode sector, so accurate to about a mile).":r.level==="exact-sector"?" (centre of that postcode sector).":" (centre of that postcode district, so treat distances as rough).");
  document.getElementById("pcclear").hidden=false;
  drawRing(true);render()}
function radius(){const m=+document.getElementById("rad").value;return m+(m===1?" mile":" miles")}
function drawRing(fit){if(ring){ring.remove();ring=null}if(pin){pin.remove();pin=null}if(!state.pc)return;
  const m=+document.getElementById("rad").value;
  ring=window.L.circle(state.pc.ll,{radius:m*1609.34,color:css("--ink"),weight:1.5,dashArray:"5 5",fill:true,fillOpacity:.05,interactive:false}).addTo(map);
  pin=window.L.circleMarker(state.pc.ll,{radius:6,color:css("--surface"),weight:2,fillColor:css("--ink"),fillOpacity:1,interactive:false}).addTo(map);
  if(fit)map.fitBounds(ring.getBounds(),{padding:[10,10]})}
function clearPc(silent){state.pc=null;pcMsg.textContent="";document.getElementById("pcclear").hidden=true;drawRing(false);
  if(state.sort==="near"&&!state.v){state.sort="recent";document.getElementById("sort").value="recent"}
  if(!silent){pcIn.value="";chipsState();map.fitBounds(NRB);render()}}
document.getElementById("pcgo").addEventListener("click",runPc);
pcIn.addEventListener("keydown",e=>{if(e.key==="Enter")runPc()});
document.getElementById("pcclear").addEventListener("click",()=>{clearPc(false)});
document.getElementById("rad").addEventListener("change",()=>{if(state.pc){runPc()}});

// ---------- filters
function fill(id,vals){const s=document.getElementById(id);[...new Set(vals)].sort().forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;s.appendChild(o)})}
fill("ls",L.flatMap(o=>o.ls));
document.getElementById("type").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;state.type=b.dataset.v;document.querySelectorAll("#type button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));render()});
["ls","fr"].forEach(k=>document.getElementById(k).addEventListener("change",e=>{state[k]=e.target.value;render()}));
document.getElementById("sort").addEventListener("change",e=>{state.sort=e.target.value;
  if(state.sort==="near"&&!state.pc&&!state.v){pcMsg.className="msg err";pcMsg.textContent="Enter a postcode first, then sort by nearest.";e.target.value=state.sort="recent"}render()});
document.getElementById("cw").addEventListener("change",e=>{state.cw=e.target.checked;render()});
document.getElementById("q").addEventListener("keydown",e=>{if(e.key==="Enter"&&pcIn.value.trim())runPc()});
document.getElementById("q").addEventListener("input",e=>{state.q=e.target.value.trim().toLowerCase();render()});

// ---------- core
function locsFor(o){ // locations that are "in scope" for the current place filter
  if(state.pc){const m=+document.getElementById("rad").value;return o.loc.map(l=>({l,d:miles(state.pc.ll[0],state.pc.ll[1],l.la,l.ln)})).filter(x=>x.d<=m)}
  return o.loc.filter(l=>l.in).map(l=>({l,d:null}))}
function render(){
  const rows=[];
  L.forEach(o=>{
    let ls=locsFor(o);
    if(!ls.length){ if(!(o.cw&&state.cw))return; }
    if(state.type&&o.t!==state.type)return;
    if(state.ls&&!o.ls.includes(state.ls))return;
    const f=fresh(o.m);
    if(state.fr==="fresh"&&f!=="fresh")return;
    if(state.fr==="notstale"&&f==="stale")return;
    if(state.fr==="stale"&&f!=="stale")return;
    if(state.q){const hay=(o.n+" "+o.d+" "+o.cat.join(" ")+" "+o.loc.map(l=>l.a).join(" ")).toLowerCase();if(!state.q.split(/\s+/).every(w=>hay.includes(w)))return}
    const dmin=ls.length&&ls[0].d!=null?Math.min(...ls.map(x=>x.d)):null;
    rows.push({o,ls,dmin,local:ls.length>0});
  });
  if(state.sort==="az")rows.sort((a,b)=>a.o.n.localeCompare(b.o.n));
  else if(state.sort==="near")rows.sort((a,b)=>(b.local-a.local)||((a.dmin??999)-(b.dmin??999))||b.o.m.localeCompare(a.o.m));
  else rows.sort((a,b)=>(b.local-a.local)||b.o.m.localeCompare(a.o.m));
  drawCats(rows);
  {const cn=NODES[state.cat];if(cn&&cn!==TAX){const keep=rows.filter(r=>inNode(r.o,cn));rows.length=0;rows.push(...keep)}}
  // summary
  const n={fresh:0,age:0,stale:0};rows.forEach(r=>n[fresh(r.o.m)]++);const t=rows.length||1;
  const loc=rows.filter(r=>r.local).length;
  document.getElementById("count").textContent=rows.length+(rows.length===1?" listing":" listings")+(rows.length-loc?` (${rows.length-loc} countywide)`:"");
  document.getElementById("bar").innerHTML=`<span style="width:${n.fresh/t*100}%;background:var(--fresh)"></span><span style="width:${n.age/t*100}%;background:var(--age)"></span><span style="width:${n.stale/t*100}%;background:var(--stale)"></span>`;
  // markers, grouped by location
  markers.clearLayers();const groups={};
  rows.forEach(r=>r.ls.forEach(x=>{const k=x.l.la.toFixed(4)+","+x.l.ln.toFixed(4);(groups[k]=groups[k]||{l:x.l,items:[]}).items.push(r.o)}));
  const col={fresh:css("--fresh"),age:css("--age"),stale:css("--stale")};
  Object.values(groups).forEach(g=>{
    const best=g.items.map(o=>fresh(o.m)).sort((a,b)=>["fresh","age","stale"].indexOf(a)-["fresh","age","stale"].indexOf(b))[0];
    const m=window.L.circleMarker([g.l.la,g.l.ln],{radius:Math.min(6+g.items.length*1.5,13),color:css("--surface"),weight:2,fillColor:col[best],fillOpacity:.95});
    m.bindPopup(`<div class="pop"><p class="addr">${esc(g.l.a.replace(/,?\s*(United Kingdom|UK)$/i,""))}</p><ul>`+g.items.map(o=>`<li><i style="background:${col[fresh(o.m)]}"></i><button type="button" data-i="${o.i}">${esc(o.n)}</button></li>`).join("")+`</ul></div>`,{maxWidth:260});
    markers.addLayer(m)});
  // list
  const list=document.getElementById("list");
  if(!rows.length){list.innerHTML=`<li class="empty">No listings match these filters${state.pc?" within "+radius():""}.<br><button type="button" id="reset">Clear all filters</button></li>`;document.getElementById("reset").onclick=resetAll;return}
  list.innerHTML=rows.map(({o,ls,dmin,local})=>{const f=fresh(o.m);
    const first=ls[0]?ls[0].l:null;
    const where=!local?"Countywide service":esc(first.a.replace(/,?\s*(United Kingdom|UK)$/i,""))+(ls.length>1?` and ${ls.length-1} more nearby location${ls.length>2?"s":""}`:"")+(dmin!=null&&(state.pc||state.v)?` (${dmin<0.1?"under 0.1":dmin.toFixed(1)} miles)`:"");
    const dup=nameCount[o.n.toLowerCase().trim()]>1?`<span class="tag dup">Listed more than once on H.A.Y.</span>`:"";
    return `<li class="item ${f}" id="l-${o.i}" tabindex="-1"><div class="ihead"><h3><a href="${esc(o.u)}" target="_blank" rel="noopener">${esc(o.n)}</a></h3><span class="badge ${f}" title="Last updated ${fmt(o.m)}">Updated ${ago(o.m)}</span></div>
      <p class="where">${local?o.t+" in "+where:(o.t==="Activity"?"Countywide activity":"Countywide support")}</p>
      ${o.d?`<p class="desc">${esc(o.d)}</p>`:""}
      <div class="tags">${catNames(o).map(c=>`<span class="tag">${esc(c)}</span>`).join("")}${dup}</div>
      <div class="acts"><a href="${esc(o.u)}" target="_blank" rel="noopener">Times, contact details and more on H.A.Y.<span class="sr"> (opens H.A.Y. Lincolnshire)</span></a></div></li>`}).join("");
}
map.on("popupopen",e=>{e.popup.getElement().querySelectorAll("button[data-i]").forEach(b=>b.addEventListener("click",()=>{
  const el=document.getElementById("l-"+b.dataset.i);if(!el)return;map.closePopup();el.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});
  el.classList.add("flash");el.focus({preventScroll:true});setTimeout(()=>el.classList.remove("flash"),1600)}))});
function resetAll(){Object.assign(state,{type:"",cat:"",ls:"",fr:"",cw:true,q:""});
  ["ls","fr"].forEach(i=>document.getElementById(i).value="");document.getElementById("q").value="";document.getElementById("cw").checked=true;
  document.querySelectorAll("#type button").forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.v==="")));render()}
render();

})();

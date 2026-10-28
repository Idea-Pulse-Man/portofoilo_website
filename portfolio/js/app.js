/* Headland portfolio: content first, then behaviour. Edit LINKS, EMAIL, SECTIONS and PROJECTS; see README.md.
   Everything marked PLACEHOLDER is example content. */
(function(){
"use strict";

/* ---- Your links. A pill with an empty value stays visible but goes nowhere (its tooltip says so). ---- */
var LINKS={
  github:"https://github.com/Idea-Pulse-Man",
  linkedin:"",   // PLACEHOLDER
  dribbble:"",   // PLACEHOLDER
  x:"",          // PLACEHOLDER
  book:"",       // a booking page, e.g. https://cal.com/you/15min
  resume:""      // a PDF next to index.html, e.g. "resume.pdf"
};
var EMAIL="hello@your-domain.com";   // PLACEHOLDER
var REPO="https://github.com/Idea-Pulse-Man/portofoilo_website";

/* ---- Shelves of work, in page order. layout: "cards" (cover on top) or "compact" (thumbnail beside the text);
   cols: cards across on a wide screen (4 or 3). ---- */
var SECTIONS=[
 {id:"products",title:"Products and open source",note:"Tools I design, build and maintain, most of them in the open.",layout:"cards",cols:4,unit:"projects"},
 {id:"clients",title:"Client work",note:"Selected projects from Idea Pulse, the studio I run.",layout:"cards",cols:3,unit:"projects"},
 {id:"lab",title:"Experiments",note:"Smaller pieces from this repository: two sites, a template and a background.",layout:"compact",unit:"pieces"}
];
/* ---- Projects. Each cover is drawn in code by the painter of the same id in COVERS below, so there are no image
   files; url and repo are optional and show as icons; meta is a short quiet line under the name. ---- */
var PROJECTS=[
 // PLACEHOLDER products: replace with your own
 {section:"products",id:"pulseui",name:"Pulse UI",text:"A React component kit with motion built in: spring transitions, reduced-motion fallbacks and a theme you can read in one file.",tags:["web","product","motion","oss"]},
 {section:"products",id:"beacon",name:"Beacon",text:"Privacy-first analytics for small sites. One script, no cookies, and a dashboard that fits on one screen.",tags:["web","data","oss"]},
 {section:"products",id:"facet",name:"Facet",text:"A drop-in 3D model viewer for product pages: orbit, hotspots and notes, with a poster image while the model loads.",tags:["3d","web","commerce","oss"]},
 {section:"products",id:"tidewatch",name:"Tidewatch",text:"Uptime checks and a status page in one: ninety days of history per service, and alerts that wait before they wake you.",tags:["web","data"]},
 // PLACEHOLDER client work: the fictional case studies from the Idea Pulse site
 {section:"clients",id:"lumen",name:"Lumen Bank",meta:"Fintech app · 2026",text:"A mobile bank that makes saving feel like progress: a new brand, calmer navigation and a 3D goal that grows as you save.",tags:["product","brand","3d"]},
 {section:"clients",id:"aurora",name:"Aurora Skincare",meta:"E-commerce · 2026",text:"A Shopify store as calm and clear as the products on its shelves.",tags:["commerce","web","brand"]},
 {section:"clients",id:"nordwind",name:"Nordwind Coffee",meta:"Brand identity · 2025",text:"A roastery brand with the warmth of a cup and the edge of a northern wind.",tags:["brand"]},
 {section:"clients",id:"arena",name:"Pulse Arena",meta:"Esports platform · 2025",text:"A tournament platform that feels as fast as the games it hosts.",tags:["product","web","data"]},
 {section:"clients",id:"atlas",name:"Atlas Realty",meta:"Website · 2025",text:"A property website that sells the neighbourhood, not just the floor plan.",tags:["web"]},
 {section:"clients",id:"monolith",name:"Monolith Audio",meta:"3D and motion · 2024",text:"Launch films and 3D renders for a speaker carved from a single block.",tags:["3d","motion","brand"]},
 // the pieces in this repository
 {section:"lab",id:"headland",name:"Headland",text:"This site. A lighthouse on a headland in three.js: cliffs pulled up from a height field and dressed in photo-scanned rock, and a shader sea with surf on every stone.",tags:["3d","web","motion"],repo:REPO},
 {section:"lab",id:"ideapulse",name:"Idea Pulse",text:"The studio's site: Next.js and React Three Fiber, an intro, a pinned work gallery and a page for every case study.",tags:["web","3d","motion"],repo:REPO},
 {section:"lab",id:"animline",name:"animation-line",text:"White pentagons drifting over a blue gradient, joined by thin lines when they meet. Click to add more.",tags:["motion","web","oss"],repo:REPO},
 {section:"lab",id:"jack",name:"Jack",text:"A one-page portfolio template in plain HTML, CSS and JavaScript, with a dark and a light theme.",tags:["web","oss"],url:"../index.html",repo:REPO}
];
/* ---- Filters: one chip per tag, each with its icon (the t-* symbols in index.html). "all" shows everything. ---- */
var FILTERS=[["all","All"],["web","Web"],["3d","3D"],["product","Product"],["brand","Brand"],["commerce","E-commerce"],["data","Data"],["motion","Motion"],["oss","Open source"]];

var root=document.documentElement,TAU=Math.PI*2,mm=window.matchMedia;
var reduce=!!(mm&&mm("(prefers-reduced-motion:reduce)").matches);
function rng(seed){return function(){seed=(seed+0x6D2B79F5)|0;var t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
var hero=document.querySelector(".hero3d"),h1=hero.querySelector("h1"),GL=null,BIRDS=null;

/* ================= Links ================= */
/* the hero pills are buttons, so hovering them shows no URL in the status bar; they open their page in a new tab */
Object.keys(LINKS).forEach(function(k){[].forEach.call(document.querySelectorAll('[data-link="'+k+'"]'),function(a){
  if(!LINKS[k]){a.title="Add this link in LINKS at the top of js/app.js";if(a.tagName==="A"&&!a.getAttribute("href"))a.setAttribute("href","#");
    a.addEventListener("click",function(e){e.preventDefault();});return;}
  if(a.tagName==="BUTTON")a.addEventListener("click",function(){window.open(LINKS[k],"_blank","noopener");});
  else{a.href=LINKS[k];if(/^https?:/.test(LINKS[k])){a.target="_blank";a.rel="noopener";}}});});
[].forEach.call(document.querySelectorAll("[data-email]"),function(a){a.href="mailto:"+EMAIL;a.title=EMAIL;if(a.textContent.indexOf("@")>-1)a.textContent=EMAIL;});

/* ================= Day and night =================
   The hour is the theme: day is golden hour, night lights the lamp. The button, a click on the lighthouse and the
   system setting all go through here; a choice made on the page is remembered (gate.js restores it). */
var tbtn=document.getElementById("theme"),meta=document.querySelector('meta[name="theme-color"]');
function isDark(){var t=root.getAttribute("data-theme");if(t)return t==="dark";return !!(mm&&mm("(prefers-color-scheme:dark)").matches);}
function syncTheme(){var d=isDark(),l=d?"Put out the lamp (switch to day)":"Light the lamp (switch to night)";
  tbtn.setAttribute("data-night",String(d));tbtn.setAttribute("aria-label",l);tbtn.title=l;if(meta)meta.setAttribute("content",d?"#060A20":"#0D1430");}
function setHour(dark){root.setAttribute("data-theme",dark?"dark":"light");try{localStorage.setItem("theme",dark?"dark":"light");}catch(e){}
  syncTheme();if(GL)GL.setNight(dark);if(BIRDS)BIRDS.hour(dark);}
function toggleHour(){setHour(!isDark());}
tbtn.addEventListener("click",toggleHour);
if(mm)mm("(prefers-color-scheme:dark)").addEventListener("change",function(){if(root.getAttribute("data-theme"))return;syncTheme();if(GL)GL.setNight(isDark());if(BIRDS)BIRDS.hour(isDark());});
syncTheme();

/* ================= Résumé =================
   The Résumé pill opens the sheet in place (and /#resume opens it on load); Escape or the close button shuts it. */
(function(){
  var sec=document.getElementById("resume"),btn=document.getElementById("resume-toggle"),title=document.getElementById("resume-title");
  [].forEach.call(sec.querySelectorAll(".sheet-top,.sheet-head,.post,.sheet-list li,.skills li"),function(el,i){el.classList.add("cascade");el.style.setProperty("--i",i);});
  function isOpen(){return sec.classList.contains("open");}
  function setOpen(open,focus){
    sec.classList.toggle("open",open);if(open)sec.removeAttribute("inert");else sec.setAttribute("inert","");btn.setAttribute("aria-expanded",String(open));
    try{history.replaceState(null,"",open?"#resume":location.pathname+location.search);}catch(e){}
    if(!focus)return;
    if(open)setTimeout(function(){title.focus({preventScroll:true});sec.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});},reduce?0:160);
    else btn.focus({preventScroll:true});}
  btn.addEventListener("click",function(){setOpen(!isOpen(),true);});
  sec.querySelector(".sheet-close").addEventListener("click",function(){setOpen(false,true);});
  addEventListener("keydown",function(e){if(e.key==="Escape"&&isOpen())setOpen(false,true);});
  if(location.hash==="#resume")setOpen(true,true);
  // each employer opens to what was done there
  [].forEach.call(sec.querySelectorAll("button.post-head"),function(b){b.addEventListener("click",function(){var o=b.getAttribute("aria-expanded")!=="true";
    b.setAttribute("aria-expanded",String(o));document.getElementById(b.getAttribute("aria-controls")).classList.toggle("open",o);});});
})();

/* ================= The name: one inline-block per letter, so the birds can stand on them ================= */
(function(){var txt=h1.textContent.trim(),n=0;h1.setAttribute("aria-label",txt);
  h1.innerHTML=txt.split(/\s+/).map(function(w){return'<span class="word" aria-hidden="true">'+Array.from(w).map(function(c){return'<span class="ltr" style="--i:'+(n++)+'">'+esc(c)+'</span>';}).join("")+'</span>';}).join(" ");})();

/* ================= Project covers, drawn in code ================= */
var CW=960,CH=540,F="'Hanken Grotesk',sans-serif";
function font(w,s){return w+" "+s+"px "+F;}
function G(r){return r()+r()+r()+r()-2;}
function bgfill(c,a,b){var g=c.createLinearGradient(0,0,CW,CH);g.addColorStop(0,a);g.addColorStop(1,b);c.fillStyle=g;c.fillRect(0,0,CW,CH);}
function glow(c,x,y,r,col){var g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function panel(c,x,y,w,h,r){rr(c,x,y,w,h,r);c.fillStyle="rgba(255,255,255,.045)";c.fill();c.strokeStyle="rgba(255,255,255,.1)";c.lineWidth=1.5;c.stroke();}
function text(c,s,x,y,w,size,col,align){c.font=font(w,size);c.fillStyle=col;c.textAlign=align||"left";c.fillText(s,x,y);c.textAlign="left";}
function spaced(c,s,x,y,sp){var ws=Array.from(s).map(function(ch){return c.measureText(ch).width;}),tot=ws.reduce(function(a,b){return a+b;},0)+sp*(ws.length-1),px=x-tot/2;
  Array.from(s).forEach(function(ch,i){c.fillText(ch,px,y);px+=ws[i]+sp;});}
function gem(c,x,y,s){function P(u,v){return[x+u*s,y+v*s];}
  var g=c.createLinearGradient(x-s,y-s,x+s,y+s);g.addColorStop(0,"#F6E2A4");g.addColorStop(.5,"#EBC051");g.addColorStop(1,"#3EEFD8");
  var O=[P(-.55,-.6),P(.55,-.6),P(1,-.12),P(0,1),P(-1,-.12)];
  c.beginPath();O.forEach(function(p,i){if(i)c.lineTo(p[0],p[1]);else c.moveTo(p[0],p[1]);});c.closePath();c.fillStyle="rgba(235,192,81,.1)";c.fill();c.strokeStyle=g;c.lineWidth=3;c.lineJoin="round";c.stroke();
  c.lineWidth=1.6;[[P(-1,-.12),P(1,-.12)],[P(-.55,-.6),P(-.3,-.12)],[P(.55,-.6),P(.3,-.12)],[P(0,-.6),P(-.3,-.12)],[P(0,-.6),P(.3,-.12)],[P(-.3,-.12),P(0,1)],[P(.3,-.12),P(0,1)]].forEach(function(l){c.beginPath();c.moveTo(l[0][0],l[0][1]);c.lineTo(l[1][0],l[1][1]);c.stroke();});
  glow(c,x,y-.2*s,s*1.4,"rgba(235,192,81,.12)");}
var COVERS={
 pulseui:function(c){bgfill(c,"#0E1016","#161A22");glow(c,760,90,460,"rgba(62,239,216,.10)");
  panel(c,80,80,440,380,22);text(c,"Motion",116,134,600,22,"rgba(255,255,255,.82)");
  ["Animations","Reduced motion"].forEach(function(s,i){text(c,s,116,192+i*60,500,16,"rgba(255,255,255,.4)");var x=420,y=168+i*60,on=!i;
    rr(c,x,y,64,34,17);c.fillStyle=on?"#3EEFD8":"rgba(255,255,255,.12)";c.fill();c.beginPath();c.arc(on?x+47:x+17,y+17,12,0,TAU);c.fillStyle=on?"#0E1016":"rgba(255,255,255,.7)";c.fill();});
  text(c,"Duration",116,312,500,16,"rgba(255,255,255,.4)");
  rr(c,116,330,368,6,3);c.fillStyle="rgba(255,255,255,.12)";c.fill();rr(c,116,330,240,6,3);c.fillStyle="#EBC051";c.fill();c.beginPath();c.arc(356,333,13,0,TAU);c.fillStyle="#F6EEDF";c.fill();
  rr(c,116,384,150,46,23);c.fillStyle="#F6EEDF";c.fill();text(c,"Save",191,413,600,16,"#17131d","center");
  rr(c,282,384,150,46,23);c.strokeStyle="rgba(255,255,255,.25)";c.lineWidth=1.5;c.stroke();text(c,"Cancel",357,413,500,16,"rgba(255,255,255,.75)","center");
  panel(c,560,80,320,380,22);text(c,"spring · stiffness 180 · damping 14",590,124,500,14,"rgba(255,255,255,.4)");
  c.strokeStyle="rgba(255,255,255,.07)";c.lineWidth=1;for(var i=0;i<5;i++){c.beginPath();c.moveTo(590,170+i*62);c.lineTo(850,170+i*62);c.stroke();}
  c.beginPath();for(var x=0;x<=260;x++){var t=x/260,y=1-Math.exp(-5*t)*Math.cos(14*t);c.lineTo(590+x,420-y*220);}c.strokeStyle="#3EEFD8";c.lineWidth=3;c.stroke();},
 beacon:function(c,r){bgfill(c,"#0D0F13","#14161C");glow(c,200,520,500,"rgba(235,192,81,.08)");
  [["Visitors","2,481","+12%"],["Pageviews","9,140","+8%"],["Bounce","38%","−3%"]].forEach(function(k,i){var x=70+i*280;panel(c,x,56,250,112,16);
    text(c,k[0],x+22,94,500,15,"rgba(255,255,255,.42)");text(c,k[1],x+22,140,600,32,"rgba(255,255,255,.9)");text(c,k[2],x+228,140,600,15,"#3EEFD8","right");});
  var pts=[],n=40,i;for(i=0;i<=n;i++){var v=.42+.2*Math.sin(i*.35)+.1*Math.sin(i*1.3+1)+G(r)*.035+i/n*.2;pts.push([70+i*(820/n),470-v*230]);}
  var g=c.createLinearGradient(0,220,0,470);g.addColorStop(0,"rgba(235,192,81,.34)");g.addColorStop(1,"rgba(235,192,81,0)");
  c.beginPath();c.moveTo(70,470);pts.forEach(function(p){c.lineTo(p[0],p[1]);});c.lineTo(890,470);c.closePath();c.fillStyle=g;c.fill();
  c.beginPath();pts.forEach(function(p,j){if(j)c.lineTo(p[0],p[1]);else c.moveTo(p[0],p[1]);});c.strokeStyle="#EBC051";c.lineWidth=3;c.lineJoin="round";c.stroke();
  var lp=pts[n];glow(c,lp[0],lp[1],40,"rgba(246,238,223,.35)");c.beginPath();c.arc(lp[0],lp[1],7,0,TAU);c.fillStyle="#F6EEDF";c.fill();
  c.strokeStyle="rgba(255,255,255,.1)";c.lineWidth=1;c.beginPath();c.moveTo(70,470.5);c.lineTo(890,470.5);c.stroke();},
 facet:function(c){bgfill(c,"#0C0E14","#151824");glow(c,480,250,380,"rgba(62,239,216,.12)");
  c.strokeStyle="rgba(255,255,255,.07)";c.lineWidth=1;for(var i=-10;i<=10;i++){c.beginPath();c.moveTo(480+i*22,390);c.lineTo(480+i*90,540);c.stroke();}
  for(i=0;i<7;i++){var y=390+i*i*3.2;c.beginPath();c.moveTo(0,y);c.lineTo(CW,y);c.stroke();}
  var t=(1+Math.sqrt(5))/2,V=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]];
  var FS=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  var a=.6,b=.35,P=V.map(function(v){var x=v[0]*Math.cos(a)-v[2]*Math.sin(a),z=v[0]*Math.sin(a)+v[2]*Math.cos(a),y=v[1]*Math.cos(b)-z*Math.sin(b);z=v[1]*Math.sin(b)+z*Math.cos(b);var s=112/(1+z*.08);return[480+x*s,240-y*s,z];});
  FS.map(function(f){return{f:f,z:(P[f[0]][2]+P[f[1]][2]+P[f[2]][2])/3};}).sort(function(p,q){return q.z-p.z;}).forEach(function(q){var A=P[q.f[0]],B=P[q.f[1]],C=P[q.f[2]];
    c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1]);c.lineTo(C[0],C[1]);c.closePath();c.fillStyle="rgba(62,239,216,"+(.04+.1*clamp(.5-q.z*.3,0,1))+")";c.fill();
    c.strokeStyle="rgba(255,255,255,.5)";c.lineWidth=1.4;c.lineJoin="round";c.stroke();});
  P.forEach(function(p){c.beginPath();c.arc(p[0],p[1],4,0,TAU);c.fillStyle="#EBC051";c.fill();});
  c.strokeStyle="rgba(255,255,255,.35)";c.lineWidth=1.2;c.beginPath();c.moveTo(P[8][0],P[8][1]);c.lineTo(668,150);c.stroke();
  rr(c,668,128,196,44,22);c.fillStyle="rgba(10,12,18,.82)";c.fill();c.strokeStyle="rgba(255,255,255,.16)";c.stroke();text(c,"Brushed aluminium",766,156,500,15,"rgba(255,255,255,.86)","center");},
 tidewatch:function(c,r){bgfill(c,"#0D1013","#13171B");glow(c,84,84,44,"rgba(62,239,216,.35)");c.beginPath();c.arc(84,84,9,0,TAU);c.fillStyle="#3EEFD8";c.fill();
  text(c,"All systems normal",108,93,600,24,"rgba(255,255,255,.88)");text(c,"90 days",890,93,500,15,"rgba(255,255,255,.4)","right");
  ["api","web","auth","cdn","db"].forEach(function(s,i){var y=146+i*74;text(c,s,70,y+24,500,16,"rgba(255,255,255,.55)");
    for(var d=0;d<52;d++){var v=r();rr(c,150+d*12.6,y,8,34,3);c.fillStyle=v>.975?"#E0705A":v>.94?"#EBC051":"rgba(62,239,216,.72)";c.fill();}
    text(c,(99.98-r()*.35).toFixed(2)+"%",890,y+24,500,15,"rgba(255,255,255,.42)","right");});},
 lumen:function(c,r){bgfill(c,"#0A0F26","#141C44");glow(c,690,270,380,"rgba(235,192,81,.14)");
  rr(c,150,40,250,470,36);c.fillStyle="rgba(6,9,24,.9)";c.fill();c.strokeStyle="rgba(255,255,255,.16)";c.lineWidth=2;c.stroke();
  text(c,"Holiday fund",186,110,500,15,"rgba(255,255,255,.45)");text(c,"$4,280",186,152,600,34,"rgba(255,255,255,.92)");
  c.lineWidth=14;c.lineCap="round";c.beginPath();c.arc(275,292,78,0,TAU);c.strokeStyle="rgba(255,255,255,.08)";c.stroke();
  c.beginPath();c.arc(275,292,78,-Math.PI/2,-Math.PI/2+TAU*.68);c.strokeStyle="#EBC051";c.stroke();c.lineCap="butt";text(c,"68%",275,302,600,26,"rgba(255,255,255,.88)","center");
  for(var i=0;i<6;i++){var h=18+r()*50;rr(c,190+i*30,470-h,16,h,4);c.fillStyle=i===5?"#3EEFD8":"rgba(255,255,255,.18)";c.fill();}
  gem(c,690,262,150);},
 aurora:function(c){bgfill(c,"#1A1220","#2A1828");
  [["rgba(255,150,170,.32)",250,170,360],["rgba(255,200,150,.28)",660,130,320],["rgba(190,150,255,.24)",480,300,420]].forEach(function(q){glow(c,q[1],q[2],q[3],q[0]);});
  for(var i=0;i<14;i++){c.beginPath();for(var x=0;x<=CW;x+=20){var y=170+i*7+Math.sin(x*.006+i*.4)*56+Math.sin(x*.013+i)*18;if(x)c.lineTo(x,y);else c.moveTo(x,y);}c.strokeStyle="rgba(255,222,232,"+(.05+.035*Math.sin(i))+")";c.lineWidth=8;c.stroke();}
  glow(c,480,478,330,"rgba(0,0,0,.35)");
  [[318,190,104,"#F3E6DA","#C9A27A"],[448,150,92,"#E9CFC4","#2A1828"],[566,212,80,"#F6EEDF","#C9A27A"]].forEach(function(b){var x=b[0],h=b[1],w=b[2];
    rr(c,x,470-h,w,h,20);c.fillStyle=b[3];c.fill();rr(c,x+w*.3,470-h-38,w*.4,40,7);c.fillStyle=b[4];c.fill();
    c.fillStyle="rgba(42,24,40,.55)";c.font=font(600,12);c.textAlign="center";c.fillText("AURORA",x+w/2,470-h*.45);c.textAlign="left";});},
 nordwind:function(c,r){bgfill(c,"#2B2118","#3D2E20");
  for(var i=0;i<16;i++){var x=r()*CW,y=r()*CH;if(Math.hypot(x-480,y-290)<290)continue;var s=14+r()*10;
    c.save();c.translate(x,y);c.rotate(r()*TAU);c.beginPath();c.ellipse(0,0,s,s*.66,0,0,TAU);c.fillStyle="rgba(124,80,46,.6)";c.fill();
    c.beginPath();c.moveTo(-s*.8,0);c.bezierCurveTo(-s*.3,-s*.25,s*.3,s*.25,s*.8,0);c.strokeStyle="rgba(40,26,16,.8)";c.lineWidth=2;c.stroke();c.restore();}
  c.strokeStyle="rgba(246,238,223,.88)";c.lineWidth=3;c.beginPath();c.arc(480,214,92,0,TAU);c.stroke();
  for(i=0;i<3;i++){var yy=184+i*30;c.beginPath();c.moveTo(416+i*6,yy);c.bezierCurveTo(456,yy-18,500,yy+18,546-i*14,yy-4);c.stroke();}
  c.fillStyle="rgba(246,238,223,.94)";c.font=font(600,40);spaced(c,"NORDWIND",480,392,14);
  c.fillStyle="rgba(246,238,223,.55)";c.font=font(500,15);spaced(c,"COFFEE ROASTERS",480,430,6);},
 arena:function(c){bgfill(c,"#0C0A14","#170F26");glow(c,720,270,380,"rgba(255,79,163,.13)");glow(c,240,270,380,"rgba(62,239,216,.08)");
  var N=["VEX","NOVA","KITE","ORCA","RUNE","ZEN","AXIS","LYNX"],names=[N,[N[0],N[2],N[4],N[6]],[N[2],N[4]],[N[2]]],Y=[[]],i,ci;
  for(i=0;i<8;i++)Y[0].push(62+i*59);
  for(ci=1;ci<4;ci++){Y[ci]=[];for(i=0;i<Y[ci-1].length;i+=2)Y[ci].push((Y[ci-1][i]+Y[ci-1][i+1])/2);}
  function hl(ci,j){return names[ci][j]==="KITE";}
  [false,true].forEach(function(pass){Y.forEach(function(col,ci){col.forEach(function(y,j){var x=96+ci*190,h=hl(ci,j);if(h!==pass)return;
    if(ci<3){var ny=Y[ci+1][j>>1],nx=96+(ci+1)*190;c.beginPath();c.moveTo(x+130,y);c.lineTo(x+160,y);c.lineTo(x+160,ny);c.lineTo(nx,ny);c.strokeStyle=h?"#FF4FA3":"rgba(255,255,255,.14)";c.lineWidth=1.5;c.stroke();}
    rr(c,x,y-17,130,34,8);c.fillStyle=h?"#3a1430":"#15111f";c.fill();c.strokeStyle=h?"#FF4FA3":"rgba(255,255,255,.14)";c.lineWidth=1.5;c.stroke();
    text(c,names[ci][j],x+16,y+5,600,14,h?"rgba(255,255,255,.94)":"rgba(255,255,255,.42)");});});});},
 atlas:function(c,r){bgfill(c,"#0F1416","#182226");
  c.beginPath();c.moveTo(0,430);c.bezierCurveTo(260,360,430,520,960,420);c.strokeStyle="rgba(62,150,216,.25)";c.lineWidth=30;c.stroke();
  c.save();c.translate(480,270);c.rotate(-.18);c.strokeStyle="rgba(255,255,255,.07)";c.lineWidth=10;
  for(var i=-8;i<=8;i++){c.beginPath();c.moveTo(i*80,-560);c.lineTo(i*80,560);c.stroke();c.beginPath();c.moveTo(-760,i*70);c.lineTo(760,i*70);c.stroke();}
  for(i=-7;i<7;i++)for(var j=-6;j<6;j++){if(r()<.22&&(i||j))continue;rr(c,i*80+9,j*70+9,62,52,4);
    if(!i&&!j){c.fillStyle="rgba(235,192,81,.32)";c.fill();c.strokeStyle="#EBC051";c.lineWidth=2;c.stroke();}else{c.fillStyle="rgba(255,255,255,"+(.03+r()*.05).toFixed(3)+")";c.fill();}}
  c.restore();
  var a=-.18,px=480+40*Math.cos(a)-35*Math.sin(a),py=270+40*Math.sin(a)+35*Math.cos(a);
  glow(c,px,py,70,"rgba(235,192,81,.25)");c.beginPath();c.moveTo(px,py);c.lineTo(px-14,py-30);c.arc(px,py-36,16,Math.PI*.78,Math.PI*.22);c.closePath();c.fillStyle="#EBC051";c.fill();
  c.beginPath();c.arc(px,py-36,6,0,TAU);c.fillStyle="#182226";c.fill();
  rr(c,px+28,py-80,136,44,22);c.fillStyle="rgba(10,14,16,.88)";c.fill();c.strokeStyle="rgba(255,255,255,.16)";c.lineWidth=1.5;c.stroke();text(c,"$1.24M",px+96,py-51,600,17,"#EBC051","center");},
 monolith:function(c){bgfill(c,"#09090B","#141417");
  for(var i=1;i<9;i++){c.beginPath();c.ellipse(480,392,90+i*50,(90+i*50)*.22,0,0,TAU);c.strokeStyle="rgba(235,192,81,"+(.3-i*.03).toFixed(3)+")";c.lineWidth=1.5;c.stroke();}
  glow(c,480,400,300,"rgba(235,192,81,.12)");
  var g=c.createLinearGradient(410,0,550,0);g.addColorStop(0,"#1B1B1F");g.addColorStop(.55,"#29292E");g.addColorStop(1,"#111114");rr(c,410,60,140,336,18);c.fillStyle=g;c.fill();
  var rim=c.createLinearGradient(0,60,0,396);rim.addColorStop(0,"rgba(235,192,81,0)");rim.addColorStop(.5,"rgba(235,192,81,.9)");rim.addColorStop(1,"rgba(235,192,81,.1)");
  c.strokeStyle=rim;c.lineWidth=2;c.beginPath();c.moveTo(549,82);c.lineTo(549,374);c.stroke();
  [[480,140,16],[480,290,46]].forEach(function(d){for(var k=0;k<3;k++){c.beginPath();c.arc(d[0],d[1],d[2]*(1-k*.3),0,TAU);c.strokeStyle="rgba(255,255,255,"+(.1-k*.02).toFixed(3)+")";c.lineWidth=1.5;c.stroke();}
    c.beginPath();c.arc(d[0],d[1],d[2]*.2,0,TAU);c.fillStyle="rgba(235,192,81,.5)";c.fill();});},
 headland:function(c,r){var g=c.createLinearGradient(0,0,0,CH);g.addColorStop(0,"#0D1430");g.addColorStop(.42,"#5E4E69");g.addColorStop(.6,"#C98A58");g.addColorStop(.605,"#3a3040");g.addColorStop(1,"#100f17");c.fillStyle=g;c.fillRect(0,0,CW,CH);
  glow(c,540,316,280,"rgba(255,190,120,.45)");c.beginPath();c.arc(540,312,20,0,TAU);c.fillStyle="#FFE1B0";c.fill();
  for(var i=0;i<70;i++){var y=332+Math.pow(r(),1.5)*200,k=(y-326)/200,w=4+r()*36*k;c.fillStyle="rgba(255,214,160,"+(.2+r()*.5).toFixed(2)+")";c.fillRect(540+G(r)*(8+k*80)-w/2,y,w,2);}
  c.fillStyle="#17131c";c.beginPath();c.moveTo(610,540);c.lineTo(628,372);c.bezierCurveTo(650,342,712,338,760,342);c.lineTo(960,332);c.lineTo(960,540);c.closePath();c.fill();
  c.beginPath();c.moveTo(696,346);c.lineTo(704,214);c.lineTo(720,214);c.lineTo(728,346);c.closePath();c.fill();c.fillRect(698,206,28,10);
  c.beginPath();c.moveTo(700,206);c.lineTo(712,184);c.lineTo(724,206);c.fill();
  var b=c.createLinearGradient(712,0,0,0);b.addColorStop(0,"rgba(255,226,170,.36)");b.addColorStop(1,"rgba(255,226,170,0)");c.beginPath();c.moveTo(712,198);c.lineTo(0,140);c.lineTo(0,236);c.closePath();c.fillStyle=b;c.fill();
  glow(c,712,198,56,"rgba(255,222,160,.9)");},
 ideapulse:function(c){bgfill(c,"#0A0D12","#121821");glow(c,480,250,340,"rgba(62,239,216,.1)");gem(c,480,214,118);
  var g=c.createLinearGradient(60,0,900,0);g.addColorStop(0,"rgba(235,192,81,0)");g.addColorStop(.5,"#EBC051");g.addColorStop(1,"rgba(62,239,216,0)");
  c.beginPath();c.moveTo(60,440);c.lineTo(380,440);c.lineTo(410,404);c.lineTo(445,486);c.lineTo(480,376);c.lineTo(515,462);c.lineTo(540,440);c.lineTo(900,440);c.strokeStyle=g;c.lineWidth=3;c.lineJoin="round";c.stroke();},
 animline:function(c,r){var g=c.createLinearGradient(0,0,CW,0);g.addColorStop(0,"#2B32B2");g.addColorStop(1,"#1488CC");c.fillStyle=g;c.fillRect(0,0,CW,CH);
  var P=[],i,j;for(i=0;i<46;i++)P.push([r()*CW,r()*CH]);c.strokeStyle="#fff";c.lineWidth=1.2;
  for(i=0;i<P.length;i++)for(j=i+1;j<P.length;j++){var d=Math.hypot(P[i][0]-P[j][0],P[i][1]-P[j][1]);if(d<150){c.globalAlpha=.4*(1-d/150);c.beginPath();c.moveTo(P[i][0],P[i][1]);c.lineTo(P[j][0],P[j][1]);c.stroke();}}
  c.globalAlpha=1;c.fillStyle="rgba(255,255,255,.55)";
  P.forEach(function(p){var s=4+r()*4,a0=r()*TAU;c.beginPath();for(var k=0;k<5;k++){var a=a0+k*TAU/5,x=p[0]+Math.cos(a)*s,y=p[1]+Math.sin(a)*s;if(k)c.lineTo(x,y);else c.moveTo(x,y);}c.closePath();c.fill();});},
 // (the compact rows show only the middle of a cover, about x 160 to 800, so this one keeps to it)
 jack:function(c){bgfill(c,"#1E1E1E","#2A2A2A");
  text(c,"Jack.",180,118,700,40,"#F6EEDF");["Home","About","Skills"].forEach(function(s,i){text(c,s,500+i*96,110,500,16,i?"rgba(255,255,255,.45)":"#E37D3F");});
  text(c,"We Design & Build",180,262,700,40,"#F6EEDF");text(c,"Creative Products",180,312,700,40,"#F6EEDF");
  rr(c,180,350,164,48,8);c.fillStyle="#E37D3F";c.fill();text(c,"Get in touch",262,381,600,16,"#1E1E1E","center");
  var g=c.createLinearGradient(530,170,770,410);g.addColorStop(0,"#E37D3F");g.addColorStop(1,"#F8D525");c.beginPath();c.arc(650,300,112,0,TAU);c.fillStyle=g;c.globalAlpha=.85;c.fill();c.globalAlpha=1;
  c.save();c.beginPath();c.arc(650,300,112,0,TAU);c.clip();c.fillStyle="rgba(30,30,30,.55)";c.beginPath();c.arc(650,270,38,0,TAU);c.fill();c.beginPath();c.ellipse(650,392,76,58,0,Math.PI,TAU);c.fill();c.restore();}
};

/* ================= Shelves of work, and the filters over them ================= */
var LABEL={};FILTERS.forEach(function(f){LABEL[f[0]]=f[1];});
function icon(t){return'<svg class="i" aria-hidden="true"><use href="#t-'+t+'"/></svg>';}
function ext(u){return/^https?:/.test(u)?' target="_blank" rel="noopener"':'';}
function cardLinks(p){var s="";
  if(p.repo)s+='<a href="'+esc(p.repo)+'" target="_blank" rel="noopener" aria-label="'+esc(p.name)+' source on GitHub"><svg class="i"><use href="#i-gh"/></svg></a>';
  if(p.url)s+='<a href="'+esc(p.url)+'"'+ext(p.url)+' aria-label="Open '+esc(p.name)+'"><svg class="i"><use href="#i-out"/></svg></a>';return s;}
function tagList(p){return'<div class="tags">'+p.tags.map(function(t){return'<span class="tag" title="'+LABEL[t]+'">'+icon(t)+'<span class="tag-label">'+LABEL[t]+'</span></span>';}).join("")+'</div>';}
function art(p,cls){var cv='<canvas width="'+CW+'" height="'+CH+'"></canvas>',h=p.url||p.repo;
  return h?'<a class="'+cls+'" href="'+esc(h)+'"'+ext(h)+' tabindex="-1" aria-hidden="true">'+cv+'</a>':'<div class="'+cls+'" aria-hidden="true">'+cv+'</div>';}
function head(p){return'<div class="card-head"><h3>'+esc(p.name)+'</h3><div class="card-links">'+cardLinks(p)+'</div></div>';}
var RENDER={
  cards:function(p){return art(p,"cover")+'<div class="card-body">'+head(p)+(p.meta?'<span class="meta">'+esc(p.meta)+'</span>':'')+'<p>'+esc(p.text)+'</p>'+tagList(p)+'</div>';},
  compact:function(p){return art(p,"thumb")+'<div class="card-body">'+head(p)+'<p>'+esc(p.text)+'</p>'+tagList(p)+'</div>';}
};
var shelves=document.getElementById("shelves"),bar=document.getElementById("filters"),shown=[],paint=[];
SECTIONS.forEach(function(s){
  var items=PROJECTS.filter(function(p){return p.section===s.id;});if(!items.length)return;
  var sec=document.createElement("section");sec.className="shelf shelf-"+s.layout;sec.id=s.id;sec.setAttribute("aria-labelledby",s.id+"-title");
  sec.innerHTML='<div class="shelf-head"><h2 id="'+s.id+'-title">'+esc(s.title)+'</h2><span class="count"></span>'+(s.note?'<p>'+esc(s.note)+'</p>':'')+'</div><div class="grid'+(s.cols===3?' cols-3':'')+'"></div>';
  var grid=sec.querySelector(".grid"),cards=[];
  items.forEach(function(p){var el=document.createElement("article");el.className="card glass l-"+s.layout;el.innerHTML=RENDER[s.layout](p);grid.appendChild(el);
    cards.push({el:el,tags:p.tags});var cv=el.querySelector("canvas");if(cv&&COVERS[p.id])paint.push([cv,p.id]);});
  shelves.appendChild(sec);shown.push({sec:sec,cards:cards,unit:s.unit,count:sec.querySelector(".count")});
});
/* a filter hides the cards without its tag, and any shelf left empty; each head counts what is left ("2 of 6") */
var note=document.createElement("p");note.className="filter-note";note.setAttribute("aria-live","polite");
function apply(f){var n=0,all=0;
  shown.forEach(function(x){var c=0;x.cards.forEach(function(k){var on=f==="all"||k.tags.indexOf(f)>-1;k.el.hidden=!on;if(on)c++;});
    x.sec.hidden=!c;x.count.textContent=f==="all"?c+" "+x.unit:c+" of "+x.cards.length;n+=c;all+=x.cards.length;});
  note.textContent=f==="all"?"Showing all "+all+" projects":"Showing "+n+" of "+all+" projects";
  [].forEach.call(bar.querySelectorAll(".chip"),function(b){b.setAttribute("aria-pressed",b.dataset.filter===f?"true":"false");});}
FILTERS.forEach(function(f){var b=document.createElement("button");b.type="button";b.className="chip";b.dataset.filter=f[0];
  b.innerHTML=icon(f[0])+esc(f[1]);b.addEventListener("click",function(){apply(f[0]);});bar.appendChild(b);});
bar.appendChild(note);apply("all");
// covers wait for the webfont, so their labels are drawn in it
var painted=false;
function paintCovers(){if(painted)return;painted=true;paint.forEach(function(q,i){var c=q[0].getContext("2d");try{COVERS[q[1]](c,rng(101+i*17));}catch(e){console.error(e);}});}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(paintCovers);
setTimeout(paintCovers,1500);

/* ================= The twin: the first visit opens on the headland being built =================
   gate.js decides in <head> whether this visit plays it, so the void is up before the first paint. This part owns
   the log and the skip; every line in the log is a real build step in scene.js, timed as it runs. */
var TWIN=(function(){
  if(!root.classList.contains("twin-run"))return null;
  var t0=performance.now(),rows={},el=document.createElement("div"),skipped=false,ended=false,swallow=0,INTENT=["pointerdown","keydown","wheel","touchmove"];
  el.className="twin";el.setAttribute("aria-hidden","true");
  el.innerHTML='<div class="twin-log"><div class="twin-head"><span>Headland · digital twin</span><span>sync <b>0%</b></span></div><i class="twin-bar"><i></i></i><ol></ol></div><p class="twin-skip">Any key skips</p>';
  document.body.appendChild(el);
  var list=el.querySelector("ol"),pct=el.querySelector(".twin-head b"),fill=el.querySelector(".twin-bar i");
  // any intent to use the page skips ahead; the click that skips does not also reach the page
  function skip(e){skipped=true;if(e.type==="pointerdown")swallow=performance.now();}
  function eat(e){if(swallow&&performance.now()-swallow<800){swallow=0;e.stopPropagation();e.preventDefault();}}
  INTENT.forEach(function(n){addEventListener(n,skip,{capture:true,passive:true});});addEventListener("click",eat,true);
  return{
    line:function(key,agent,txt,ok){var r=rows[key];
      if(!r){r=rows[key]=document.createElement("li");r.innerHTML="<time></time><b></b><span></span>";r.children[0].textContent=((performance.now()-t0)/1000).toFixed(2);r.children[1].textContent=agent;list.appendChild(r);}
      r.children[2].textContent=txt;r.classList.toggle("ok",!!ok);},
    sync:function(p){var s=Math.round(p*100)+"%";if(pct.textContent!==s){pct.textContent=s;fill.style.transform="scaleX("+p.toFixed(3)+")";}},
    skipped:function(){return skipped;},
    live:function(){root.classList.remove("twin-pre");el.classList.add("live");},
    end:function(){if(ended)return;ended=true;
      INTENT.forEach(function(n){removeEventListener(n,skip,{capture:true});});setTimeout(function(){removeEventListener("click",eat,true);},900);
      try{sessionStorage.setItem("twin","1");}catch(e){}
      root.classList.remove("twin-run","twin-pre");root.classList.add("twin-type");el.classList.add("out");
      setTimeout(function(){el.remove();},900);setTimeout(function(){root.classList.remove("twin-type");},4200);}
  };
})();

/* ================= The scene =================
   On desktop the headland is a fixed layer behind the whole page: #gl and its light leave the hero, and a veil
   (blurred, darker) deepens as you scroll. Touch screens keep the scene in the hero, where it scrolls away. */
var FIXED=!!(mm&&mm("(hover:hover) and (pointer:fine) and (min-width:761px)").matches),host=document.getElementById("gl"),fxEl=hero.querySelector(".fx"),veil=null;
function heroReady(){hero.classList.add("ready");if(BIRDS)BIRDS.start();}
if(window.THREE&&window.Lighthouse){
  if(FIXED){veil=document.createElement("div");veil.className="veil";veil.setAttribute("aria-hidden","true");
    document.querySelector(".bg").after(host,fxEl,veil);host.classList.add("fixed");fxEl.classList.add("fixed");root.classList.add("scene-fixed");}
  try{GL=Lighthouse.init({host:host,hero:hero,flare:document.getElementById("flare"),rays:document.getElementById("rays"),night:isDark(),reduce:reduce,fixed:FIXED,twin:TWIN,
    onReady:heroReady,onHot:function(on){root.classList.toggle("scene-hot",on);},onToggle:toggleHour});}catch(e){console.error(e);GL=null;}
}
if(!GL){if(TWIN)TWIN.end();heroReady();}
/* the veil follows the scroll: clear over the hero, full by the time the work is in view */
if(veil)(function(){var queued=false;
  function sink(){queued=false;var v=clamp((scrollY-hero.offsetHeight*.25)/(innerHeight*.8),0,1);veil.style.opacity=(v*v*(3-2*v)).toFixed(3);}
  addEventListener("scroll",function(){if(!queued){queued=true;requestAnimationFrame(sink);}},{passive:true});addEventListener("resize",sink);sink();})();

/* ================= Three birds who like the name =================
   They land on the tops of the letters, hop about, peck and turn round, and take off when the pointer comes close.
   At night they leave; by day they come back. Perches are found by drawing each letter and finding its ink. */
BIRDS=(function(){
  var cv=document.getElementById("birds");if(!cv||!cv.getContext)return null;
  var ctx=cv.getContext("2d"),r=rng(31),W=0,H=0,dpr=1,L=7,perch=[],birds=[],raf=0,last=0,on=false,night=isDark(),visible=true,ptr={x:-1e4,y:-1e4};
  var ltrs=[].slice.call(h1.querySelectorAll(".ltr")),probe=document.createElement("canvas"),px=probe.getContext("2d",{willReadFrequently:true});
  function measure(){
    var hr=hero.getBoundingClientRect(),cs=getComputedStyle(h1),Fs=parseFloat(cs.fontSize),font=cs.fontStyle+" "+cs.fontWeight+" "+cs.fontSize+" "+cs.fontFamily;
    W=hero.clientWidth;H=hero.clientHeight;dpr=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+"px";cv.style.height=H+"px";
    L=clamp(Fs*.12,6,10.5);px.font=font;
    var fm=px.measureText("Hg"),asc=fm.fontBoundingBoxAscent||Fs*.9,des=fm.fontBoundingBoxDescent||Fs*.25,pad=Math.ceil(Fs*.4);
    perch=[];
    ltrs.forEach(function(el,li){var ch=el.textContent;if(!/\S/.test(ch))return;
      var rc=el.getBoundingClientRect(),w=Math.ceil(rc.width)+4,h=Math.ceil(rc.height)+pad*2,i,y;
      probe.width=w;probe.height=h;px.font=font;px.textBaseline="alphabetic";px.fillStyle="#000";px.fillText(ch,0,pad+(rc.height-(asc+des))/2+asc);
      var d=px.getImageData(0,0,w,h).data,tops=[],best=1e9;
      for(i=0;i<w;i++){tops[i]=-1;for(y=0;y<h;y++)if(d[(y*w+i)*4+3]>128){tops[i]=y;break;}if(tops[i]>=0&&tops[i]<best)best=tops[i];}
      // runs of columns whose ink starts near the letter's top: the flat places a bird can stand
      var run=null;for(i=0;i<=w;i++){var ok=i<w&&tops[i]>=0&&tops[i]<=best+Fs*.05;
        if(ok){if(!run)run={a:i,b:i,y:tops[i]};run.b=i;run.y=Math.min(run.y,tops[i]);}
        else if(run){if(run.b-run.a>=2)perch.push({li:li,x:rc.left-hr.left+(run.a+run.b)/2,y:rc.top-hr.top-pad+run.y+.5});run=null;}}
    });
    // birds that were standing keep the nearest perch
    birds.forEach(function(b){if(b.state!=="perch")return;var bi=-1,bd=1e9;perch.forEach(function(q,i){var dd=Math.hypot(q.x-b.x,q.y-b.y);if(dd<bd){bd=dd;bi=i;}});b.p=bi;});
  }
  function taken(i,except){return birds.some(function(b){return b!==except&&(b.p===i&&b.state==="perch"||b.fl&&b.fl.to===i);});}
  function free(except){var pool=[];perch.forEach(function(q,i){if(taken(i,except))return;
      if(birds.some(function(b){if(b===except)return false;var j=b.fl?b.fl.to:b.state==="perch"?b.p:-1;return j>=0&&perch[j]&&Math.abs(perch[j].x-q.x)<L*3.2&&Math.abs(perch[j].y-q.y)<L*3;}))return;pool.push(i);});
    return pool.length?pool[(r()*pool.length)|0]:-1;}
  function near(b){var q=perch[b.p],pool=[];if(!q)return -1;perch.forEach(function(c,i){var dx=Math.abs(c.x-q.x);if(i!==b.p&&dx<L*12&&dx>L*1.5&&!taken(i,b))pool.push(i);});return pool.length?pool[(r()*pool.length)|0]:-1;}
  function edge(){return r()<.6?{x:W*(.25+r()*.75),y:-40}:{x:W+40,y:H*(.04+r()*.3)};}
  function fly(b,to,x1,y1){var d=Math.hypot(x1-b.x,y1-b.y);
    b.fl={x0:b.x,y0:b.y,x1:x1,y1:y1,cx:(b.x+x1)/2,cy:Math.min(b.y,y1)-(26+d*.26),t:0,dur:to>=0&&d<L*14?.38:.6+d/700,to:to};b.state="fly";b.p=-1;b.f=x1>=b.x?1:-1;}
  function takeoff(b,away){var j=away?-1:free(b);if(j<0){var e=edge();fly(b,-1,e.x,e.y);}else fly(b,j,perch[j].x,perch[j].y);}
  function arrive(b){measure();var j=free(b);if(j<0){b.away=2;return;}var e=edge();b.x=e.x;b.y=e.y;fly(b,j,perch[j].x,perch[j].y);}
  function step(b,dt){
    if(b.state==="fly"){var f=b.fl;f.t=Math.min(1,f.t+dt/f.dur);var t=f.t,e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,u=1-e;
      b.x=u*u*f.x0+2*u*e*f.cx+e*e*f.x1;b.y=u*u*f.y0+2*u*e*f.cy+e*e*f.y1;b.flap+=dt*(f.dur<.45?26:19);
      if(t>=1){if(f.to>=0&&perch[f.to]){b.state="perch";b.p=f.to;b.idle=.8+r()*3;}else{b.state="away";b.away=3+r()*7;}b.fl=null;}
      return;}
    if(b.state==="away"){if(!night&&(b.away-=dt)<=0)arrive(b);return;}
    var q=perch[b.p];if(!q){b.state="away";b.away=1;return;}b.x=q.x;b.y=q.y;
    if(b.peck>0)b.peck=Math.max(0,b.peck-dt);
    if(Math.hypot(ptr.x-b.x,ptr.y-(b.y-L))<L*5){takeoff(b,r()<.5);return;}
    if((b.idle-=dt)>0)return;
    var s=r();
    if(s<.3){b.peck=.32;b.idle=.5+r()*2;}
    else if(s<.5){b.f=-b.f;b.idle=.6+r()*2.5;}
    else if(s<.8){var j=near(b);if(j>=0)fly(b,j,perch[j].x,perch[j].y);else b.idle=1;}
    else takeoff(b,s>.94);
  }
  // sparrow colours: a warm mid-tone coat reads on the dark sky, the dark wing and feet read on the cream letters
  var COAT=["#9a8370","#8c7766","#a38b74"],WING="#3d322b",BELLY="#d9c8b2";
  function drawPerched(b){var pk=b.peck>0?Math.sin((1-b.peck/.32)*Math.PI):0,hx=L*(.55+.3*pk),hy=-L*(1.22-.55*pk);
    ctx.save();ctx.translate(b.x,b.y);ctx.scale(b.f,1);ctx.strokeStyle=WING;ctx.lineWidth=Math.max(1,L*.12);ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(-L*.12,0);ctx.lineTo(-L*.18,-L*.42);ctx.moveTo(L*.14,0);ctx.lineTo(L*.08,-L*.42);ctx.stroke();
    ctx.fillStyle=WING;ctx.beginPath();ctx.moveTo(-L*.55,-L*.72);ctx.lineTo(-L*1.35,-L*.42);ctx.lineTo(-L*1.25,-L*.3);ctx.lineTo(-L*.45,-L*.52);ctx.closePath();ctx.fill();
    ctx.fillStyle=b.coat;ctx.beginPath();ctx.ellipse(0,-L*.78,L*.72,L*.42,-.18,0,TAU);ctx.fill();
    ctx.fillStyle=BELLY;ctx.beginPath();ctx.ellipse(L*.18,-L*.6,L*.36,L*.2,-.1,0,TAU);ctx.fill();
    ctx.fillStyle=WING;ctx.beginPath();ctx.ellipse(-L*.18,-L*.86,L*.48,L*.24,-.3,0,TAU);ctx.fill();
    ctx.fillStyle=b.coat;ctx.beginPath();ctx.arc(hx,hy,L*.3,0,TAU);ctx.fill();
    ctx.fillStyle=WING;ctx.beginPath();ctx.arc(hx-L*.04,hy-L*.08,L*.22,Math.PI*1.05,Math.PI*1.95);ctx.fill();
    ctx.beginPath();ctx.moveTo(hx+L*.26,hy-L*.06);ctx.lineTo(hx+L*.55,hy+L*(.04+.1*pk));ctx.lineTo(hx+L*.24,hy+L*.1);ctx.closePath();ctx.fill();
    ctx.restore();}
  function drawFlying(b){var w=Math.sin(b.flap);
    ctx.save();ctx.translate(b.x,b.y-L*.8);ctx.scale(b.f,1);
    ctx.fillStyle=WING;ctx.beginPath();ctx.moveTo(-L*.6,-L*.05);ctx.lineTo(-L*1.25,L*.12);ctx.lineTo(-L*.55,L*.15);ctx.fill();
    ctx.fillStyle=b.coat;ctx.beginPath();ctx.ellipse(0,0,L*.7,L*.32,-.08,0,TAU);ctx.fill();
    ctx.beginPath();ctx.arc(L*.62,-L*.18,L*.26,0,TAU);ctx.fill();
    ctx.fillStyle=WING;ctx.beginPath();ctx.moveTo(L*.82,-L*.22);ctx.lineTo(L*1.1,-L*.12);ctx.lineTo(L*.8,-L*.06);ctx.fill();
    ctx.beginPath();ctx.moveTo(L*.25,-L*.12);ctx.quadraticCurveTo(-L*.2,-L*(.1+1.3*w),-L*.75,-L*(.05+1.5*w));ctx.lineTo(-L*.25,L*.05);ctx.closePath();ctx.fill();
    ctx.restore();}
  function draw(){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);birds.forEach(function(b){if(b.state==="perch")drawPerched(b);else if(b.state==="fly")drawFlying(b);});}
  function frame(t){raf=0;var dt=Math.min(.05,(t-(last||t))/1000);last=t;birds.forEach(function(b){step(b,dt);});draw();wake();}
  function wake(){if(!raf&&on&&visible&&!reduce)raf=requestAnimationFrame(frame);}
  addEventListener("pointermove",function(e){var hr=hero.getBoundingClientRect();ptr.x=e.clientX-hr.left;ptr.y=e.clientY-hr.top;},{passive:true});
  var rt=0;addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(function(){if(on){measure();draw();}},150);});
  h1.addEventListener("transitionend",function(e){if(on&&e.propertyName==="letter-spacing"){measure();draw();}});
  if(window.IntersectionObserver)new IntersectionObserver(function(en){visible=en[0].isIntersecting;last=0;wake();}).observe(hero);
  return{
    start:function(){if(on)return;on=true;measure();
      for(var i=0,n=innerWidth<620?2:3;i<n;i++)birds.push({state:"away",x:0,y:0,p:-1,f:1,peck:0,idle:0,fl:null,flap:r()*TAU,coat:COAT[i%3],away:night?1e9:2.8+i*1.1});
      if(reduce){if(!night)birds.forEach(function(b){var j=free(b);if(j>=0){b.state="perch";b.p=j;b.x=perch[j].x;b.y=perch[j].y;}});draw();return;}
      wake();},
    hour:function(dark){night=dark;if(!on)return;
      birds.forEach(function(b,i){if(dark){if(b.state!=="away")takeoff(b,true);}else if(b.state==="away")b.away=1+i*.9+r()*2;});
      if(reduce){birds.forEach(function(b){b.state=dark?"away":b.state;});if(!dark){birds.forEach(function(b){var j=free(b);if(j>=0){b.state="perch";b.p=j;b.x=perch[j].x;b.y=perch[j].y;}});}draw();}
      wake();}
  };
})();
if(hero.classList.contains("ready"))BIRDS&&BIRDS.start();
})();

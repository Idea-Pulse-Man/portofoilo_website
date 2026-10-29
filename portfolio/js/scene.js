/* Headland: the hero scene, drawn with three.js r128.
   A lighthouse on a grassy headland over the sea at golden hour. At night the sun is down, the moon is up and the lamp
   is lit; its beam sweeps the water. The land is one height field whose cliffs are pulled up into near-vertical walls
   and cut into strata, with sea stacks and a scree of boulders at their foot; rock, grass and plaster are
   photo scans (CC0, from Poly Haven, in assets/tex), projected from three sides so the cliffs never stretch them.
   The sky, the sea, the surf and the beam are shaders.
   Scrolling on into the climb section flies the camera in through the door: inside is a hall with a stone stair winding
   up the wall round an open well, and the work hangs beside it, each piece framed with its plaque. At the top a look
   down the well takes in all of it, and a ladder leads out onto the lantern gallery; there night falls, and the ending
   draws back out over the sea, where the lamp turns onto the camera and spells HELLO in Morse.
   app.js starts it with Lighthouse.init(opts) and drives it through the api that returns:
     opts  host, hero, flare, rays, night, reduce, fixed, scans (folder of the textures), content (selector of page
           parts that are not the scene), twin {line, sync, live, skipped, end}, onReady(), onHot(on), onToggle(),
           climb (the section), fade (the dip to dark and light), bar (the progress line), onClimb({phase, index}),
           onMorse({on, li, si}) (the lamp's signal: on or off, the letter and the dot or dash it is showing)
     api   setNight(night, instant), setWorks([{cover, plaque}]) (canvases, one pair per piece), climbScreens(n) */
(function(){
"use strict";
var T=window.THREE,TAU=Math.PI*2,D=Math.PI/180;
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function lerp(a,b,k){return a+(b-a)*k;}
function sstep(a,b,x){x=clamp((x-a)/(b-a),0,1);return x*x*(3-2*x);}
function rng(seed){return function(){seed=(seed+0x6D2B79F5)|0;var t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function h2(x,z){var s=Math.sin(x*127.1+z*311.7)*43758.5453;return s-Math.floor(s);}
function noise(x,z){var ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz,ux=fx*fx*(3-2*fx),uz=fz*fz*(3-2*fz);
  return lerp(lerp(h2(ix,iz),h2(ix+1,iz),ux),lerp(h2(ix,iz+1),h2(ix+1,iz+1),ux),uz);}
function fbm(x,z,oct){var s=0,a=.5,n=0;for(var i=0;i<oct;i++){s+=a*noise(x,z);n+=a;x=x*2.03+17.3;z=z*2.03+5.1;a*=.5;}return s/n;}
function h3(x,y,z){var s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return s-Math.floor(s);}
function noise3(x,y,z){var ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z),fx=x-ix,fy=y-iy,fz=z-iz;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);fz=fz*fz*(3-2*fz);
  return lerp(lerp(lerp(h3(ix,iy,iz),h3(ix+1,iy,iz),fx),lerp(h3(ix,iy+1,iz),h3(ix+1,iy+1,iz),fx),fy),
              lerp(lerp(h3(ix,iy,iz+1),h3(ix+1,iy,iz+1),fx),lerp(h3(ix,iy+1,iz+1),h3(ix+1,iy+1,iz+1),fx),fy),fz);}
function fbm3(x,y,z,oct){var s=0,a=.5,n=0;for(var i=0;i<oct;i++){s+=a*noise3(x,y,z);n+=a;x=x*2.03+5.7;y=y*2.03+1.3;z=z*2.03+9.1;a*=.5;}return s/n;}
function num(x){return Math.round(x).toLocaleString("en-US");}
/* azimuth from the view axis (-z), positive to the right; elevation above the horizon */
function dirOf(az,el){return new T.Vector3(Math.sin(az)*Math.cos(el),Math.sin(el),-Math.cos(az)*Math.cos(el));}

var LH={x:17,z:-25},TOWER=11.2,LAMP_Y=TOWER+1.87;
/* sea stacks: x, z, radius, height above the water */
var STACKS=[[1.5,-13,2.2,8.5],[2.6,-29.5,1.6,6],[8.4,-38,2.1,8.2],[11.8,-11,1.3,3.4],[5.2,-21.5,1,2.4],[25.5,-8.2,1.6,4.2]];
/* the photo scans, in assets/tex: rock for the cliffs, lichen-covered rock above it, turf, plaster */
var SCANS=["rock_diff","rock_nor","moss_diff","moss_nor","grass_diff","grass_nor","wall_diff","wall_nor"];
/* the climb, in screens of scroll into its section: through the door, inside, on the stair, then one piece per PER
   screens; the landing and the ladder (C_LEFT); and the ending outside (C_END) */
var C_DOOR=.25,C_IN=.33,C_W0=.75,PER=.6,C_LEFT=1.5,C_END=1.8;
function climbScreens(n){return C_W0+n*PER+C_LEFT+C_END;}
/* the lamp's signal at the end: HELLO in Morse. A dot is one unit of light, a dash three; one unit of dark between the
   parts of a letter, three between letters, and a long rest before it starts again. The unit keeps the flashing under
   three a second */
var MORSE={H:"....",E:".",L:".-..",O:"---"},MWORD="HELLO",MUNIT=210,MSEQ=[];
Array.from(MWORD).forEach(function(ch,li,w){var code=MORSE[ch]||"";Array.from(code).forEach(function(sy,si){MSEQ.push([1,sy==="."?1:3,li,si]);if(si<code.length-1)MSEQ.push([0,1,li,-1]);});
  MSEQ.push(li<w.length-1?[0,3,li,-1]:[0,9,w.length,-1]);});
var MTOTAL=MSEQ.reduce(function(a,q){return a+q[1];},0)*MUNIT;

/* ---------- the sky, shared by the dome, the sea's reflections and its haze ----------
   Colours are display colours: these shaders skip tone mapping, and the fog on the lit materials (which three.js
   mixes in after tone mapping) is set from the same function in JS, so the land fades into exactly this sky. */
var GLSL_SKY=[
"uniform vec3 uSun;uniform vec3 uMoon;uniform float uNight;uniform float uTime;",
"float hash12(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}",
"float hash13(vec3 q){q=fract(q*.1031);q+=dot(q,q.zyx+31.32);return fract((q.x+q.y)*q.z);}",
"float vnoise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);",
"  return mix(mix(hash12(i),hash12(i+vec2(1.,0.)),u.x),mix(hash12(i+vec2(0.,1.)),hash12(i+vec2(1.,1.)),u.x),u.y);}",
"float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*vnoise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}",
"vec3 skyBase(vec3 d){",
"  float h=max(d.y,0.);",
"  vec2 hz=normalize(d.xz+1e-5),sz=normalize(uSun.xz+1e-5);",
"  float t=dot(hz,sz)*.5+.5;t*=t;",
"  vec3 day=mix(mix(vec3(.56,.47,.57),vec3(.95,.63,.40),t),mix(vec3(.32,.29,.43),vec3(.50,.36,.42),t),smoothstep(0.,.16,h));",
"  day=mix(day,vec3(.09,.12,.27),smoothstep(.1,.6,h));",
"  float low=clamp(uSun.y*4.+.6,0.,1.),az=max(dot(hz,sz),0.),sd=max(dot(d,uSun),0.);",
"  float w1=pow(az,4.)*.32*(1.-smoothstep(0.,.3,h))*low,w2=pow(sd,8.)*.42*low,w3=(pow(sd,60.)*.22+pow(sd,1200.)*.5)*low;",
"  day+=vec3(1.,.5,.22)*w1+vec3(1.,.62,.3)*w2+vec3(1.,.86,.62)*w3;",
"  vec3 nite=mix(vec3(.10,.11,.22),vec3(.035,.05,.13),smoothstep(0.,.18,h));",
"  nite=mix(nite,vec3(.012,.018,.04),smoothstep(.12,.7,h));",
"  float md=max(dot(d,uMoon),0.);",
"  nite+=vec3(.5,.58,.85)*(pow(md,20.)*.12+pow(md,300.)*.25);",
"  return mix(day,nite,uNight);",
"}"].join("\n");
/* the same sky in JS, for the fog and the distant ridges; keep it in step with skyBase above */
function skyJS(d,sun,moon,night){
  var h=Math.max(d.y,0),hl=Math.hypot(d.x,d.z)||1e-5,sl=Math.hypot(sun.x,sun.z)||1e-5,dt=(d.x*sun.x+d.z*sun.z)/(hl*sl),t=dt*.5+.5;t*=t;
  var a=sstep(0,.16,h),b=sstep(.1,.6,h);
  var hor=[lerp(.56,.95,t),lerp(.47,.63,t),lerp(.57,.40,t)],mid=[lerp(.32,.50,t),lerp(.29,.36,t),lerp(.43,.42,t)],zen=[.09,.12,.27];
  var low=clamp(sun.y*4+.6,0,1),az=Math.max(dt,0),sd=Math.max(d.x*sun.x+d.y*sun.y+d.z*sun.z,0);
  var w1=Math.pow(az,4)*.32*(1-sstep(0,.3,h))*low,w2=Math.pow(sd,8)*.42*low,w3=(Math.pow(sd,60)*.22+Math.pow(sd,1200)*.5)*low;
  var c=sstep(0,.18,h),e=sstep(.12,.7,h),md=Math.max(d.x*moon.x+d.y*moon.y+d.z*moon.z,0),m=Math.pow(md,20)*.12+Math.pow(md,300)*.25;
  var N0=[.10,.11,.22],N1=[.035,.05,.13],N2=[.012,.018,.04],W=[[1,.5,.22],[1,.62,.3],[1,.86,.62]],MO=[.5,.58,.85],out=[];
  for(var i=0;i<3;i++){var dy=lerp(lerp(hor[i],mid[i],a),zen[i],b)+W[0][i]*w1+W[1][i]*w2+W[2][i]*w3;
    var ny=lerp(lerp(N0[i],N1[i],c),N2[i],e)+MO[i]*m;out.push(lerp(dy,ny,night));}
  return out;
}

var SKY_VS="varying vec3 vDir;void main(){vDir=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}";
var SKY_FS=[GLSL_SKY,
"varying vec3 vDir;",
"vec4 clouds(vec3 d){",
"  float up=smoothstep(.012,.16,d.y);if(up<=0.)return vec4(0.);",
"  vec2 p=d.xz/(d.y+.05);p=p*vec2(.32,.9)+vec2(uTime*.004,0.);",
"  float n=fbm(p*1.15)*.75+fbm(p*3.3+4.1)*.35;",
"  float dens=smoothstep(.5,.8,n)*up*(1.-smoothstep(.45,.95,d.y)*.7);",
"  float sd=max(dot(d,uSun),0.),low=clamp(uSun.y*4.+.6,0.,1.);",
"  vec3 lit=mix(vec3(.56,.40,.50),vec3(1.,.66,.42),pow(sd,2.5)*low);",
"  lit=mix(lit,vec3(1.,.88,.66),pow(sd,24.)*low);",
"  vec3 day=mix(lit,vec3(.30,.22,.32),smoothstep(.55,1.,n)*.55);",
"  float md=max(dot(d,uMoon),0.);",
"  vec3 nite=mix(vec3(.03,.038,.07),vec3(.17,.19,.27),pow(md,5.)*.9);",
"  return vec4(mix(day,nite,uNight),dens*.9);",
"}",
"void main(){",
"  vec3 d=normalize(vDir);vec3 c=skyBase(d);",
"  float above=smoothstep(-.01,.1,d.y);",
"  if(uNight>.001){",
"    vec3 p=d*180.;vec3 cell=floor(p);float r=hash13(cell);",
"    if(r>.996){",
"      vec3 o=vec3(hash13(cell+1.7),hash13(cell+3.1),hash13(cell+5.3))-.5;",
"      float dd=length(p-cell-.5-o*.4);",
"      float tw=.7+.3*sin(uTime*(1.3+r*4.)+r*91.);",
"      c+=vec3(.86,.9,1.)*smoothstep(.3,0.,dd)*(.35+.65*fract(r*91.7))*tw*1.8*uNight*above;",
"    }",
"    float bd=dot(d,normalize(vec3(.35,.5,-.8)))/.2;",
"    c+=vec3(.55,.6,.85)*exp(-bd*bd)*fbm(d.xy*6.+d.z*3.)*.07*uNight*above;",
"  }",
"  float sd=dot(d,uSun);",
"  c=mix(c,vec3(1.,.92,.74)*1.35,smoothstep(.99985,.99991,sd)*(1.-uNight*.9)*step(0.,d.y));",
"  vec4 cl=clouds(d);c=mix(c,cl.rgb,cl.a);",
/* the moon shines through thin cloud */
"  float md=dot(d,uMoon);",
"  if(md>.9997){vec3 mm=vec3(.96,.96,1.)*(.86+.14*vnoise(d.xy*300.));c=mix(c,mm,smoothstep(.99982,.99988,md)*uNight*(1.-cl.a*.55));}",
"  gl_FragColor=vec4(c,1.);",
"}"].join("\n");

var SEA_VS="varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}";
var SEA_FS=[GLSL_SKY,
"varying vec3 vW;",
"uniform float uFog,uSunI,uMoonI,uLampI,uPix;uniform vec3 uLamp,uBeam;uniform sampler2D uShore;uniform vec4 uShoreBox;",
"float fbmS(vec2 p){return vnoise(p)*.55+vnoise(p*2.1+1.7)*.3+vnoise(p*4.3+3.1)*.15;}",
/* fourteen wave trains, from swell to ripple, fanned out by the golden angle; each fades out before it is too fine
   for the pixels to hold, so the near water glitters and the far water smooths into one long path of light */
"vec2 waves(vec2 p,float dist,float camH){",
"  vec2 g=vec2(0.);",
"  for(int i=0;i<14;i++){",
"    float fi=float(i),ang=fi*2.39996+.4;vec2 dir=vec2(cos(ang),sin(ang));",
"    float k=.28*pow(1.36,fi),a=.03/pow(k,.7);",
"    float dmax=sqrt(3.1416/k*camH/uPix);",
"    float att=1.-smoothstep(dmax*.5,dmax,dist);",
"    float ph=dot(dir,p)*k+uTime*sqrt(9.8*k)*.6+fi*1.7;",
"    g+=dir*(a*k*cos(ph))*att;",
"  }",
"  return g;",
"}",
"void main(){",
"  vec3 tc=cameraPosition-vW;float dist=length(tc);vec3 v=tc/dist;",
"  vec2 g=waves(vW.xz,dist,max(cameraPosition.y,1.));",
"  vec3 n=normalize(vec3(-g.x,1.,-g.y));",
"  vec3 r=reflect(-v,n);r.y=abs(r.y)+.002;r=normalize(r);",
"  float fres=.02+.98*pow(1.-max(dot(n,v),0.),5.);",
"  vec3 deep=mix(vec3(.035,.07,.10),vec3(.006,.012,.026),uNight)+skyBase(vec3(0.,1.,0.))*.12;",
"  vec3 col=mix(deep,skyBase(r),fres);",
"  float far=smoothstep(12.,420.,dist);",
"  float rs=max(dot(r,uSun),0.);",
"  col+=vec3(1.,.74,.46)*(pow(rs,mix(1800.,160.,far))*mix(16.,3.,far)+pow(rs,48.)*.12)*uSunI;",
"  float rm=max(dot(r,uMoon),0.);",
"  col+=vec3(.78,.84,1.)*(pow(rm,mix(1500.,150.,far))*mix(7.,1.6,far)+pow(rm,40.)*.05)*uMoonI;",
"  vec3 l=normalize(uLamp-vW);",
"  col+=vec3(1.,.8,.52)*pow(max(dot(r,l),0.),mix(900.,120.,far))*uLampI*4.;",
"  vec2 dl=vW.xz-uLamp.xz;float dlen=length(dl);",
"  float bw=pow(abs(dot(dl/max(dlen,1e-3),uBeam.xz)),900.)*smoothstep(8.,30.,dlen)*(1.-smoothstep(80.,260.,dlen));",
"  col+=vec3(.95,.82,.6)*bw*uLampI*.22;",
/* the coast: a baked field, R = 1 at the rocks fading over 5 m, G = the same over 16 m. Shallow water turns
   greener and lighter near the land; white water churns against every rock and lines of foam roll in on them */
"  vec2 suv=(vW.xz-uShoreBox.xy)/uShoreBox.zw;",
"  if(suv.x>0.&&suv.x<1.&&suv.y>0.&&suv.y<1.){",
"    vec2 sf=texture2D(uShore,suv).rg;float s=sf.r;",
"    col=mix(col,mix(vec3(.10,.24,.24),vec3(.012,.03,.045),uNight),sf.g*sf.g*.45*(1.-fres*.7));",
"    if(s>.01){",
"      float n1=fbmS(vW.xz*.45+vec2(uTime*.04,uTime*.025)),n2=fbmS(vW.xz*1.7-vec2(uTime*.09,-uTime*.06));",
"      float roll=.5+.5*sin(s*17.-uTime*1.15+n1*6.);",
"      float foam=smoothstep(.6,1.,s)*(.6+.4*n2)+smoothstep(.2,.8,s)*smoothstep(.76,1.,roll)*(.35+.65*n2);",
"      foam*=smoothstep(.24,.6,n1*.6+n2*.6);",
"      col=mix(col,mix(vec3(.93,.87,.79),vec3(.30,.34,.44),uNight),clamp(foam*1.6,0.,1.)*.9);",
"    }",
"  }",
"  float f=1.-exp(-pow(uFog*dist,2.));",
"  col=mix(col,skyBase(normalize(vec3(-v.x+1e-4,0.,-v.z))),f);",
"  gl_FragColor=vec4(col,1.);",
"}"].join("\n");

/* the beam: an open cone, brightest along its axis and near the lamp, soft at its edges */
var BEAM_VS="uniform float uLen;varying float vT;varying vec3 vN;varying vec3 vV;void main(){vT=position.z/uLen;vec4 w=modelMatrix*vec4(position,1.);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}";
var BEAM_FS="uniform float uI;varying float vT;varying vec3 vN;varying vec3 vV;void main(){float e=pow(abs(dot(normalize(vN),normalize(vV))),1.4);float a=pow(clamp(1.-vT,0.,1.),2.)*smoothstep(0.,.015,vT);gl_FragColor=vec4(vec3(1.,.87,.64)*e*a*uI*.34,1.);}";

/* the plants nod in the wind: the tops of the cards sway, each clump a little out of step with its neighbours */
var PLANT_SWAY=["#include <begin_vertex>","#ifdef USE_INSTANCING","vec3 tq=instanceMatrix[3].xyz;",
"float tsw=sin(uTime*1.7+tq.x*.55+tq.z*.35)*.6+sin(uTime*2.9+tq.x*1.3-tq.z*.8)*.3;","transformed.xz+=vec2(.11,.05)*tsw*uv.y*uv.y;","#endif"].join("\n");
/* how directly the camera looks through a plant toward the sun, for the light that comes through the blades */
var PLANT_BACK=["#include <project_vertex>","vec4 bw=vec4(transformed,1.);","#ifdef USE_INSTANCING","bw=instanceMatrix*bw;","#endif",
"bw=modelMatrix*bw;vBack=pow(max(dot(normalize(bw.xyz-cameraPosition),uSun),0.),5.)*(.3+.7*uv.y);"].join("\n");

/* the twin: everything drawn as a lattice that spreads out from the lighthouse */
var WIRE_VS=["varying vec3 vW;","void main(){vec4 p=vec4(position,1.);","#ifdef USE_INSTANCING","p=instanceMatrix*p;","#endif","vec4 w=modelMatrix*p;vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}"].join("\n");
var WIRE_FS="uniform float uR,uA;uniform vec3 uO,uCol;varying vec3 vW;void main(){float d=length(vW.xz-uO.xz);if(d>uR)discard;float front=smoothstep(uR-7.,uR,d);float fade=1.-smoothstep(90.,340.,d)*.8;gl_FragColor=vec4(uCol*(.6+1.3*front),(.3+.7*front)*fade*uA);}";

/* ---------- rock and grass, triplanar ----------
   Patched into MeshStandardMaterial, so three.js still does the light, shadows and fog. Each scan is projected along
   the three world axes and blended by the surface normal (normals by the whiteout blend). Dark stratified rock below,
   lichen-covered rock higher up, turf on the flats above the spray line, and a wet, darker, glossier band at the
   waterline. Rock is sampled at two scales, and a slow noise varies the tone, so the tiling never shows. */
var TP_VS_HEAD=["varying vec3 vTpPos;","varying vec3 vTpNrm;","#ifdef USE_AO_ATTR","attribute float ao;","varying float vAo;","#endif",""].join("\n");
var TP_VS_BODY=["vec4 tpP=vec4(transformed,1.);vec3 tpQ=objectNormal;","#ifdef USE_INSTANCING","tpP=instanceMatrix*tpP;tpQ=mat3(instanceMatrix)*tpQ;","#endif",
"vTpPos=(modelMatrix*tpP).xyz;vTpNrm=normalize(mat3(modelMatrix)*tpQ);","#ifdef USE_AO_ATTR","vAo=ao;","#endif"].join("\n");
var TP_FS_HEAD=["uniform sampler2D tRA,tRAN,tRB,tRBN,tGR,tGRN;","varying vec3 vTpPos;","varying vec3 vTpNrm;","#ifdef USE_AO_ATTR","varying float vAo;","#endif",
"float tpH(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}",
"float tpNz(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(tpH(i),tpH(i+vec2(1.,0.)),u.x),mix(tpH(i+vec2(0.,1.)),tpH(i+vec2(1.,1.)),u.x),u.y);}",
"vec3 tpTex(sampler2D t,vec3 p,vec3 b,float s){return texture2D(t,p.zy*s).rgb*b.x+texture2D(t,p.xz*s).rgb*b.y+texture2D(t,p.xy*s).rgb*b.z;}",
"vec3 tpNor(sampler2D t,vec3 p,vec3 n,vec3 b,float s,float k){",
"  vec3 x=texture2D(t,p.zy*s).xyz*2.-1.,y=texture2D(t,p.xz*s).xyz*2.-1.,z=texture2D(t,p.xy*s).xyz*2.-1.;",
"  x.xy*=k;y.xy*=k;z.xy*=k;",
"  x=vec3(x.xy+n.zy,abs(x.z)*n.x);y=vec3(y.xy+n.xz,abs(y.z)*n.y);z=vec3(z.xy+n.xy,abs(z.z)*n.z);",
"  return normalize(x.zyx*b.x+y.xzy*b.y+z.xyz*b.z);",
"}"].join("\n");
var TP_FS_ALBEDO=["vec3 tpw=normalize(vTpNrm);","#ifdef DOUBLE_SIDED","tpw*=gl_FrontFacing?1.:-1.;","#endif",
"vec3 tpb=pow(abs(tpw),vec3(5.));tpb/=tpb.x+tpb.y+tpb.z;",
"float tpm=tpNz(vTpPos.xz*.07)*.6+tpNz(vTpPos.xz*.23+vTpPos.y*.13)*.4;",
"vec3 tpA=mix(tpTex(tRA,vTpPos,tpb,.21),tpTex(tRA,vTpPos+3.7,tpb,.067),.42)*1.6;tpA=mix(tpA,vec3(dot(tpA,vec3(.3333))),.28);",
"vec3 tpB=tpTex(tRB,vTpPos,tpb,.24);",
"float tpUp=smoothstep(4.,9.5,vTpPos.y+(tpm-.5)*5.);",
"float tpV=tpNz(vTpPos.xz*.11+vTpPos.y*.07);",
"vec3 tpRock=mix(tpA,tpB,clamp(tpUp*.8+(tpV-.5)*.6,0.,1.));",
/* lichen crusts on the upper faces, and dark streaks where water runs down the rock */
"float tpLi=smoothstep(.62,.8,tpNz(vTpPos.xz*.9+vTpPos.y*.6))*smoothstep(3.,7.,vTpPos.y);",
"tpRock=mix(tpRock,tpRock*vec3(1.35,1.15,.7)+vec3(.05,.035,0.),tpLi*.55);",
"tpRock*=1.-smoothstep(.6,.85,tpNz(vec2((vTpPos.x+vTpPos.z)*1.1+tpNz(vTpPos.xz*.4+vTpPos.y*.2)*2.5,vTpPos.y*.06)))*.2;",
/* turf: greener in the hollows, sun-dried on the crowns, broken by the odd outcrop */
"vec3 tpG=mix(texture2D(tGR,vTpPos.xz*.26).rgb,texture2D(tGR,vTpPos.xz*.071+.37).rgb,.45);",
"tpG*=mix(vec3(.92,1.02,.86),vec3(1.18,1.02,.78),smoothstep(.35,.75,tpNz(vTpPos.xz*.05+7.)*.7+tpNz(vTpPos.xz*.21)*.3));",
"float tpGw=smoothstep(.5,.74,tpw.y+(tpm-.5)*.22)*smoothstep(1.6,3.2,vTpPos.y)*(1.-smoothstep(.72,.86,tpNz(vTpPos.xz*.13+3.1))*.85);",
"tpGw*=mix(smoothstep(.82,.94,tpw.y),1.,smoothstep(5.,7.,vTpPos.y));",
"vec3 tpAlb=pow(mix(tpRock,tpG,tpGw),vec3(2.2));",
"float tpWet=(1.-smoothstep(.15,2.2,vTpPos.y+(tpm-.5)*1.2))*(1.-tpGw);",
"tpAlb*=mix(1.,.5,tpWet)*(.82+.36*tpm);",
"diffuseColor.rgb*=tpAlb;","#ifdef USE_AO_ATTR","diffuseColor.rgb*=vAo;","#endif"].join("\n");
var TP_FS_ROUGH="float roughnessFactor=mix(roughness,.3,tpWet);";
var TP_FS_NORMAL=["vec3 tpNA=tpNor(tRAN,vTpPos,tpw,tpb,.21,1.);","vec3 tpNB=tpNor(tRBN,vTpPos,tpw,tpb,.24,1.);","vec3 tpNG=tpNor(tGRN,vTpPos,tpw,tpb,.26,.8);",
"normal=normalize((viewMatrix*vec4(normalize(mix(mix(tpNA,tpNB,tpUp*.8),tpNG,tpGw)),0.)).xyz);"].join("\n");

function init(o){
  if(!T||!o||!o.host)return null;
  var host=o.host,reduce=!!o.reduce,FIXED=!!o.fixed,tw=o.twin||null;
  var renderer;
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});}catch(e){return null;}
  if(!renderer.getContext())return null;
  var PR=Math.min(1.5,window.devicePixelRatio||1);
  renderer.setPixelRatio(PR);
  renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
  host.appendChild(renderer.domElement);
  var scene=new T.Scene(),camera=new T.PerspectiveCamera(40,1,.5,5000),fx=new T.Group();
  scene.fog=new T.FogExp2(0xc98a58,.0042);scene.add(fx);
  var U={uSun:{value:new T.Vector3()},uMoon:{value:new T.Vector3()},uNight:{value:0},uTime:{value:0}};
  var W=1,H=1,yardH=0,verts=0,lookX=0,sky=null,seaMat=null,ridges=[],gulls=null,dust=null,beam=null,glow=null,lampMesh=null,glassMat=null,lampL=null,hits=[];
  var sunDir=new T.Vector3(),moonDir=new T.Vector3(),LAMP=new T.Vector3(LH.x,0,LH.z),beamDir=new T.Vector3(1,0,0);
  var ANI=Math.min(8,renderer.capabilities.getMaxAnisotropy()),TEX={},scanned=false;
  function lin(hex){return new T.Color(hex).convertSRGBToLinear();}
  function std(hex,rough,metal){return new T.MeshStandardMaterial({color:lin(hex),roughness:rough,metalness:metal||0});}
  function put(parent,geo,mat,x,y,z){var m=new T.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
  function scaleUV(geo,su,sv){var uv=geo.attributes.uv;for(var i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*su,uv.getY(i)*sv);return geo;}
  function glowTex(){var c=document.createElement("canvas");c.width=c.height=128;var x=c.getContext("2d"),g=x.createRadialGradient(64,64,0,64,64,64);
    g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(.18,"rgba(255,255,255,.55)");g.addColorStop(.5,"rgba(255,255,255,.12)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,128,128);return new T.CanvasTexture(c);}

  // a four-panel door in old green paint, with a brass knob
  function doorTex(){var c=document.createElement("canvas");c.width=256;c.height=512;var x=c.getContext("2d"),r=rng(5),i;
    x.fillStyle="#2E4A3C";x.fillRect(0,0,256,512);
    [[28,34,90,206],[138,34,90,206],[28,272,90,206],[138,272,90,206]].forEach(function(p){x.fillStyle="#36584A";x.fillRect(p[0],p[1],p[2],p[3]);
      x.fillStyle="rgba(255,255,255,.13)";x.fillRect(p[0],p[1],p[2],4);x.fillRect(p[0],p[1],4,p[3]);x.fillStyle="rgba(0,0,0,.3)";x.fillRect(p[0],p[1]+p[3]-4,p[2],4);x.fillRect(p[0]+p[2]-4,p[1],4,p[3]);});
    for(i=0;i<900;i++){x.fillStyle="rgba(0,0,0,"+(r()*.08).toFixed(3)+")";x.fillRect(r()*256,r()*512,1+r()*2,4+r()*14);}
    x.fillStyle="#C9A45A";x.beginPath();x.arc(212,262,7,0,TAU);x.fill();
    var t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=ANI;return t;}
  // gravel: small stones on a dusty ground, tiling
  function gravelTex(){var S=256,c=document.createElement("canvas");c.width=c.height=S;var x=c.getContext("2d"),r=rng(12),i,W5=[[0,0],[S,0],[-S,0],[0,S],[0,-S]];
    x.fillStyle="#8E8170";x.fillRect(0,0,S,S);
    // each stone is drawn again one tile over on every side, so the edges wrap
    for(i=0;i<2600;i++){var px=r()*S,py=r()*S,rr=1+r()*3.2,v=Math.round(120+r()*95),rot=r()*3;x.fillStyle="rgb("+v+","+Math.round(v*.95)+","+Math.round(v*.86)+")";
      W5.forEach(function(q){x.beginPath();x.ellipse(px+q[0],py+q[1],rr,rr*.75,rot,0,TAU);x.fill();});}
    var t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.encoding=T.sRGBEncoding;t.anisotropy=ANI;return t;}

  /* ---------- the scans; without them (opened from disk, or offline) the scene falls back to flat colour ---------- */
  function loadScans(){
    if(location.protocol==="file:")return Promise.resolve(false);
    var dir=o.scans||"assets/tex/",n=0,loader=new T.TextureLoader();
    return new Promise(function(res){
      SCANS.forEach(function(k){loader.load(dir+k+".webp",function(t){
        t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=ANI;if(k==="wall_diff")t.encoding=T.sRGBEncoding;TEX[k]=t;n++;
        if(tw)tw.line("scans","archivist","stone scans "+n+"/"+SCANS.length);if(n===SCANS.length)res(true);},undefined,function(){res(false);});});
    });
  }
  function scanMat(opt){
    opt=opt||{};var m=new T.MeshStandardMaterial({color:0xffffff,roughness:.9,metalness:0,envMapIntensity:.55});
    if(opt.ao)m.defines={STANDARD:"",USE_AO_ATTR:""};
    m.onBeforeCompile=function(sh){
      sh.uniforms.tRA={value:TEX.rock_diff};sh.uniforms.tRAN={value:TEX.rock_nor};sh.uniforms.tRB={value:TEX.moss_diff};
      sh.uniforms.tRBN={value:TEX.moss_nor};sh.uniforms.tGR={value:TEX.grass_diff};sh.uniforms.tGRN={value:TEX.grass_nor};
      sh.vertexShader=TP_VS_HEAD+sh.vertexShader.replace("#include <worldpos_vertex>","#include <worldpos_vertex>\n"+TP_VS_BODY);
      sh.fragmentShader=sh.fragmentShader.replace("#include <common>","#include <common>\n"+TP_FS_HEAD).replace("#include <map_fragment>",TP_FS_ALBEDO)
        .replace("#include <roughnessmap_fragment>",TP_FS_ROUGH).replace("#include <normal_fragment_maps>",TP_FS_NORMAL);
    };
    return m;
  }

  /* ---------- the land ----------
     One height field: a promontory juts out toward the open sea and the coast behind it recedes to the horizon; the
     top swells into hills inland. Along the coast the ground ramps up over a few metres; the ramp's vertices are then
     pulled together into a near-vertical wall (so the wall has as many rows as the ramp had), cut into strata and crags,
     with a wave-cut shelf at its foot in places. */
  function ridged(x,z){return 1-Math.abs(noise(x,z)*2-1);}
  function landD(x,z){
    // roughly how far inland a point is, in metres (negative out at sea); the coast is warped by noise at three
    // scales, then notched into buttresses and coves
    var wx=x+(fbm(x*.08+2,z*.08,3)-.5)*4+(fbm(x*.21,z*.21,3)-.5)*3+(fbm(x*.9+4,z*.9,2)-.5)*1.1,wz=z+(fbm(x*.08+5,z*.08+2,3)-.5)*4+(fbm(x*.21+9,z*.21+4,3)-.5)*3+(fbm(x*.9,z*.9+6,2)-.5)*1.1;
    var ex=(wx-19)/12.5,ez=(wz+25)/9.5,pro=(1-Math.sqrt(ex*ex+ez*ez))*9.5;
    var back=Math.max(0,-wz-22),front=Math.max(0,wz+8),main=(wx-(29+.0032*back*back+.03*front*front))*.85;
    return Math.max(pro,main)+(fbm(x*.05+3,z*.05+7,4)-.5)*5+(ridged(x*.3+1.3,z*.3+.7)-.55)*2-Math.max(0,x-112)*.6-Math.max(0,-z-180)*.6;
  }
  // the same coast without its fine detail: its gradient is the inland direction the cliff rows are pulled along
  function landD0(x,z){
    var wx=x+(fbm(x*.08+2,z*.08,3)-.5)*4+(fbm(x*.21,z*.21,3)-.5)*3,wz=z+(fbm(x*.08+5,z*.08+2,3)-.5)*4+(fbm(x*.21+9,z*.21+4,3)-.5)*3;
    var ex=(wx-19)/12.5,ez=(wz+25)/9.5,pro=(1-Math.sqrt(ex*ex+ez*ez))*9.5;
    var back=Math.max(0,-wz-22),front=Math.max(0,wz+8),main=(wx-(29+.0032*back*back+.03*front*front))*.85;
    return Math.max(pro,main)+(fbm(x*.05+3,z*.05+7,4)-.5)*5;
  }
  function topAt(x,z,d){return 7.4+(fbm(x*.03+11,z*.03+2,4)-.5)*4.6+sstep(26,95,x-z*.2)*8+(fbm(x*.2,z*.2,3)-.5)*.7+Math.max(0,d-14)*.05;}
  // how wide the coastal ramp is in the height field; it becomes the foot, the wall and the lip of the cliff
  function cliffW(x,z){return lerp(4.5,9,fbm(x*.045+30,z*.045+12,2));}
  /* the cliff's profile across that ramp, as (inland offset, height), both 0..1: a short foot, a wall that takes
     three quarters of the rows, and a lip that rolls back into the turf */
  function profile(u){return u<.08?[u*3.25,u*.75]:u<.84?[.26+(u-.08)*.0921,.06+(u-.08)*1.1974]:[.33+(u-.84)*4.1875,.97+(u-.84)*.1875];}
  function heightAt(x,z){
    var d=landD(x,z),h;
    if(d<-.3){h=Math.max(-7,(d+.3)*2.4);
      var pl=sstep(.5,.66,noise(x*.11+7,z*.11+3));
      if(pl>0)h=Math.max(h,lerp(-1.2,.16+(noise(x*.8,z*.8)-.5)*.34,pl*sstep(-5.5,-1,d)));
      return h;}
    var w=cliffW(x,z),u=Math.min(1,(d+.3)/(w+.3));h=topAt(x,z,d)*profile(u)[1];
    // the lighthouse yard is level
    var dl=Math.hypot(x-LH.x,z-LH.z);
    if(dl<11&&u>=.84)h=lerp(h,yardH,1-sstep(6.5,10.5,dl));
    return h;
  }
  function axis(n,a,m,b,f){var out=[],k=Math.round(n*f),i;for(i=0;i<=k;i++)out.push(lerp(a,m,i/k));for(i=1;i<=n-k;i++)out.push(lerp(m,b,i/(n-k)));return out;}
  function detailTex(){var S=256,c=document.createElement("canvas");c.width=c.height=S;var x=c.getContext("2d"),im=x.createImageData(S,S),d=im.data,r=rng(9),w=new Float32Array(S*S),i;
    for(i=0;i<S*S;i++)w[i]=r();
    for(i=0;i<S*S;i++){var u=i%S,v=(i/S)|0,s=(w[i]*2+w[v*S+(u+1)%S]+w[((v+1)%S)*S+u]+w[((v+S-1)%S)*S+(u+S-1)%S])/5,val=Math.round(255*(.8+.2*s));d[i*4]=d[i*4+1]=d[i*4+2]=val;d[i*4+3]=255;}
    x.putImageData(im,0,0);var t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=ANI;return t;}
  function buildLand(){
    yardH=topAt(LH.x,LH.z,landD(LH.x,LH.z));
    // denser where the camera looks closest: the promontory and the near coast
    var XS=axis(250,-8,52,150,.8),ZS=axis(330,22,-64,-210,.8),nx=XS.length,nz=ZS.length,N=nx*nz,i,j,k;
    var pos=new Float32Array(N*3),uv=new Float32Array(N*2),e=1.2;
    for(j=0;j<nz;j++)for(i=0;i<nx;i++){k=j*nx+i;var x=XS[i],z=ZS[j],y=heightAt(x,z),d=landD(x,z),w=d>-.3?cliffW(x,z):0;
      // pull the ramp upright along the inland direction: its rows become the foot, the wall and the lip
      if(d>-.3&&d<w){var u=(d+.3)/(w+.3),dd=(profile(u)[0]-u)*(w+.3);
        var gx=(landD0(x+e,z)-landD0(x-e,z))/(2*e),gz=(landD0(x,z+e)-landD0(x,z-e))/(2*e),g=Math.hypot(gx,gz)||1;
        // where the field is flat its gradient says little: never move a vertex further than the ramp is wide
        var mv=clamp(dd/Math.max(g,.6),-(w+.3),w+.3);x+=gx/g*mv;z+=gz/g*mv;}
      pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x*.05;uv[k*2+1]=z*.05;}
    var idx=[];for(j=0;j<nz-1;j++)for(i=0;i<nx-1;i++){var a=j*nx+i,b=a+1,c=a+nx,dI=c+1;idx.push(a,b,c,b,dI,c);}
    var geo=new T.BufferGeometry();geo.setAttribute("position",new T.BufferAttribute(pos,3));geo.setAttribute("uv",new T.BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
    /* the face of the rock, pushed in and out along its normal: vertical joints (buttresses and gullies), bedding
       planes, a wave-cut notch at the waterline in places, and small crags. Only in the dense part of the grid; the
       recesses and the foot get less sky */
    var nr=geo.attributes.normal.array,ao=new Float32Array(N);
    for(k=0;k<N;k++){var px=pos[k*3],py=pos[k*3+1],pz=pos[k*3+2],steep=1-sstep(.3,.72,nr[k*3+1]),occ=1,dense=(1-sstep(46,54,px))*sstep(-68,-58,pz);
      if(steep>.01&&py>-1.5&&dense>0){var hl=Math.hypot(nr[k*3],nr[k*3+2])||1;
        var joint=(fbm3(px*.42,py*.09,pz*.42,3)-.5)*2.6,lay=(noise((py+(fbm(px*.06,pz*.06,2)-.5)*3)*.6,3.3)-.5)*.45,crag=(fbm3(px*.9,py*.9,pz*.9,2)-.5)*.6;
        var notch=-sstep(-.2,.5,py)*(1-sstep(1.2,2.2,py))*.9*sstep(.4,.6,noise(px*.15,pz*.15));
        var push=(joint+lay+crag+notch)*steep*sstep(-1,.6,py)*dense;pos[k*3]+=nr[k*3]/hl*push;pos[k*3+2]+=nr[k*3+2]/hl*push;occ=clamp(.84+push*.3,.5,1.08);}
      ao[k]=occ*lerp(.6,1,sstep(-.5,4,py));}
    geo.attributes.position.needsUpdate=true;geo.computeVertexNormals();geo.setAttribute("ao",new T.BufferAttribute(ao,1));
    var mat;
    if(scanned)mat=scanMat({ao:true});
    else{// flat colour: dry grass on the flats, rock on the slopes, dark wet stone at the waterline
      var col=new Float32Array(N*3);nr=geo.attributes.normal.array;
      for(k=0;k<N;k++){var qx=pos[k*3],qy=pos[k*3+1],qz=pos[k*3+2],gn=fbm(qx*.08,qz*.08,3),st=noise(qx*.3+qy*.9,qz*.3),fl=sstep(.6,.86,nr[k*3+1]+(gn-.5)*.16),wt=sstep(.15,1.6,qy);
        var rc=[lerp(lerp(.30,.47,st),lerp(.42,.60,gn),fl),lerp(lerp(.26,.40,st),lerp(.39,.49,gn),fl),lerp(lerp(.22,.32,st),lerp(.17,.22,gn),fl)];
        for(var q=0;q<3;q++)col[k*3+q]=Math.pow(lerp([.10,.09,.085][q],rc[q],wt),2.2)*ao[k];}
      geo.setAttribute("color",new T.BufferAttribute(col,3));var det=detailTex();
      mat=new T.MeshStandardMaterial({vertexColors:true,roughness:.95,metalness:0,map:det,bumpMap:det,bumpScale:.03});}
    var land=new T.Mesh(geo,mat);land.castShadow=land.receiveShadow=true;scene.add(land);verts=N;
  }

  /* ---------- sea stacks and a scree of boulders at the foot of the cliffs ---------- */
  var rockMat=null,BOULDERS=[];
  // a column of rock: lobed in plan and changing with height, split by vertical fissures, banded, undercut at the
  // waterline, broad at the foot, leaning a little, with a broken crown that slopes one way
  function stackGeo(r,h,seed){
    var Hh=h+2,g=new T.CylinderGeometry(1,1,Hh,64,Math.round(Hh*4.5),false),p=g.attributes.position,tilt=(h2(seed,1)-.5)*.1,sl=h2(seed,2)*TAU;
    for(var i=0;i<p.count;i++){var x=p.getX(i),y=p.getY(i),z=p.getZ(i),rr=Math.hypot(x,z),a=Math.atan2(z,x),ca=Math.cos(a),sa=Math.sin(a),Y=y+Hh/2-2,yn=clamp(Y/h,0,1);
      var lobes=(fbm(ca*.9+seed,sa*.9+Y*.05,3)-.5)*1.1,joint=(fbm3(ca*2.2+seed,Y*.12,sa*2.2,3)-.5)*.7,lay=(noise((Y+(fbm(ca+seed,sa,2)-.5)*2.4)*.8,seed*3.1)-.5)*.35;
      var fine=(fbm3(ca*5+seed,Y*1.5,sa*5,2)-.5)*.18,notch=-sstep(-.3,.4,Y)*(1-sstep(1,1.8,Y))*.25;
      var k=(1+lobes+joint+lay+fine+notch)*(1.25-.45*Math.pow(yn,.8))*r;
      var cap=y>Hh/2-1e-3?(fbm(x*1.5+seed,z*1.5,3)-.5)*1.6-rr*rr*.9+(x*Math.cos(sl)+z*Math.sin(sl))*.5:0;
      p.setXYZ(i,x*k+Y*tilt,Y+cap,z*k);}
    g.computeVertexNormals();return g;
  }
  function boulderGeo(){var g=new T.SphereGeometry(1,20,14),p=g.attributes.position;
    for(var i=0;i<p.count;i++){var x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=.7+.6*fbm3(x*1.4+11,y*1.4,z*1.4,3);p.setXYZ(i,x*n,y*n,z*n);}
    g.computeVertexNormals();return g;}
  function buildRocks(){
    rockMat=scanned?scanMat():new T.MeshStandardMaterial({color:lin(0x4d4239),roughness:.92});
    STACKS.forEach(function(q,i){var m=put(scene,stackGeo(q[2],q[3],i*7.3+1),rockMat,q[0],0,q[1]);m.rotation.y=i*1.7;});
    var r=rng(77),t,list=BOULDERS;
    for(t=0;t<9000&&list.length<200;t++){var x=lerp(-12,70,r()),z=lerp(-74,10,r()),d=landD(x,z);
      if(d>.5||d<-4.5||r()>Math.exp(Math.min(0,d)*.7)*.8)continue;
      var s=.22+Math.pow(r(),2.4)*1.5;list.push([x,Math.max(heightAt(x,z),-.6)-s*.28,z,s]);}
    STACKS.forEach(function(q){for(var j=0;j<7;j++){var a=r()*TAU,rr=q[2]*(1.05+r()*.6),s=.25+r()*.7;list.push([q[0]+Math.cos(a)*rr,-.25-s*.2,q[1]+Math.sin(a)*rr,s]);}});
    var im=new T.InstancedMesh(boulderGeo(),rockMat,list.length),ob=new T.Object3D();
    list.forEach(function(b,i){ob.position.set(b[0],b[1],b[2]);ob.rotation.set((r()-.5)*.6,r()*TAU,(r()-.5)*.6);ob.scale.set(b[3]*(.8+r()*.5),b[3]*(.55+r()*.35),b[3]*(.8+r()*.5));ob.updateMatrix();im.setMatrixAt(i,ob.matrix);});
    im.castShadow=im.receiveShadow=true;scene.add(im);
    return STACKS.length+" sea stacks, "+list.length+" boulders";
  }

  /* ---------- the sea, and the surf: a distance field from every rock, land, stack and boulder ---------- */
  function shoreField(){
    var S=256,box=[-16,-78,92,92],ts=box[2]/S,N=S*S,dist=new Float32Array(N),data=new Uint8Array(N*4),i,j,k,v;
    for(j=0;j<S;j++)for(i=0;i<S;i++)dist[j*S+i]=heightAt(box[0]+(i+.5)*ts,box[1]+(j+.5)*ts)>-.12?0:1e9;
    function stamp(cx,cz,rad){var i0=Math.max(0,Math.floor((cx-rad-box[0])/ts)),i1=Math.min(S-1,Math.ceil((cx+rad-box[0])/ts)),j0=Math.max(0,Math.floor((cz-rad-box[1])/ts)),j1=Math.min(S-1,Math.ceil((cz+rad-box[1])/ts));
      for(var jj=j0;jj<=j1;jj++)for(var ii=i0;ii<=i1;ii++)if(Math.hypot(box[0]+(ii+.5)*ts-cx,box[1]+(jj+.5)*ts-cz)<rad)dist[jj*S+ii]=0;}
    STACKS.forEach(function(q){stamp(q[0],q[1],q[2]*1.15);});
    BOULDERS.forEach(function(b){if(b[1]+b[3]*.5>-.15)stamp(b[0],b[2],b[3]*.85);});
    // chamfer distance transform: forward, then back
    for(j=0;j<S;j++)for(i=0;i<S;i++){k=j*S+i;v=dist[k];if(!v)continue;
      if(i>0)v=Math.min(v,dist[k-1]+1);if(j>0){v=Math.min(v,dist[k-S]+1);if(i>0)v=Math.min(v,dist[k-S-1]+1.4142);if(i<S-1)v=Math.min(v,dist[k-S+1]+1.4142);}dist[k]=v;}
    for(j=S-1;j>=0;j--)for(i=S-1;i>=0;i--){k=j*S+i;v=dist[k];if(!v)continue;
      if(i<S-1)v=Math.min(v,dist[k+1]+1);if(j<S-1){v=Math.min(v,dist[k+S]+1);if(i<S-1)v=Math.min(v,dist[k+S+1]+1.4142);if(i>0)v=Math.min(v,dist[k+S-1]+1.4142);}dist[k]=v;}
    for(k=0;k<N;k++){var m=dist[k]*ts;data[k*4]=Math.round(255*clamp(1-m/5,0,1));data[k*4+1]=Math.round(255*clamp(1-m/16,0,1));data[k*4+3]=255;}
    var tex=new T.DataTexture(data,S,S,T.RGBAFormat);tex.magFilter=tex.minFilter=T.LinearFilter;tex.needsUpdate=true;return{tex:tex,box:box};
  }
  function buildSea(){
    var sh=shoreField();
    seaMat=new T.ShaderMaterial({vertexShader:SEA_VS,fragmentShader:SEA_FS,
      uniforms:{uSun:U.uSun,uMoon:U.uMoon,uNight:U.uNight,uTime:U.uTime,uFog:{value:.0046},uSunI:{value:1},uMoonI:{value:0},uLampI:{value:0},uPix:{value:.0008},
        uLamp:{value:LAMP},uBeam:{value:beamDir},uShore:{value:sh.tex},uShoreBox:{value:new T.Vector4(sh.box[0],sh.box[1],sh.box[2],sh.box[3])}}});
    var g=new T.PlaneGeometry(5000,5000,200,200);g.rotateX(-Math.PI/2);
    scene.add(new T.Mesh(g,seaMat));size();
  }

  /* ---------- the lighthouse: lime plaster in red and white bands, dressed stone, an iron gallery and lantern ---------- */
  function buildTower(){
    var g=new T.Group(),parts=0;g.position.set(LH.x,yardH,LH.z);scene.add(g);
    function plaster(hex,rough){var m=std(hex,rough||.86);if(scanned){m.map=TEX.wall_diff;m.normalMap=TEX.wall_nor;m.normalScale.set(.9,.9);}m.envMapIntensity=.6;return m;}
    var white=plaster(0xF2ECE2),red=plaster(0x9A3328,.8),iron=std(0x1C1D22,.42,.6),frame=std(0xEDE8DF,.6),pane=std(0x1D232B,.38,.2);
    // dressed stone for the plinth, the sills and the step: plain, so no turf grows on it
    var stone=std(0xCFC7B8,.88);if(scanned){stone.map=TEX.moss_diff;stone.normalMap=TEX.moss_nor;stone.normalScale.set(.55,.55);}
    var doorM=new T.MeshStandardMaterial({map:doorTex(),roughness:.5,metalness:0});
    function P(geo,mat,x,y,z){parts++;return put(g,geo,mat,x,y,z);}
    function trim(parent,list,mat,z,d){list.forEach(function(b){var m=new T.Mesh(new T.BoxGeometry(b[2],b[3],d),mat);m.position.set(b[0],b[1],z);m.castShadow=m.receiveShadow=true;parent.add(m);parts++;});}
    function rad(y){return 1.14+.48*Math.pow(1-y/TOWER,1.3);}
    // each band is a lathe; its UVs are set to metres so one plaster scan tiles evenly up the whole tower
    function band(y0,y1,mat){var pts=[];for(var i=0;i<=4;i++){var y=lerp(y0,y1,i/4);pts.push(new T.Vector2(rad(y),y));}
      var geo=new T.LatheGeometry(pts,48),uv=geo.attributes.uv,pp=geo.attributes.position;for(i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*3,pp.getY(i)/2.8);P(geo,mat);}
    P(new T.CylinderGeometry(2.1,2.35,.6,10),stone,0,.1,0);
    band(.4,2.2,white);band(2.2,4,red);band(4,6.6,white);band(6.6,8.4,red);band(8.4,TOWER,white);
    // the door and windows face the camera's side of the headland
    var fa=FA;
    function onTower(geo,mat,y,da,out){var a=fa+da,r=rad(y)+(out==null?-.04:out),m=P(geo,mat,Math.sin(a)*r,y,Math.cos(a)*r);m.rotation.y=a;return m;}
    // the door: panelled and painted, in a white architrave, with a stone step up to the plinth
    var dr=onTower(new T.BoxGeometry(.8,1.66,.12),doorM,1.23,0);trim(dr,[[0,.89,1.02,.12],[-.46,0,.1,1.66],[.46,0,.1,1.66]],frame,.04,.08);
    var st=P(new T.BoxGeometry(1.15,.2,.45),stone,Math.sin(fa)*2.55,.1,Math.cos(fa)*2.55);st.rotation.y=fa;
    // small deep-set windows up the stair, each with a stone sill. The glass sits just proud of the tapering wall (behind
    // it, the curve would swallow it) and the frame stands further out, so the pane reads as set back
    [[3.1,.35],[5.4,-.25],[7.6,.3],[9.7,-.2]].forEach(function(w){var pm=onTower(new T.BoxGeometry(.3,.52,.03),pane,w[0],w[1],.025);
      trim(pm,[[0,.3,.44,.08],[0,-.3,.44,.08],[-.19,0,.08,.52],[.19,0,.08,.52]],frame,.04,.08);trim(pm,[[0,-.38,.52,.07]],stone,.08,.16);});
    P(scaleUV(new T.CylinderGeometry(1.55,rad(TOWER),.5,40),3,.2),white,0,TOWER+.25,0);
    P(new T.CylinderGeometry(1.66,1.66,.16,40),iron,0,TOWER+.58,0);
    [TOWER+.86,TOWER+1.12].forEach(function(y){var m=P(new T.TorusGeometry(1.58,.028,6,64),iron,0,y,0);m.rotation.x=Math.PI/2;});
    for(var i=0;i<16;i++){var a=i/16*TAU;P(new T.CylinderGeometry(.025,.025,.55,5),iron,Math.sin(a)*1.58,TOWER+.92,Math.cos(a)*1.58);}
    P(scaleUV(new T.CylinderGeometry(1,1.04,.55,16),2,.2),red,0,TOWER+.94,0);
    for(i=0;i<8;i++){a=i/8*TAU+.2;P(new T.BoxGeometry(.05,1.3,.05),iron,Math.sin(a)*.95,LAMP_Y,Math.cos(a)*.95);}
    lampMesh=new T.Mesh(new T.SphereGeometry(.34,16,12),new T.MeshBasicMaterial({color:0x3a3428,toneMapped:false}));lampMesh.position.y=LAMP_Y;g.add(lampMesh);
    glassMat=new T.MeshStandardMaterial({color:lin(0x2a2f36),roughness:.08,metalness:.2,transparent:true,opacity:.42,depthWrite:false,emissive:lin(0xffb860),emissiveIntensity:0});
    var gls=new T.Mesh(new T.CylinderGeometry(.95,.95,1.3,16,1,true),glassMat);gls.position.y=LAMP_Y;g.add(gls);
    P(new T.ConeGeometry(1.14,.95,16),red,0,TOWER+3,0);
    P(new T.SphereGeometry(.16,10,8),iron,0,TOWER+3.55,0);
    P(new T.CylinderGeometry(.018,.018,.75,4),iron,0,TOWER+3.95,0);
    // what a click can hit: the tower (kept out of the scene, so nothing draws it)
    var ht=new T.Mesh(new T.CylinderGeometry(2.4,2.4,17,12),new T.MeshBasicMaterial({visible:false}));ht.position.set(LH.x,yardH+8.5,LH.z);ht.updateMatrixWorld();
    hits=[ht];
    LAMP.set(LH.x,yardH+LAMP_Y,LH.z);
    return parts;
  }

  /* ---------- the turf: grass, thrift and gorse over the top of the headland, and a gravel path ----------
     Each plant is three crossed cards with a painted clump on them, instanced by the thousand and nodding in the
     wind; their normals point up, so they take the light the way the ground under them does. They grow on the
     clifftop up to the lip, never on the yard's path or under the buildings, thickest round the lighthouse. */
  // where the clifftop is, in its final (pulled) shape: null over the wall and the sea
  function surfaceAt(x,z){var d=landD(x,z),w=cliffW(x,z);if(d>=w)return heightAt(x,z);
    var X=(d+.3)/(w+.3);if(X<.42)return null;
    var h=topAt(x,z,d)*(.97+(.84+(X-.33)/4.1875-.84)*.1875),dl=Math.hypot(x-LH.x,z-LH.z);
    return dl<11?lerp(h,yardH,1-sstep(6.5,10.5,dl)):h;}
  function plantTex(seed,kind){var S=256,cv=document.createElement("canvas");cv.width=cv.height=S;var x=cv.getContext("2d"),r=rng(seed),gorse=kind==="gorse",i;
    // short sea turf: mostly greens, a few sun-dried blades; gorse darker and denser
    var PAL=gorse?["#2C3A1C","#3B4A22","#4E5D2A"]:["#2E4318","#3A521E","#466024","#55692A","#667332"],TIP=gorse?null:["#7A8840","#86904A","#6E7F3A"];x.lineCap="round";
    for(i=0;i<(gorse?130:95);i++){var bx=S/2+(r()-.5)*S*.64,len=S*(.32+r()*.6),lean=(r()-.5)*S*.5,c0=PAL[(r()*PAL.length)|0],gr=x.createLinearGradient(0,S,0,S-len);
      gr.addColorStop(0,"#1E2812");gr.addColorStop(.4,c0);gr.addColorStop(1,gorse?c0:TIP[(r()*TIP.length)|0]);
      x.strokeStyle=gr;x.lineWidth=2+r()*3;x.beginPath();x.moveTo(bx,S);x.quadraticCurveTo(bx+lean*.25,S-len*.55,bx+lean,S-len);x.stroke();}
    if(kind){var fc=gorse?["#F2C230","#E8B020","#F6D35A"]:["#E07FA8","#EFA9C6","#D06A96"];
      for(i=0;i<(gorse?70:12);i++){x.fillStyle=fc[(r()*fc.length)|0];x.beginPath();x.arc(S/2+(r()-.5)*S*.6,S*(.14+r()*(gorse?.6:.26)),gorse?2.5+r()*3:4+r()*4,0,TAU);x.fill();}}
    var t=new T.CanvasTexture(cv);t.encoding=T.sRGBEncoding;t.anisotropy=ANI;return t;}
  function plantGeo(){var P=[],UV=[],I=[],N=[],n=0;
    for(var k=0;k<4;k++){var a=k*Math.PI/4,ca=Math.cos(a),sa=Math.sin(a);
      [[-.5,0],[.5,0],[.5,1],[-.5,1]].forEach(function(q){P.push(q[0]*ca,q[1],q[0]*sa);UV.push(q[0]+.5,q[1]);N.push(0,1,0);});I.push(n,n+1,n+2,n,n+2,n+3);n+=4;}
    var g=new T.BufferGeometry();g.setAttribute("position",new T.Float32BufferAttribute(P,3));g.setAttribute("uv",new T.Float32BufferAttribute(UV,2));g.setAttribute("normal",new T.Float32BufferAttribute(N,3));g.setIndex(I);return g;}
  // matte (Lambert), not physical: cards seen edge-on against a low sun would catch a grazing highlight and flare white
  // a warm tint holds the green against the cool sky that lights the shaded side of the headland; and looking toward the
  // low sun, the blades glow at their edges, the light coming through them (strongest at the tips, gone by night)
  var GLOW_U={value:new T.Color(0,0,0)},PLANT_M=[];
  function plantMat(tex){var m=new T.MeshLambertMaterial({map:tex,alphaTest:.3,side:T.DoubleSide,color:new T.Color(1.08,1.12,.74)});PLANT_M.push(m);
    m.onBeforeCompile=function(sh){sh.uniforms.uTime=U.uTime;sh.uniforms.uSun=U.uSun;sh.uniforms.uGlow=GLOW_U;
      sh.vertexShader="uniform float uTime;\nuniform vec3 uSun;\nvarying float vBack;\n"+sh.vertexShader.replace("#include <begin_vertex>",PLANT_SWAY).replace("#include <project_vertex>",PLANT_BACK);
      sh.fragmentShader="uniform vec3 uGlow;\nvarying float vBack;\n"+sh.fragmentShader.replace("#include <emissivemap_fragment>","#include <emissivemap_fragment>\ntotalEmissiveRadiance+=diffuseColor.rgb*uGlow*vBack;");};
    return m;}
  var PATH=[];
  function buildPlants(){
    var r=rng(61),dx=Math.sin(FA),dz=Math.cos(FA),i,t;
    // the path: from the tower's step, out across the yard and away inland
    var curve=new T.CatmullRomCurve3([new T.Vector3(LH.x+dx*2.9,0,LH.z+dz*2.9),new T.Vector3(LH.x+2.4,0,LH.z+2.6),new T.Vector3(LH.x+5.2,0,LH.z+.15),new T.Vector3(LH.x+9.8,0,LH.z-1.4),new T.Vector3(LH.x+16,0,LH.z-4.6),new T.Vector3(LH.x+25,0,LH.z-7.5)]);
    var n=120,pos=[],uv=[],idx=[],len=0,prev=null;
    for(i=0;i<=n;i++){var p=curve.getPoint(i/n),tg=curve.getTangent(i/n),wd=.48+(noise(i*.3,2)-.5)*.16;if(prev)len+=p.distanceTo(prev);prev=p;PATH.push([p.x,p.z]);
      [-1,1].forEach(function(sd){var px=p.x-tg.z*wd*sd,pz=p.z+tg.x*wd*sd,y=surfaceAt(px,pz);pos.push(px,(y===null?yardH:y)+.05,pz);uv.push(sd<0?0:1,len*.5);});
      if(i)idx.push(i*2-2,i*2-1,i*2,i*2-1,i*2+1,i*2);}
    var pg=new T.BufferGeometry();pg.setAttribute("position",new T.Float32BufferAttribute(pos,3));pg.setAttribute("uv",new T.Float32BufferAttribute(uv,2));pg.setIndex(idx);pg.computeVertexNormals();
    var path=new T.Mesh(pg,new T.MeshStandardMaterial({map:gravelTex(),roughness:.97,polygonOffset:true,polygonOffsetFactor:-2}));path.receiveShadow=true;scene.add(path);
    function pathDist(x,z){var best=1e9;for(var k=1;k<PATH.length;k++){var ax=PATH[k-1][0],az=PATH[k-1][1],bx=PATH[k][0]-ax,bz=PATH[k][1]-az,u=clamp(((x-ax)*bx+(z-az)*bz)/(bx*bx+bz*bz||1),0,1),qx=ax+bx*u-x,qz=az+bz*u-z;best=Math.min(best,qx*qx+qz*qz);}return Math.sqrt(best);}
    // nothing grows under the tower or on the path
    function blocked(x,z){return Math.hypot(x-LH.x,z-LH.z)<2.7||pathDist(x,z)<.62;}
    var sets={grass:[],thrift:[],gorse:[]};
    // within 32 m of the lighthouse; further out a clump would be smaller than a pixel, and the turf scan carries the hill
    for(t=0;t<30000&&sets.grass.length<6500;t++){
      var near=t%3!==0,a=r()*TAU,rr=near?Math.sqrt(r())*18:18+Math.sqrt(r())*14,x=LH.x+Math.cos(a)*rr+(near?0:5),z=LH.z+Math.sin(a)*rr;
      if(blocked(x,z))continue;var y=surfaceAt(x,z);if(y===null)continue;
      var kd=r(),set=kd<.05?sets.gorse:kd<.09?sets.thrift:sets.grass,s=set===sets.gorse?.9+r()*.7:set===sets.thrift?.4+r()*.25:.4+r()*.45;
      set.push([x,y-.03,z,s,r()*TAU]);}
    var geo=plantGeo(),o3=new T.Object3D(),made=0,HT={grass:.5,thrift:.75,gorse:.72};
    [["grass",plantTex(71,"")],["thrift",plantTex(83,"thrift")],["gorse",plantTex(97,"gorse")]].forEach(function(q){var list=sets[q[0]];if(!list.length)return;
      var im=new T.InstancedMesh(geo,plantMat(q[1]),list.length),tint=new T.Color();
      // each clump a little lighter or darker, greener or yellower than the next
      list.forEach(function(b,j){o3.position.set(b[0],b[1],b[2]);o3.rotation.set((r()-.5)*.12,b[4],(r()-.5)*.12);o3.scale.set(b[3]*1.1,b[3]*HT[q[0]],b[3]*1.1);o3.updateMatrix();im.setMatrixAt(j,o3.matrix);
        var v=.78+r()*.3,yl=r()*.12;im.setColorAt(j,tint.setRGB(v+yl,v+yl*.6,v-yl*.4));});
      im.receiveShadow=true;fx.add(im);made+=list.length;});
    return num(made)+" tufts of grass, thrift and gorse, "+Math.round(len)+" m of path";
  }

  /* ---------- the lamp: its light, its glow and the beam ---------- */
  var GLOW=null;
  function buildLamp(){
    GLOW=glowTex();
    // the lens throws the light into the beam: what spills reaches the lantern and the gallery, not the ground
    lampL=new T.PointLight(0xffc27a,0,13,2);lampL.position.copy(LAMP);scene.add(lampL);
    glow=new T.Sprite(new T.SpriteMaterial({map:GLOW,color:0xffd9a0,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,opacity:0}));
    glow.position.copy(LAMP);glow.scale.setScalar(7);fx.add(glow);
    var bm=new T.ShaderMaterial({vertexShader:BEAM_VS,fragmentShader:BEAM_FS,uniforms:{uLen:{value:170},uI:{value:0}},transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});
    var bg=new T.CylinderGeometry(.28,10,170,40,1,true);bg.translate(0,-85,0);bg.rotateX(-Math.PI/2);
    beam=new T.Group();beam.position.copy(LAMP);beam.mat=bm;fx.add(beam);
    [0,Math.PI].forEach(function(a){var w=new T.Group();w.rotation.y=a;var m=new T.Mesh(bg,bm);m.rotation.x=1.2*D;m.frustumCulled=false;w.add(m);beam.add(w);});
    beam.visible=false;
  }

  /* ---------- the sky dome and the far coasts ---------- */
  function buildSky(){
    sky=new T.Mesh(new T.SphereGeometry(1600,48,32),new T.ShaderMaterial({vertexShader:SKY_VS,fragmentShader:SKY_FS,uniforms:U,side:T.BackSide,depthWrite:false,fog:false}));
    sky.renderOrder=-1;sky.frustumCulled=false;scene.add(sky);
    // two layers of hills along the horizon, flat cut-outs coloured from the sky behind them
    [[-430,-760,-40,4,22,3],[-600,40,900,10,40,7]].forEach(function(q){var s=new T.Shape(),n=140,i;s.moveTo(q[1],-6);
      for(i=0;i<=n;i++){var x=lerp(q[1],q[2],i/n),taper=Math.min(1,Math.min(i,n-i)/18);s.lineTo(x,lerp(q[3],q[4],fbm(x*.006+q[5],q[5],4))*taper*taper);}
      s.lineTo(q[2],-6);var g=new T.ShapeGeometry(s);g.translate(0,0,q[0]);
      var m=new T.Mesh(g,new T.MeshBasicMaterial({color:0x888888,fog:false,toneMapped:false}));m.az=Math.atan2((q[1]+q[2])/2,-q[0]);ridges.push(m);scene.add(m);});
  }

  /* ---------- life: gulls round the lantern, and motes of dust and spray in the low sun ---------- */
  var GULL=[];
  function buildLife(){
    var wg=new T.BufferGeometry();wg.setAttribute("position",new T.Float32BufferAttribute([0,0,.2,0,0,-.16,.5,.09,.03,.5,.09,.03,0,0,-.16,1.15,-.05,-.2],3));wg.computeVertexNormals();
    var wm=new T.MeshBasicMaterial({color:0x2a2420,side:T.DoubleSide}),r=rng(3),n=7;
    gulls={R:new T.InstancedMesh(wg,wm,n),L:new T.InstancedMesh(wg,wm,n),o:new T.Object3D()};
    for(var i=0;i<n;i++)GULL.push({R:6+r()*10,h:yardH+7+r()*9,sp:(.16+r()*.14)*(r()<.3?-1:1),ph:r()*TAU,fl:5+r()*2.5,sc:.6+r()*.22,cx:LH.x-3+r()*4,cz:LH.z+3+r()*4});
    fx.add(gulls.R,gulls.L);
    var m=260,p=new Float32Array(m*3);for(i=0;i<m;i++){p[i*3]=lerp(-12,40,r());p[i*3+1]=lerp(1,24,r());p[i*3+2]=lerp(-50,8,r());}
    var dg=new T.BufferGeometry();dg.setAttribute("position",new T.BufferAttribute(p,3));
    dust=new T.Points(dg,new T.PointsMaterial({size:.16,map:GLOW,transparent:true,depthWrite:false,blending:T.AdditiveBlending,color:0xffd39a,opacity:.5}));fx.add(dust);
  }

  /* ---------- the climb: inside the tower ----------
     Bigger on the inside: a hall 11 m across, entered through the door, with a stone stair that winds up the wall
     round an open well. Each piece of work hangs at eye level beside the stair, its illustration in a dark frame under a
     brass picture light and its plaque to the right; windows between them glow with the hour outside. An iron ladder
     past the top step climbs to the hatch of the lantern room. The stair is a helix: slot s sits at angle s*dTh and
     height y0 + s*dY, the pieces at slots pre .. pre+N-1. */
  // the climb runs wherever the scene is a fixed layer; it moves only as the visitor scrolls, so it stays under reduced
  // motion too (with the idle drift off and no easing)
  var climbEl=FIXED&&o.climb?o.climb:null,fadeEl=o.fade||null,barEl=o.bar||null,works=[],hall=null;
  var HL={R:5.5,rIn:3.55,dTh:.74,dY:1.42,y0:.3,pre:1.5,post:1.3},hallHemi=null,hWinMat=null,winLights=[],camLight=null,hallDust=null;
  var UP=new T.Vector3(0,1,0),tA=new T.Vector3(),tB=new T.Vector3(),tC=new T.Vector3(),FA=Math.atan2(0-LH.x,34-LH.z);
  var WIN_DAY=new T.Color(1.25,.86,.58),WIN_NIGHT=new T.Color(.22,.3,.52),HH=[new T.Color(0xffe8d0),new T.Color(0x9fb0d8)],WL=[new T.Color(0xffc28a),new T.Color(0x8fa8e0)],HF=[new T.Color(0x2a221b),new T.Color(0x0d1018)];
  function hallPos(s,r,yo,out){var th=s*HL.dTh;return out.set(Math.cos(th)*r,HL.y0+s*HL.dY+(yo||0),Math.sin(th)*r);}
  // a matrix that stands a flat thing on the wall at angle th, facing the middle of the hall
  function onWall(th,y,r){return new T.Matrix4().compose(tA.set(Math.cos(th)*r,y,Math.sin(th)*r),new T.Quaternion().setFromAxisAngle(UP,Math.atan2(-Math.cos(th),-Math.sin(th))),tB.set(1,1,1));}
  function windowTex(){var c=document.createElement("canvas");c.width=64;c.height=128;var x=c.getContext("2d"),g=x.createLinearGradient(0,0,0,128);
    g.addColorStop(0,"#fff4dc");g.addColorStop(.55,"#ffd9a6");g.addColorStop(1,"#f0a878");x.fillStyle=g;x.fillRect(0,0,64,128);
    x.fillStyle="rgba(40,30,24,.85)";x.fillRect(30,0,4,128);x.fillRect(0,62,64,4);return new T.CanvasTexture(c);}
  function buildHall(){
    if(hall||!works.length||!built)return;
    var N=works.length,S=HL.pre+N+HL.post,R=HL.R,rIn=HL.rIn,yEnd=HL.y0+S*HL.dY,top=yEnd+3.4,i,j,L=new T.Matrix4(),q=new T.Quaternion(),one=new T.Vector3(1,1,1);
    HL.S=S;HL.yEnd=yEnd;HL.top=top;HL.thL=S*HL.dTh+.32;
    hall=new T.Scene();hall.fog=new T.FogExp2(HF[0].getHex(),.026);
    function mapped(hex,rough,d,n,ns){var m=std(hex,rough);if(scanned&&d){m.map=TEX[d];if(n){m.normalMap=TEX[n];m.normalScale.set(ns||1,ns||1);}}return m;}
    function lit(cv,glow){var t=new T.CanvasTexture(cv);t.encoding=T.sRGBEncoding;t.anisotropy=ANI;return new T.MeshStandardMaterial({map:t,emissiveMap:t,emissive:new T.Color(1,1,1),emissiveIntensity:glow,roughness:.62});}
    function hang(mesh,th,y,r){var M=onWall(th,y,r);mesh.matrix.copy(M);mesh.matrixAutoUpdate=false;hall.add(mesh);return M;}
    var iron=std(0x1E1F23,.45,.6),brass=std(0xB38C4E,.35,.8),wood=std(0x2A1D15,.6);
    // the wall, the floor and the ceiling: lime plaster and stone flags
    var wallM=mapped(0xE6DBC9,.93,"wall_diff","wall_nor",.9);wallM.side=T.BackSide;
    hall.add(new T.Mesh(scaleUV(new T.CylinderGeometry(R,R,top+1,96,1,true),Math.round(TAU*R/2.6),(top+1)/2.6),wallM).translateY((top+1)/2-.5));
    var fl=new T.Mesh(scaleUV(new T.CircleGeometry(R,64),3,3),mapped(0xA9A294,.9,"moss_diff","moss_nor"));fl.rotation.x=-Math.PI/2;hall.add(fl);
    var ce=new T.Mesh(new T.CircleGeometry(R,64),mapped(0xD9CFBD,.95,"wall_diff"));ce.rotation.x=Math.PI/2;ce.position.y=top;hall.add(ce);
    // the stair: stone treads cantilevered from the wall, iron balusters, a brass handrail on the inner edge
    var sd=6.5*D,ns=Math.ceil(S*HL.dTh/sd)+1,rise=HL.dY*sd/HL.dTh,rm=(rIn+R)/2;
    var steps=new T.InstancedMesh(new T.BoxGeometry(R-rIn+.3,.16,rm*sd*1.18),mapped(0xF2EBDD,.85,"moss_diff","moss_nor",.6),ns),bal=new T.InstancedMesh(new T.CylinderGeometry(.015,.015,.92,6),iron,ns);
    for(i=0;i<ns;i++){var th=i*sd,y=HL.y0+i*rise;
      steps.setMatrixAt(i,L.compose(tA.set(Math.cos(th)*(rm+.08),y-.08,Math.sin(th)*(rm+.08)),q.setFromAxisAngle(UP,-th),one));
      bal.setMatrixAt(i,L.compose(tA.set(Math.cos(th)*(rIn+.07),y+.46,Math.sin(th)*(rIn+.07)),q.identity(),one));}
    hall.add(steps,bal);
    var pts=[],wpts=[];for(i=0;i<=240;i++){pts.push(hallPos(i/240*S,rIn+.07,.93,new T.Vector3()));wpts.push(hallPos(i/240*S,R-.09,.9,new T.Vector3()));}
    hall.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),900,.03,6,false),brass));
    // and a second rail along the wall, as lighthouse stairs have
    hall.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(wpts),900,.022,6,false),iron));
    // a landing past the last step, in front of the ladder
    var land=new T.Mesh(new T.BoxGeometry(R-rIn+.3,.2,1.9),steps.material);land.position.set(Math.cos(S*HL.dTh+.2)*(rm+.08),yEnd-.1,Math.sin(S*HL.dTh+.2)*(rm+.08));land.rotation.y=-(S*HL.dTh+.2);hall.add(land);
    // (the middle is an open well, as in towers whose stairs are cantilevered from the wall: from the top you can see
    // down the whole spiral to the floor)
    // the work: illustration, frame, picture light, plaque; and a window in each gap
    var artG=new T.PlaneGeometry(1.4,.7875),plG=new T.PlaneGeometry(.76,.95),winG=new T.PlaneGeometry(.52,1.04);
    var bars=new T.InstancedMesh(new T.BoxGeometry(1,1,1),wood,N*4+(N-1)*4),lamps=new T.InstancedMesh(new T.CylinderGeometry(.028,.028,.5,8),brass,N),nb=0;
    hWinMat=new T.MeshBasicMaterial({map:windowTex(),color:WIN_DAY.clone(),toneMapped:false});
    var FB=[[0,.4338,1.56,.08],[0,-.4338,1.56,.08],[-.74,0,.08,.7875],[.74,0,.08,.7875]],WB=[[0,.56,.62,.08],[0,-.56,.62,.08],[-.3,0,.08,1.04],[.3,0,.08,1.04]];
    // hung as stairwell galleries are: each thing at a set height above the step beneath it, so the row climbs with the stair
    function above(s,da,h){return HL.y0+(s+da/HL.dTh)*HL.dY+h;}
    works.forEach(function(w,i){var s=HL.pre+i,th=s*HL.dTh;
      var M=hang(new T.Mesh(artG,lit(w.cover,.42)),th-.085,above(s,-.085,1.74),R-.07);
      FB.forEach(function(b){bars.setMatrixAt(nb++,new T.Matrix4().multiplyMatrices(M,L.compose(tA.set(b[0],b[1],.015),q.identity(),tB.set(b[2],b[3],.05))));});
      lamps.setMatrixAt(i,new T.Matrix4().multiplyMatrices(M,L.compose(tA.set(0,.5,.13),q.setFromAxisAngle(tC.set(0,0,1),Math.PI/2),one)));
      hang(new T.Mesh(plG,lit(w.plaque,.32)),th+.175,above(s,.175,1.6),R-.06);
      if(i<N-1){var MW=hang(new T.Mesh(winG,hWinMat),th+.385,above(s,.385,2.05),R-.04);
        WB.forEach(function(b){bars.setMatrixAt(nb++,new T.Matrix4().multiplyMatrices(MW,L.compose(tA.set(b[0],b[1],.02),q.identity(),tB.set(b[2],b[3],.08))));});}
    });
    bars.count=nb;hall.add(bars,lamps);
    // the ladder and the hatch to the lantern room
    var ML=onWall(HL.thL,(yEnd+top)/2,R-.02),lh=top-yEnd+.4;
    [-.26,.26].forEach(function(dx){var m=new T.Mesh(new T.BoxGeometry(.05,lh,.05),iron);m.matrix.multiplyMatrices(ML,L.compose(tA.set(dx,0,.4),q.identity(),one));m.matrixAutoUpdate=false;hall.add(m);});
    var rungs=new T.InstancedMesh(new T.BoxGeometry(.52,.035,.035),iron,Math.floor(lh/.3));
    for(i=0;i<rungs.count;i++)rungs.setMatrixAt(i,new T.Matrix4().multiplyMatrices(ML,L.compose(tA.set(0,-lh/2+.25+i*.3,.4),q.identity(),one)));
    hall.add(rungs);
    var hatch=new T.Mesh(new T.PlaneGeometry(1.15,1.15),new T.MeshBasicMaterial({color:new T.Color(2.2,1.9,1.5),toneMapped:false}));
    hatch.position.set(Math.cos(HL.thL)*(R-.75),top-.02,Math.sin(HL.thL)*(R-.75));hatch.rotation.set(Math.PI/2,0,-HL.thL);hall.add(hatch);
    // light: the sky through the windows, a lantern carried up the stair, the bright hatch
    hallHemi=new T.HemisphereLight(0xffe8d0,0x2c2219,.55);hall.add(hallHemi);
    camLight=new T.PointLight(0xffd3a2,1.35,9.5,2);hall.add(camLight);
    for(j=0;j<3;j++){var Lp=new T.PointLight(0xffc28a,.9,9,2);hallPos(HL.pre+(N-1)*(j+.5)/3+.4,R-1.3,2.4,Lp.position);hall.add(Lp);winLights.push(Lp);}
    var hl=new T.PointLight(0xfff0d6,1.8,12,2);hl.position.copy(hatch.position).y-=.5;hall.add(hl);
    // dust turning in the air
    var nd=420,dp=new Float32Array(nd*3),r=rng(41);for(i=0;i<nd;i++){var a=r()*TAU,rr=Math.sqrt(r())*(R-.4);dp[i*3]=Math.cos(a)*rr;dp[i*3+1]=r()*top;dp[i*3+2]=Math.sin(a)*rr;}
    var dg=new T.BufferGeometry();dg.setAttribute("position",new T.BufferAttribute(dp,3));
    hallDust=new T.Points(dg,new T.PointsMaterial({size:.035,map:GLOW,transparent:true,depthWrite:false,blending:T.AdditiveBlending,color:0xffdcb0,opacity:.55}));hall.add(hallDust);
    hallApplyK(U.uNight.value);
    // compile and upload everything now, so the first step through the door doesn't stutter
    renderer.compile(hall,camera);var wrt=new T.WebGLRenderTarget(16,16);
    hall.traverse(function(n){if(n.isMesh||n.isPoints){n.fc=n.frustumCulled;n.frustumCulled=false;}});
    renderer.setRenderTarget(wrt);renderer.render(hall,camera);renderer.setRenderTarget(null);
    hall.traverse(function(n){if(n.isMesh||n.isPoints)n.frustumCulled=n.fc;});wrt.dispose();
  }
  function hallApplyK(e){if(!hall)return;hWinMat.color.copy(WIN_DAY).lerp(WIN_NIGHT,e);hallHemi.color.copy(HH[0]).lerp(HH[1],e);hallHemi.intensity=lerp(.55,.4,e);
    winLights.forEach(function(L){L.color.copy(WL[0]).lerp(WL[1],e);L.intensity=lerp(.9,.55,e);});hall.fog.color.copy(HF[0]).lerp(HF[1],e);}
  function hallReady(){if(!hall)buildHall();return !!hall;}
  function cTop(){return C_W0+works.length*PER+C_LEFT;}
  var cS=null,cV=0,climbState={phase:"?",index:-2},AP=null,ENTRY=null,END=null,VD=null;
  /* how far into the climb section the page is, in screens. A critically damped spring follows the scroll, so the
     camera gathers speed and comes to rest smoothly instead of lurching at each notch of the wheel; under reduced
     motion it follows the scroll exactly */
  function climbC(dt){if(!climbEl)return null;var raw=-climbEl.getBoundingClientRect().top/innerHeight;
    if(cS===null||Math.abs(raw-cS)>2.5||reduce){cS=raw;cV=0;return cS;}
    var h=Math.min(dt,64)/1000,n=Math.max(1,Math.ceil(h/.016)),w=6.5;h/=n;
    for(var i=0;i<n;i++){cV+=(w*w*(raw-cS)-2*w*cV)*h;cS+=cV*h;}
    if(Math.abs(raw-cS)<2e-4&&Math.abs(cV)<2e-3){cS=raw;cV=0;}
    return cS;}
  function state(ph,idx){if(ph===climbState.phase&&idx===climbState.index)return;climbState.phase=ph;climbState.index=idx;if(o.onClimb)o.onClimb({phase:ph,index:idx});}
  var dA=new T.Vector3(),dB=new T.Vector3(),pA=new T.Vector3(),pB=new T.Vector3();
  function aimAt(p,target,out){return out.subVectors(target,p).normalize();}
  // turn from one view direction to another evenly (a normalised lerp), never swinging round through the camera
  function blendDir(a,b,w,out){out.copy(a).lerp(b,w);var l=out.length();return l<1e-4?out.copy(b):out.multiplyScalar(1/l);}
  // outside: over the sea, up over the cliff edge, across the yard and in at the door
  function approachPose(c){
    if(!AP){var dx=Math.sin(FA),dz=Math.cos(FA);AP={door:new T.Vector3(LH.x+dx*.6,yardH+1.4,LH.z+dz*.6),mid:new T.Vector3(LH.x,yardH+8,LH.z),
      path:new T.CatmullRomCurve3([base.clone(),new T.Vector3(5,7.5,12),new T.Vector3(11,10.6,-8),new T.Vector3(LH.x+dx*5.2-.5,yardH+1.8,LH.z+dz*5.2),new T.Vector3(LH.x+dx*2.6,yardH+1.5,LH.z+dz*2.6)])};}
    var a=sstep(0,1,(c+.75)/(C_DOOR+.75));
    camera.position.lerp(AP.path.getPoint(a),sstep(0,.12,a));
    look.lerp(AP.mid,sstep(0,.55,a)).lerp(AP.door,sstep(.6,1,a));
  }
  /* inside, the walk: on the stair beside its handrail, at a steady pace that eases a little at each piece (never
     stopping, never rushing); the gaze rests on the wall a few steps ahead, at the height the work hangs, so each piece
     and its plaque come into view, settle in the middle of the frame and move on, while the view turns only as fast as
     the stair does. Every phase begins exactly where the last one ends, in place and in direction */
  // (lead is how far ahead along the wall the gaze rests, in radians: near enough that each piece is seen at about 27°
  // off square, so its plaque reads, with the head turned toward the wall the way a visitor's is)
  var WALK={rc:3.75,lead:.24,a:.5};
  function walkS(c){var u=(c-C_W0)/PER;return HL.pre+(.045-WALK.lead)/HL.dTh-.5+u+WALK.a*Math.sin(TAU*u)/TAU;}
  function walkGaze(s,out){var s2=s+WALK.lead/HL.dTh,th=s2*HL.dTh;return out.set(Math.cos(th)*(HL.R-.1),HL.y0+s2*HL.dY+1.5,Math.sin(th)*(HL.R-.1));}
  function hallPose(c){
    var N=works.length,cW=C_W0+N*PER,dir=dA,s,c0=C_IN-.08;
    if(c<C_W0){
      // in at the door and across the floor onto the first steps, the gaze moving from the spiral of work climbing the
      // far wall to the wall ahead. The pace eases in and arrives at the walk's own speed, so the climb carries straight on
      if(!ENTRY){var s1=walkS(C_W0);ENTRY=new T.CatmullRomCurve3([new T.Vector3(Math.cos(-.95)*2.7,1.62,Math.sin(-.95)*2.7),new T.Vector3(Math.cos(-.45)*3.4,1.68,Math.sin(-.45)*3.4),
          hallPos(0,WALK.rc,1.68,new T.Vector3()),hallPos(s1*.5,WALK.rc,1.68,new T.Vector3()),hallPos(s1,WALK.rc,1.68,new T.Vector3())],false,"centripetal");
        ENTRY.m1=(1+WALK.a*Math.cos(0))/PER*Math.hypot(WALK.rc*HL.dTh,HL.dY)*(C_W0-c0)/ENTRY.getLength();}
      var x=clamp((c-c0)/(C_W0-c0),0,1),t=-2*x*x*x+3*x*x+ENTRY.m1*(x*x*x-x*x);
      ENTRY.getPointAt(clamp(t,0,1),camera.position);
      aimAt(camera.position,hallPos(HL.pre+1.4,HL.R-.3,1.2,tC),dB);aimAt(camera.position,walkGaze(walkS(C_W0),tC),pA);
      blendDir(dB,pA,sstep(.3,1,x),dir);state("inside",-1);}
    else if(c<cW){
      var u=(c-C_W0)/PER;s=walkS(c);hallPos(s,WALK.rc,1.68,camera.position);aimAt(camera.position,walkGaze(s,tC),dir);
      state("work",clamp(Math.round(u-.5),0,N-1));}
    else{
      // on up the last steps, slowing to a stop on the landing; a lean over the rail to look down the open well at the
      // whole spiral of work, the gaze travelling slowly round it; then across to the ladder and up it, toward the light
      var t2=(c-cW)/C_LEFT,s0=walkS(cW),tau=clamp(t2/.24,0,1),m0=(1+WALK.a)/PER*C_LEFT*.24,S=HL.S,ta3=tau*tau*tau,ta2=tau*tau;
      s=(2*ta3-3*ta2+1)*s0+(ta3-2*ta2+tau)*m0+(-2*ta3+3*ta2)*S;
      hallPos(s,WALK.rc,1.68,pA);aimAt(pA,walkGaze(s,tC),dA);
      // (each of these turns takes a third of a screen or more of scroll, so none of them snaps; the gaze lifts from
      // the well before the turn to the ladder, so that turn is mostly a turn of the head, not a nod)
      var thl=(S+.15)*HL.dTh,sw=sstep(.4,.56,t2)*.6,lift=sstep(.48,.6,t2);
      hallPos(S+.15,HL.rIn-.2,1.55,pB);aimAt(pB,tC.set(Math.cos(thl+2.5+sw)*3,lerp(HL.yEnd-6.5,HL.yEnd-1.5,lift),Math.sin(thl+2.5+sw)*3),dB);
      var wl=sstep(.18,.42,t2);camera.position.copy(pA).lerp(pB,wl);blendDir(dA,dB,wl,dir);
      var wL=sstep(.56,.84,t2);
      if(wL>0){pA.set(Math.cos(HL.thL)*(HL.R-1.2),lerp(HL.yEnd+1.68,HL.top+.5,sstep(.74,1,t2)),Math.sin(HL.thL)*(HL.R-1.2));camera.position.lerp(pA,wL);
        aimAt(camera.position,tC.set(Math.cos(HL.thL)*(HL.R-.72),lerp(HL.yEnd+1.3,HL.top+1,sstep(.7,.97,t2)),Math.sin(HL.thL)*(HL.R-.72)),dB);
        // turn round to the ladder always the same way (the way it is shortest from the rail), turning by yaw and pitch
        var dy=wrapPI(yawPitch(dB)[0]-yawPitch(dir)[0]);if(HL.ladSign==null)HL.ladSign=dy>=0?1:-1;if(HL.ladSign>0&&dy<0)dy+=TAU;if(HL.ladSign<0&&dy>0)dy-=TAU;
        turnDir(dir,dB,dy,wL,dir);}
      state(t2<.56?"overview":"top",-1);}
    camLight.position.copy(camera.position).y+=.35;
    look.copy(camera.position).add(dir);
  }
  /* the end, outside. Out on the gallery the sun goes down over the sea (the scroll runs the clock on to night,
     whatever the hour on the page) and the lamp catches behind you. You turn round to face it; then the camera draws
     back off the gallery and round the point over the water, the lighthouse always in view, and comes to rest out at sea
     like a boat on the swell, the lighthouse in the right of the frame. The beam swings round onto it, and the lamp
     spells HELLO in Morse */
  function yawPitch(v){return[Math.atan2(v.x,v.z),Math.asin(clamp(v.y,-1,1))];}
  // a turn by yaw and pitch, the long way round when dYaw says so (a lerp of opposite directions would flip at once)
  function turnDir(a,b,dYaw,w,out){var A=yawPitch(a),B=yawPitch(b),y=A[0]+dYaw*w,p=lerp(A[1],B[1],w);return out.set(Math.sin(y)*Math.cos(p),Math.sin(p),Math.cos(y)*Math.cos(p));}
  function endPose(e,ts){
    if(!END){VD=dirOf(-12*D,-5*D);var vh=new T.Vector3(VD.x,0,VD.z).normalize();
      END=new T.CatmullRomCurve3([new T.Vector3(LH.x+vh.x*1.34,yardH+TOWER+2.35,LH.z+vh.z*1.34),new T.Vector3(LH.x+vh.x*9,yardH+TOWER+4,LH.z+vh.z*9),
        new T.Vector3(LH.x-32,yardH+9,LH.z-4),new T.Vector3(LH.x-15.2,9,LH.z+52.9)],false,"centripetal");}
    // (the camera starts drawing back while it turns, so by the time it faces the lamp it is well off the gallery)
    var m=reduce?0:1,tf=sstep(.55,1.38,e);
    END.getPointAt(tf,camera.position);
    if(e<.82){if(tf<=0)camera.position.x+=Math.sin(ts*.1)*.04*m;aimAt(camera.position,LAMP,dB);
      // the gaze out to sea, and the turn round to the lamp by way of the headland and its turf below
      var wt=sstep(.42,.82,e),dy=wrapPI(yawPitch(dB)[0]-yawPitch(VD)[0]);if(dy>0)dy-=TAU;turnDir(VD,dB,dy,wt,dA);}
    else{aimAt(camera.position,LAMP,dA);
      // at rest the frame turns a little left, so the lighthouse sits right of the words
      var off=sstep(.82,1,tf)*.17;if(off>0){dB.set(0,1,0).cross(dA).normalize();dA.multiplyScalar(Math.cos(off)).addScaledVector(dB,Math.sin(off)).normalize();}
      camera.position.y+=(Math.sin(ts*.9)*.12+Math.sin(ts*.53)*.08)*m*sstep(.85,1,tf);}
    look.copy(camera.position).add(dA);
    state(e<.82?"lantern":e<1.4?"sweep":"signal",-1);
  }
  function fadeFor(c){var t=cTop();if(c<C_DOOR)return[sstep(C_DOOR-.12,C_DOOR,c),"#000"];if(c<C_IN)return[1-sstep(C_DOOR,C_IN,c),"#000"];
    if(c<t)return[sstep(t-.12,t,c),"#fff3e0"];return[1-sstep(t,t+.14,c),"#fff3e0"];}
  var fadeA="",fadeC="";
  function setFade(a,col){if(!fadeEl)return;var s=a.toFixed(3);if(s!==fadeA){fadeEl.style.opacity=s;fadeA=s;}if(col!==fadeC){fadeEl.style.background=col;fadeC=col;}}

  /* ---------- light ---------- */
  var key=new T.DirectionalLight(0xffffff,2.5),fill=new T.DirectionalLight(0xffffff,.4),hemi=new T.HemisphereLight(0xffffff,0x000000,.5);
  key.castShadow=true;key.shadow.mapSize.set(2048,2048);
  var sc=key.shadow.camera;sc.left=-30;sc.right=30;sc.top=30;sc.bottom=-30;sc.near=1;sc.far=280;key.shadow.bias=-.0008;key.shadow.normalBias=.12;
  fill.position.set(-30,24,60);
  scene.add(key,key.target,fill,hemi);
  var SUN_HI=new T.Color(0xffb766),SUN_LO=new T.Color(0xff7a3a),MOONC=new T.Color(0xa9c0ff);
  // the fill is the evening sky behind the camera: mauve and cool, so rock in shadow reads as sky-lit, not lamp-lit
  var HS=[new T.Color(0x8a90c4),new T.Color(0x22305e)],HG=[new T.Color(0x6a4a34),new T.Color(0x0a0d18)],FL=[new T.Color(0xb7a6bc),new T.Color(0x5a6fb0)];
  var RIDGE_DARK=[[.36,.25,.31],[.012,.014,.028]],kd=new T.Vector3();
  var k=o.night?1:0,kT=k,lampK=k,sunUp=1,kA=-1,beamA=.9,mT=0,mKey="";
  function wrapPI(a){a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;}
  // where the lamp is in its word, after ms of signalling: on or off, which letter and which dot or dash
  function morse(ms){var tt=ms%MTOTAL,acc=0,q=MSEQ[0];for(var i=0;i<MSEQ.length;i++){q=MSEQ[i];acc+=q[1]*MUNIT;if(tt<acc)break;}
    var key=q[0]+":"+q[2]+":"+q[3];if(key!==mKey){mKey=key;if(o.onMorse)o.onMorse({on:q[0],li:q[2],si:q[3]});}
    // a shuttered lamp: a quick rise and fall at the edges of each flash
    return q[0]?lerp(.05,1,clamp(Math.min(tt-(acc-q[1]*MUNIT),acc-tt)/45,0,1)):.05;}
  function applyK(kk){
    kA=kk;var e=kk*kk*(3-2*kk),sk=sstep(0,.62,kk),mk=sstep(.25,1,kk);
    // the sun sets over the first 60% of the change; the moon rises over the last 75%
    sunDir.copy(dirOf(lerp(5,9,sk)*D,lerp(4.6,-9,sk)*D));moonDir.copy(dirOf(lerp(-8,3,mk)*D,lerp(-6,19,mk)*D));
    U.uSun.value.copy(sunDir);U.uMoon.value.copy(moonDir);U.uNight.value=e;
    sunUp=clamp((sunDir.y+.02)/.1,0,1);var moonUp=clamp(moonDir.y/.2,0,1);
    if(sunUp>0){kd.copy(sunDir);kd.y=Math.max(kd.y,.05);key.color.copy(SUN_HI).lerp(SUN_LO,1-sunUp);key.intensity=2.7*Math.pow(sunUp,.8);}
    else{kd.copy(moonDir);kd.y=Math.max(kd.y,.08);key.color.copy(MOONC);key.intensity=.55*moonUp;}
    GLOW_U.value.copy(SUN_HI).multiplyScalar(1.9*sunUp*(1-e));
    // under the moon the turf goes dark and grey-green, not blue
    PLANT_M.forEach(function(pm){pm.color.setRGB(lerp(1.08,.66,e),lerp(1.12,.78,e),lerp(.74,.42,e));});
    kd.normalize();key.target.position.set(LH.x,yardH,LH.z);key.position.copy(key.target.position).addScaledVector(kd,130);
    hemi.color.copy(HS[0]).lerp(HS[1],e);hemi.groundColor.copy(HG[0]).lerp(HG[1],e);hemi.intensity=lerp(.62,.42,e);
    fill.color.copy(FL[0]).lerp(FL[1],e);fill.intensity=lerp(.42,.16,e);
    // the haze takes the colour of the horizon behind the headland
    var hz=skyJS(new T.Vector3(LH.x,0,LH.z-34).normalize(),sunDir,moonDir,e);scene.fog.color.setRGB(hz[0],hz[1],hz[2]);scene.fog.density=lerp(.0042,.0036,e);
    ridges.forEach(function(m,i){var c=skyJS(new T.Vector3(Math.sin(m.az),.01,-Math.cos(m.az)),sunDir,moonDir,e),dk=RIDGE_DARK,s=i?.34:.2;
      m.material.color.setRGB(lerp(c[0],lerp(dk[0][0],dk[1][0],e),s),lerp(c[1],lerp(dk[0][1],dk[1][1],e),s),lerp(c[2],lerp(dk[0][2],dk[1][2],e),s)).convertSRGBToLinear();});
    if(seaMat){seaMat.uniforms.uSunI.value=sunUp*(1-e*.6);seaMat.uniforms.uMoonI.value=moonUp*e;}
    if(dust){dust.material.color.set(0xffd39a).lerp(new T.Color(0x9db4ff),e);dust.material.opacity=lerp(.5,.18,e);}
    if(gulls)gulls.L.visible=gulls.R.visible=e<.55;
    renderer.toneMappingExposure=lerp(1,1.22,e);renderer.shadowMap.needsUpdate=true;
    hallApplyK(e);
  }
  function lamp(kk,t,mf){
    var f=kk<1&&kk>0?.75+.25*Math.abs(Math.sin(t*.037)*Math.sin(t*.011)):1,L=kk*f*(mf==null?1:mf);
    if(lampMesh)lampMesh.material.color.setRGB(lerp(.05,2.2,L),lerp(.045,1.9,L),lerp(.04,1.45,L));
    if(glassMat)glassMat.emissiveIntensity=1.4*L;
    if(lampL)lampL.intensity=2.4*L;
    if(beam){beam.visible=L>.005;beam.mat.uniforms.uI.value=L;}
    if(seaMat)seaMat.uniforms.uLampI.value=L;
    return L;
  }

  /* ---------- camera, size, pointer ---------- */
  var base=new T.Vector3(0,5.6,34),look=new T.Vector3(),ptr={x:0,y:0,tx:0,ty:0},fov0=40;
  function size(){W=host.clientWidth||innerWidth;H=host.clientHeight||innerHeight;renderer.setSize(W,H,false);var a=W/H;
    camera.aspect=a;fov0=camera.fov=a<.8?56:a<1.3?46:40;lookX=a<1?11.7:a<1.45?5:0;camera.updateProjectionMatrix();
    if(seaMat)seaMat.uniforms.uPix.value=fov0*D/H;}
  var ray=new T.Raycaster(),ndc=new T.Vector2(),hot=false;
  var CONTENT=o.content||"a,button,input,textarea,select,label,.card,.sheet,.filters,.hero-copy,footer";
  function overScene(e){var t=e.target;if(!FIXED)return host.contains(t);return !(t&&t.closest&&t.closest(CONTENT));}
  // the lighthouse answers clicks only while the hero is in view, not through the veil behind the work
  function pick(cx,cy){if(!hits.length||FIXED&&(window.scrollY||0)>(o.hero?o.hero.offsetHeight*.7:H))return false;var r=host.getBoundingClientRect();if(cx<r.left||cx>r.right||cy<r.top||cy>r.bottom)return false;
    ndc.set((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera);return ray.intersectObjects(hits,false).length>0;}
  addEventListener("pointermove",function(e){ptr.tx=e.clientX/innerWidth*2-1;ptr.ty=e.clientY/innerHeight*2-1;
    var h=ready&&e.pointerType==="mouse"&&overScene(e)&&pick(e.clientX,e.clientY);if(h!==hot){hot=h;if(o.onHot)o.onHot(h);}},{passive:true});
  addEventListener("click",function(e){if(ready&&overScene(e)&&pick(e.clientX,e.clientY)&&o.onToggle)o.onToggle();});
  var visible=true;
  if(!FIXED&&window.IntersectionObserver)new IntersectionObserver(function(en){visible=en[0].isIntersecting;}).observe(host);
  var rt=0;addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(size,120);});

  /* ---------- the build, step by step: with the twin each step is a line in its log ---------- */
  var twinOn=!!tw,twinStart=0,wireFade=0,built=false,ready=false,firstWire=true,done=0;
  var wire=new T.ShaderMaterial({vertexShader:WIRE_VS,fragmentShader:WIRE_FS,wireframe:true,transparent:true,depthWrite:false,fog:false,
    uniforms:{uR:{value:0},uA:{value:1},uO:{value:new T.Vector3(LH.x,0,LH.z)},uCol:{value:new T.Color(0x3EEFD8)}}});
  var STEPS=[
    ["renderer","orchestrator","starting the renderer",function(){size();return"webgl"+(renderer.capabilities.isWebGL2?"2":"")+" · "+W+"×"+H+" @"+PR.toFixed(1)+"x";}],
    ["scans","archivist","fetching stone scans",function(){return loadScans().then(function(ok){scanned=ok;return ok?"stone scans · "+SCANS.length+" maps":"no stone scans · flat colour";});}],
    ["land","surveyor","surveying the headland",function(){buildLand();return"headland · "+num(verts)+" vertices, cliffs pulled upright";}],
    ["rocks","surveyor","placing stacks and scree",function(){return buildRocks();}],
    ["sea","hydrographer","laying the sea",function(){buildSea();return"sea · 14 wave trains, surf on every rock";}],
    ["tower","mason","raising the tower",function(){return"tower and lantern · "+buildTower()+" parts";}],
    ["plants","gardener","sowing the turf",function(){return buildPlants();}],
    ["lamp","keeper","trimming the lamp",function(){buildLamp();return"lamp and beam · a turn every 9 s";}],
    ["sky","weather","drawing the sky",function(){buildSky();buildLife();return"sky dome, clouds, "+GULL.length+" gulls";}],
    ["compile","renderer","compiling shaders",function(){applyK(k);lamp(lampK,0);renderer.compile(scene,camera);return"shaders compiled";}]
  ];
  function step(i){
    if(i>=STEPS.length){built=true;if(tw)tw.line("light","renderer","lighting the stone");else startLoop();if(works.length&&climbEl)setTimeout(buildHall,900);return;}
    var s=STEPS[i];if(tw)tw.line(s[0],s[1],s[2]);
    setTimeout(function(){var a=performance.now();
      Promise.resolve().then(function(){return s[3]();}).then(function(txt){done++;
        if(tw)tw.line(s[0],s[1],txt+" · "+Math.round(performance.now()-a)+" ms",true);
        if(s[0]==="land"&&tw){twinStart=performance.now();startLoop();}
        step(i+1);}).catch(function(err){console.error(err);fail();});},tw?70:0);
  }
  function fail(){twinOn=false;if(raf)cancelAnimationFrame(raf);raf=0;host.classList.remove("on");if(tw)tw.end();if(o.onReady)o.onReady(false);}
  function handover(){twinOn=false;wireFade=reduce?0:1;renderer.shadowMap.needsUpdate=true;
    if(tw){tw.line("light","renderer","first frame · stone lit",true);tw.sync(1);tw.end();}
    ready=true;if(o.onReady)o.onReady(true);}

  /* ---------- the frame ---------- */
  var raf=0,last=0,t0=performance.now(),vp=new T.Vector3(),slow=0,frames=0,flare=o.flare,rays=o.rays;
  function startLoop(){if(!raf)raf=requestAnimationFrame(frame);}
  function wireOnly(){sky&&(sky.visible=false);fx.visible=false;scene.overrideMaterial=wire;renderer.render(scene,camera);scene.overrideMaterial=null;fx.visible=true;sky&&(sky.visible=true);}
  function frame(t){
    raf=requestAnimationFrame(frame);
    if(document.hidden||!visible){last=t;return;}
    var dt=Math.min(100,t-(last||t));last=t;var ts=(t-t0)/1000,m=reduce?0:1;
    // the hour: the page's own, run on toward night by the scroll at the end of the climb
    var c=climbC(dt),eEnd=c!==null&&works.length?c-cTop():-1,endN=eEnd>0?sstep(.1,.55,eEnd):0;
    if(k!==kT){var st=reduce?1:dt/7000;k=k<kT?Math.min(kT,k+st):Math.max(kT,k-st);}
    var kE=k+(1-k)*endN;if(kE!==kA)applyK(kE);
    var lt=kE>.5?1:0;if(lampK!==lt){var ls=reduce?1:dt/(lt?1500:1100);lampK=lampK<lt?Math.min(lt,lampK+ls):Math.max(lt,lampK-ls);}
    U.uTime.value=reduce?0:ts;
    // the camera: a slow drift and the pointer in the hero; then, on desktop, the scroll flies it in at the door and up
    // the stair (on touch screens it only rises a little as the hero scrolls away)
    ptr.x+=(ptr.tx-ptr.x)*.04;ptr.y+=(ptr.ty-ptr.y)*.04;
    var sy=window.scrollY||0,hh=o.hero?o.hero.offsetHeight:H,q=reduce||climbEl?0:sstep(0,1,sy/Math.max(1,hh));
    camera.position.set(base.x+m*Math.sin(ts*.08)*1.6+ptr.x*1.2*m+(lookX?3:0),base.y+m*Math.sin(ts*.11)*.15-ptr.y*.3*m+q*2.6,base.z-m*(1-Math.cos(ts*.06))*1.2-q*5);
    look.set(lookX,9.5+q*1.2,-40);
    var inside=false,near=.5,fov=fov0,fd=[0,"#000"];
    if(c!==null&&c>-1&&works.length){fd=fadeFor(c);
      if(c<C_DOOR){approachPose(c);state(c>-.6&&c<.16?"approach":"flight",-1);}
      else if(eEnd<0){if(hallReady()){inside=true;hallPose(c);near=.05;fov=58;}else{approachPose(C_DOOR);fd=[1,"#000"];}}
      else{endPose(eEnd,ts);near=eEnd<.86?.08:.5;}}
    else if(climbEl)state("",-1);
    if(camera.near!==near||camera.fov!==fov){camera.near=near;camera.fov=fov;camera.updateProjectionMatrix();}
    setFade(fd[0],fd[1]);
    if(barEl&&c!==null&&works.length){var bp=clamp((c-C_IN)/(cTop()-C_IN),0,1).toFixed(3);if(barEl._p!==bp){barEl._p=bp;barEl.style.transform="scaleY("+bp+")";}}
    camera.lookAt(look);
    if(sky)sky.position.copy(camera.position);
    // the beam turns once every nine seconds and flashes as it sweeps past the camera; at the end it swings round onto
    // the camera and holds there, and the lamp signals
    var lock=eEnd>0?sstep(1.25,1.45,eEnd):0,bt=Math.atan2(camera.position.x-LAMP.x,camera.position.z-LAMP.z);
    if(reduce)beamA=lock>.5?bt:.9;
    else{beamA+=TAU/9*dt/1000*(1-lock);if(lock>0)beamA+=wrapPI(bt-beamA)*Math.min(1,dt/320)*lock;beamA=wrapPI(beamA);}
    beamDir.set(Math.sin(beamA),0,Math.cos(beamA));if(beam)beam.rotation.y=beamA;
    var mf=1;
    if(!reduce&&lock>.99&&eEnd>1.45&&Math.abs(wrapPI(bt-beamA))<.04){mT+=dt;mf=morse(mT);}
    else if(mT||mKey){mT=0;mKey="";if(o.onMorse)o.onMorse({on:0,li:-1,si:-1});}
    var L=lamp(lampK,t,mf),lampD=camera.position.distanceTo(LAMP);
    // beside the lamp (on the gallery) the beam is not drawn: seen from within, its cone would only be a pale disc
    if(beam&&lampD<10)beam.mat.uniforms.uI.value*=sstep(3,10,lampD);
    var cx=camera.position.x-LAMP.x,cz=camera.position.z-LAMP.z,cl=Math.hypot(cx,cz)||1,pulse=Math.pow(Math.abs((beamDir.x*cx+beamDir.z*cz)/cl),14);
    if(glow){glow.material.opacity=L*(.55+.45*pulse);glow.scale.setScalar((6+12*pulse*L)*clamp(lampD/25,.08,1));}
    if(gulls&&gulls.L.visible){var g=gulls.o;GULL.forEach(function(b,i){var a=b.ph+ts*b.sp*m,x=b.cx+Math.cos(a)*b.R,z=b.cz+Math.sin(a)*b.R,y=b.h+Math.sin(ts*.3+b.ph)*1.1,
        th=Math.atan2(-Math.sin(a)*Math.sign(b.sp),Math.cos(a)*Math.sign(b.sp)),glide=.5+.5*Math.sin(ts*.7+b.ph*3),fl=m*Math.sin(ts*b.fl+b.ph)*(glide>.55?.12:.62);
        g.position.set(x,y,z);g.rotation.set(0,th,0);g.scale.set(b.sc,b.sc,b.sc);g.rotateZ(fl);g.updateMatrix();gulls.R.setMatrixAt(i,g.matrix);
        g.rotation.set(0,th,0);g.scale.set(-b.sc,b.sc,b.sc);g.rotateZ(-fl);g.updateMatrix();gulls.L.setMatrixAt(i,g.matrix);});
      gulls.R.instanceMatrix.needsUpdate=gulls.L.instanceMatrix.needsUpdate=true;}
    if(dust)dust.position.set(Math.sin(ts*.05)*1.5,Math.sin(ts*.08)*.4,0);
    // the twin: the lattice spreads from the lighthouse until the build is done, then hands over
    if(twinOn){var p=twinStart?clamp((t-twinStart)/2300,0,1):0;wire.uniforms.uR.value=340*(1-Math.pow(1-p,3));
      if(tw)tw.sync(Math.min(.98,.4*done/STEPS.length+.6*p));
      if(built&&(p>=1||(tw&&tw.skipped())))handover();}
    if(twinOn){renderer.setClearColor(0x06080E,1);wireOnly();
      if(firstWire){firstWire=false;host.classList.add("on");if(tw)tw.live();}return;}
    renderer.setClearColor(0x000000,0);
    // deep under the veil the scene is only soft light and shade, so half the frames will do
    frames++;var deep=climbEl?c!==null&&c>cTop()+C_END+.6:sy>hh*1.2;if(ready&&FIXED&&deep&&wireFade<=0&&frames%2)return;
    if(inside){hallDust.rotation.y=ts*.012;renderer.render(hall,camera);}
    else if(wireFade>0){renderer.autoClear=false;renderer.clear();renderer.render(scene,camera);renderer.clearDepth();wire.uniforms.uA.value=wireFade;wire.uniforms.uR.value=1e4;wireOnly();renderer.autoClear=true;wireFade-=dt/(tw&&tw.skipped()?400:900);}
    else renderer.render(scene,camera);
    // the light in the lens: the sun by day, the lamp by night
    var sx=0,syy=0,fo=0,ro=0;
    if(inside){}
    // (while the lamp spells its word the flare is held down, so the flashes stay gentle)
    else if(L>.5||mT){vp.copy(LAMP).project(camera);fo=vp.z<1&&camera.near>.2?L*(.16+.5*pulse):0;if(mT)fo=Math.min(fo,.38);}
    else{vp.copy(sunDir).multiplyScalar(1000).add(camera.position).project(camera);fo=vp.z<1?sunUp*.5*(1-U.uNight.value):0;ro=fo*.32;}
    sx=(vp.x*.5+.5)*W;syy=(-vp.y*.5+.5)*H;
    if(flare){flare.style.opacity=fo.toFixed(3);flare.style.transform="translate("+sx.toFixed(1)+"px,"+syy.toFixed(1)+"px)";}
    if(rays){rays.style.opacity=ro.toFixed(3);rays.style.transform="translate("+sx.toFixed(1)+"px,"+syy.toFixed(1)+"px)";}
    if(!ready){ready=true;host.classList.add("on");if(o.onReady)o.onReady(true);}
    // slow machines draw fewer pixels rather than drop frames
    if(dt>30)slow++;if(frames>=90){if(slow>45&&PR>1){PR=Math.max(1,PR-.25);renderer.setPixelRatio(PR);size();}frames=slow=0;}
  }

  if(tw)renderer.setClearColor(0x06080E,1);
  step(0);
  return {
    setNight:function(n,instant){kT=n?1:0;if(instant||reduce){k=kT;lampK=k;if(built)applyK(k);}},
    // the hall is built once the scene is, in a quiet moment, so the climb is ready before anyone reaches the door
    setWorks:function(list){if(hall||!climbEl)return;works=list||[];if(built)setTimeout(buildHall,600);},
    climbScreens:climbScreens,
    // how far into the climb section (in screens) the camera stands at piece i
    climbAt:function(i){return C_W0+(i+.5)*PER;},
    climbs:!!climbEl
  };
}
window.Lighthouse={init:init};
})();

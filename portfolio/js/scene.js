/* Headland: the hero scene, drawn with three.js r128.
   A lighthouse on a grassy headland over the sea at golden hour. At night the sun is down, the moon is up and the lamp
   is lit; its beam sweeps the water. The land is one height field whose cliffs are pulled up into near-vertical walls
   and cut into strata, with sea stacks and a scree of boulders at their foot; rock, grass, plaster and slate are
   photo scans (CC0, from Poly Haven, in assets/tex), projected from three sides so the cliffs never stretch them.
   The sky, the sea, the surf and the beam are shaders.
   app.js starts it with Lighthouse.init(opts) and drives it through the api that returns:
     opts  host, hero, flare, rays, night, reduce, fixed, scans (folder of the textures), content (selector of page
           parts that are not the scene), twin {line, sync, live, skipped, end}, onReady(), onHot(on), onToggle()
     api   setNight(night, instant) */
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
/* the photo scans, in assets/tex: rock for the cliffs, lichen-covered rock above it, turf, plaster, slate */
var SCANS=["rock_diff","rock_nor","moss_diff","moss_nor","grass_diff","grass_nor","wall_diff","wall_nor","roof_diff","roof_nor"];

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
  var W=1,H=1,yardH=0,verts=0,lookX=0,sky=null,seaMat=null,ridges=[],gulls=null,dust=null,beam=null,glow=null,lampMesh=null,glassMat=null,winMat=null,lampL=null,homeL=null,hits=[];
  var sunDir=new T.Vector3(),moonDir=new T.Vector3(),LAMP=new T.Vector3(LH.x,0,LH.z),beamDir=new T.Vector3(1,0,0);
  var ANI=Math.min(8,renderer.capabilities.getMaxAnisotropy()),TEX={},scanned=false;
  function lin(hex){return new T.Color(hex).convertSRGBToLinear();}
  function std(hex,rough,metal){return new T.MeshStandardMaterial({color:lin(hex),roughness:rough,metalness:metal||0});}
  function put(parent,geo,mat,x,y,z){var m=new T.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
  function scaleUV(geo,su,sv){var uv=geo.attributes.uv;for(var i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*su,uv.getY(i)*sv);return geo;}
  function glowTex(){var c=document.createElement("canvas");c.width=c.height=128;var x=c.getContext("2d"),g=x.createRadialGradient(64,64,0,64,64,64);
    g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(.18,"rgba(255,255,255,.55)");g.addColorStop(.5,"rgba(255,255,255,.12)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,128,128);return new T.CanvasTexture(c);}

  /* ---------- the scans; without them (opened from disk, or offline) the scene falls back to flat colour ---------- */
  function loadScans(){
    if(location.protocol==="file:")return Promise.resolve(false);
    var dir=o.scans||"assets/tex/",n=0,loader=new T.TextureLoader();
    return new Promise(function(res){
      SCANS.forEach(function(k){loader.load(dir+k+".webp",function(t){
        t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=ANI;if(k==="wall_diff"||k==="roof_diff")t.encoding=T.sRGBEncoding;TEX[k]=t;n++;
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
        var gx=(landD(x+e,z)-landD(x-e,z))/(2*e),gz=(landD(x,z+e)-landD(x,z-e))/(2*e),g=Math.hypot(gx,gz)||1;
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

  /* ---------- the lighthouse and the keeper's cottage: lime plaster, a slate roof, dry-stone walls ---------- */
  function buildTower(){
    var g=new T.Group(),parts=0;g.position.set(LH.x,yardH,LH.z);scene.add(g);
    function plaster(hex,rough){var m=std(hex,rough||.86);if(scanned){m.map=TEX.wall_diff;m.normalMap=TEX.wall_nor;m.normalScale.set(.9,.9);}m.envMapIntensity=.6;return m;}
    var white=plaster(0xF2ECE2),red=plaster(0x9A3328,.8),wall=plaster(0xE9E1D3),iron=std(0x1C1D22,.42,.6),stone=scanned?scanMat():std(0x8F8574,.95),dark=std(0x2B2420,.7),frame=std(0xEDE8DF,.6);
    var slate=std(scanned?0xFFFFFF:0x3A3E46,.62,.05);if(scanned){slate.map=TEX.roof_diff;slate.normalMap=TEX.roof_nor;}slate.side=T.DoubleSide;slate.envMapIntensity=.7;
    function P(geo,mat,x,y,z){parts++;return put(g,geo,mat,x,y,z);}
    function rad(y){return 1.14+.48*Math.pow(1-y/TOWER,1.3);}
    // each band is a lathe; its UVs are set to metres so one plaster scan tiles evenly up the whole tower
    function band(y0,y1,mat){var pts=[];for(var i=0;i<=4;i++){var y=lerp(y0,y1,i/4);pts.push(new T.Vector2(rad(y),y));}
      var geo=new T.LatheGeometry(pts,48),uv=geo.attributes.uv,pp=geo.attributes.position;for(i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*3,pp.getY(i)/2.8);P(geo,mat);}
    P(new T.CylinderGeometry(2.1,2.35,1,10),stone,0,.3,0);
    band(.8,2.2,white);band(2.2,4,red);band(4,6.6,white);band(6.6,8.4,red);band(8.4,TOWER,white);
    // the door and windows face the camera's side of the headland
    var fa=Math.atan2(0-LH.x,34-LH.z);
    function onTower(geo,mat,y,da){var a=fa+da,r=rad(y)-.04,m=P(geo,mat,Math.sin(a)*r,y,Math.cos(a)*r);m.rotation.y=a;return m;}
    onTower(new T.BoxGeometry(.72,1.35,.25),dark,1.48,0);onTower(new T.BoxGeometry(.9,.12,.3),frame,2.2,0);
    [[3.1,.35],[5.4,-.25],[7.6,.3],[9.7,-.2]].forEach(function(w){onTower(new T.BoxGeometry(.28,.5,.16),dark,w[0],w[1]);onTower(new T.BoxGeometry(.38,.07,.22),frame,w[0]-.28,w[1]);});
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
    // a low dry-stone wall round the back of the yard
    var wl=P(new T.CylinderGeometry(6.2,6.2,.6,64,1,true,.55*Math.PI,1.05*Math.PI),stone,0,.22,0);wl.material=stone.clone();wl.material.side=T.DoubleSide;
    if(scanned)wl.material.onBeforeCompile=stone.onBeforeCompile;
    // the cottage, beside the tower on the inland side
    var c=new T.Group();c.position.set(6.2,0,-2.6);c.rotation.y=-.35;g.add(c);
    var box=new T.BoxGeometry(5.4,2.5,3.4),buv=box.attributes.uv,dims=[[3.4,2.5],[3.4,2.5],[5.4,3.4],[5.4,3.4],[5.4,2.5],[5.4,2.5]];
    for(i=0;i<buv.count;i++){var dm=dims[(i/4)|0];buv.setXY(i,buv.getX(i)*dm[0]/2.4,buv.getY(i)*dm[1]/2.4);}
    parts++;put(c,box,wall,0,1.25,0);
    // the roof: two slate slopes with eaves, plastered gables under them and a ridge cap
    var half=1.95,rise=1.45,slope=Math.hypot(half,rise),pitch=Math.atan2(half,rise);
    [0,Math.PI].forEach(function(ry){var sg=new T.Group();sg.rotation.y=ry;c.add(sg);
      var pl=new T.Mesh(scaleUV(new T.PlaneGeometry(5.9,slope+.2),5.9/1.6,(slope+.2)/1.6),slate);pl.position.set(0,2.5+rise/2-.06,half/2+.04);pl.rotation.x=-pitch;pl.castShadow=pl.receiveShadow=true;sg.add(pl);parts++;});
    var gs=new T.Shape(),eave=rise*(1-1.7/half);gs.moveTo(-1.7,0);gs.lineTo(1.7,0);gs.lineTo(1.7,eave);gs.lineTo(0,rise-.04);gs.lineTo(-1.7,eave);gs.closePath();
    [-2.7,2.7].forEach(function(x){var gg=new T.ShapeGeometry(gs);scaleUV(gg,1/2.4,1/2.4);var m=new T.Mesh(gg,wall);m.position.set(x,2.5,0);m.rotation.y=x<0?-Math.PI/2:Math.PI/2;m.castShadow=m.receiveShadow=true;c.add(m);parts++;});
    parts++;put(c,new T.BoxGeometry(5.95,.12,.24),slate,0,2.5+rise+.02,0);
    parts++;put(c,new T.BoxGeometry(.55,1.3,.55),stone,1.6,3.55,.35);
    [-.12,.12].forEach(function(dx){parts++;put(c,new T.CylinderGeometry(.08,.1,.28,10),std(0x8a5a44,.8),1.6+dx,4.34,.35);});
    // a stone plinth at the foot of the walls, boards along the eaves, a canopy over the door
    parts++;put(c,new T.BoxGeometry(5.52,.38,3.52),stone,0,.19,0);
    [1,-1].forEach(function(sd){parts++;put(c,new T.BoxGeometry(5.9,.15,.05),dark,0,2.44,sd*2.02);});
    parts++;put(c,new T.BoxGeometry(1.15,.08,.48),dark,0,1.7,1.93);
    // windows: glass that glows at dusk, in white frames with a cross of glazing bars
    winMat=new T.MeshBasicMaterial({color:0x1c1f26,toneMapped:false});
    function windowAt(x,y,z,ry){var wg=new T.Group();wg.position.set(x,y,z);wg.rotation.y=ry;c.add(wg);var ww=.6,wh=.8,f=.07;
      wg.add(new T.Mesh(new T.PlaneGeometry(ww,wh),winMat));
      [[0,wh/2,ww+f,f],[0,-wh/2-.02,ww+f*2,f*1.4],[ww/2,0,f,wh],[-ww/2,0,f,wh],[0,0,f*.55,wh],[0,.08,ww,f*.55]].forEach(function(b){var m=new T.Mesh(new T.BoxGeometry(b[2],b[3],.06),frame);m.position.set(b[0],b[1],.02);wg.add(m);});
      parts++;}
    windowAt(-1.7,1.45,1.71,0);windowAt(1.7,1.45,1.71,0);windowAt(-2.71,1.45,0,-Math.PI/2);
    var dm2=new T.Mesh(new T.BoxGeometry(.82,1.55,.08),std(0x3B2A22,.7));dm2.position.set(0,.78,1.72);c.add(dm2);parts++;
    homeL=new T.PointLight(0xffb060,0,13,2);homeL.position.set(0,1.4,3.2);c.add(homeL);
    // what a click can hit: the tower and the cottage (kept out of the scene, so nothing draws them)
    var inv=new T.MeshBasicMaterial({visible:false});
    var ht=new T.Mesh(new T.CylinderGeometry(2.4,2.4,17,12),inv);ht.position.set(LH.x,yardH+8.5,LH.z);ht.updateMatrixWorld();
    var hc=new T.Mesh(new T.BoxGeometry(6,4.2,4.2),inv);g.updateMatrixWorld(true);hc.applyMatrix4(c.matrixWorld);hc.position.y+=2;hc.updateMatrixWorld();
    hits=[ht,hc];
    LAMP.set(LH.x,yardH+LAMP_Y,LH.z);
    return parts;
  }

  /* ---------- the lamp: its light, its glow and the beam ---------- */
  var GLOW=null;
  function buildLamp(){
    GLOW=glowTex();
    lampL=new T.PointLight(0xffc27a,0,46,2);lampL.position.copy(LAMP);scene.add(lampL);
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

  /* ---------- light ---------- */
  var key=new T.DirectionalLight(0xffffff,2.5),fill=new T.DirectionalLight(0xffffff,.4),hemi=new T.HemisphereLight(0xffffff,0x000000,.5);
  key.castShadow=true;key.shadow.mapSize.set(2048,2048);
  var sc=key.shadow.camera;sc.left=-30;sc.right=30;sc.top=30;sc.bottom=-30;sc.near=1;sc.far=280;key.shadow.bias=-.0004;key.shadow.normalBias=.04;
  fill.position.set(-30,24,60);
  scene.add(key,key.target,fill,hemi);
  var SUN_HI=new T.Color(0xffb766),SUN_LO=new T.Color(0xff7a3a),MOONC=new T.Color(0xa9c0ff);
  // the fill is the evening sky behind the camera: mauve and cool, so rock in shadow reads as sky-lit, not lamp-lit
  var HS=[new T.Color(0x8a90c4),new T.Color(0x22305e)],HG=[new T.Color(0x6a4a34),new T.Color(0x0a0d18)],FL=[new T.Color(0xb7a6bc),new T.Color(0x5a6fb0)];
  var RIDGE_DARK=[[.36,.25,.31],[.012,.014,.028]],kd=new T.Vector3(),WIN_OFF=lin(0x1c1f26),WIN_ON=new T.Color(1.6,1.05,.55);
  var k=o.night?1:0,kT=k,lampK=k,sunUp=1;
  function applyK(kk){
    var e=kk*kk*(3-2*kk),sk=sstep(0,.62,kk),mk=sstep(.25,1,kk);
    // the sun sets over the first 60% of the change; the moon rises over the last 75%
    sunDir.copy(dirOf(lerp(5,9,sk)*D,lerp(4.6,-9,sk)*D));moonDir.copy(dirOf(lerp(-8,3,mk)*D,lerp(-6,19,mk)*D));
    U.uSun.value.copy(sunDir);U.uMoon.value.copy(moonDir);U.uNight.value=e;
    sunUp=clamp((sunDir.y+.02)/.1,0,1);var moonUp=clamp(moonDir.y/.2,0,1);
    if(sunUp>0){kd.copy(sunDir);kd.y=Math.max(kd.y,.05);key.color.copy(SUN_HI).lerp(SUN_LO,1-sunUp);key.intensity=2.7*Math.pow(sunUp,.8);}
    else{kd.copy(moonDir);kd.y=Math.max(kd.y,.08);key.color.copy(MOONC);key.intensity=.55*moonUp;}
    kd.normalize();key.target.position.set(LH.x,yardH,LH.z);key.position.copy(key.target.position).addScaledVector(kd,130);
    hemi.color.copy(HS[0]).lerp(HS[1],e);hemi.groundColor.copy(HG[0]).lerp(HG[1],e);hemi.intensity=lerp(.62,.42,e);
    fill.color.copy(FL[0]).lerp(FL[1],e);fill.intensity=lerp(.42,.16,e);
    // the haze takes the colour of the horizon behind the headland
    var hz=skyJS(new T.Vector3(LH.x,0,LH.z-34).normalize(),sunDir,moonDir,e);scene.fog.color.setRGB(hz[0],hz[1],hz[2]);scene.fog.density=lerp(.0042,.0036,e);
    ridges.forEach(function(m,i){var c=skyJS(new T.Vector3(Math.sin(m.az),.01,-Math.cos(m.az)),sunDir,moonDir,e),dk=RIDGE_DARK,s=i?.34:.2;
      m.material.color.setRGB(lerp(c[0],lerp(dk[0][0],dk[1][0],e),s),lerp(c[1],lerp(dk[0][1],dk[1][1],e),s),lerp(c[2],lerp(dk[0][2],dk[1][2],e),s)).convertSRGBToLinear();});
    if(seaMat){seaMat.uniforms.uSunI.value=sunUp*(1-e*.6);seaMat.uniforms.uMoonI.value=moonUp*e;}
    if(dust){dust.material.color.set(0xffd39a).lerp(new T.Color(0x9db4ff),e);dust.material.opacity=lerp(.5,.18,e);}
    if(winMat)winMat.color.copy(WIN_OFF).lerp(WIN_ON,sstep(.35,.75,kk));
    if(homeL)homeL.intensity=1.3*sstep(.35,.75,kk);
    if(gulls)gulls.L.visible=gulls.R.visible=e<.55;
    renderer.toneMappingExposure=lerp(1,1.22,e);renderer.shadowMap.needsUpdate=true;
  }
  function lamp(kk,t){
    var f=kk<1&&kk>0?.75+.25*Math.abs(Math.sin(t*.037)*Math.sin(t*.011)):1,L=kk*f;
    if(lampMesh)lampMesh.material.color.setRGB(lerp(.05,2.2,L),lerp(.045,1.9,L),lerp(.04,1.45,L));
    if(glassMat)glassMat.emissiveIntensity=1.4*L;
    if(lampL)lampL.intensity=2.4*L;
    if(beam){beam.visible=L>.005;beam.mat.uniforms.uI.value=L;}
    if(seaMat)seaMat.uniforms.uLampI.value=L;
    return L;
  }

  /* ---------- camera, size, pointer ---------- */
  var base=new T.Vector3(0,5.6,34),look=new T.Vector3(),WALK_CAM=new T.Vector3(8,19,-10),WALK_LOOK=new T.Vector3(-50,12,-150),wc=new T.Vector3(),ptr={x:0,y:0,tx:0,ty:0};
  function size(){W=host.clientWidth||innerWidth;H=host.clientHeight||innerHeight;renderer.setSize(W,H,false);var a=W/H;
    camera.aspect=a;camera.fov=a<.8?56:a<1.3?46:40;lookX=a<1?11.7:a<1.45?5:0;camera.updateProjectionMatrix();
    if(seaMat)seaMat.uniforms.uPix.value=camera.fov*D/H;}
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
    ["tower","mason","raising the tower",function(){return"tower, lantern, cottage · "+buildTower()+" parts";}],
    ["lamp","keeper","trimming the lamp",function(){buildLamp();return"lamp and beam · a turn every 9 s";}],
    ["sky","weather","drawing the sky",function(){buildSky();buildLife();return"sky dome, clouds, "+GULL.length+" gulls";}],
    ["compile","renderer","compiling shaders",function(){applyK(k);lamp(lampK,0);renderer.compile(scene,camera);return"shaders compiled";}]
  ];
  function step(i){
    if(i>=STEPS.length){built=true;if(tw)tw.line("light","renderer","lighting the stone");else startLoop();return;}
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
    if(k!==kT){var st=reduce?1:dt/7000;k=k<kT?Math.min(kT,k+st):Math.max(kT,k-st);applyK(k);}
    var lt=k>.5?1:0;if(lampK!==lt){var ls=reduce?1:dt/(lt?1500:1100);lampK=lampK<lt?Math.min(lt,lampK+ls):Math.max(lt,lampK-ls);}
    var L=lamp(lampK,t);
    U.uTime.value=reduce?0:ts;
    // the camera: a slow drift, the pointer, and the scroll (on desktop it walks out toward the lantern)
    ptr.x+=(ptr.tx-ptr.x)*.04;ptr.y+=(ptr.ty-ptr.y)*.04;
    var sy=window.scrollY||0,hh=o.hero?o.hero.offsetHeight:H,q=reduce?0:sstep(0,1,sy/Math.max(1,hh));
    camera.position.set(base.x+m*Math.sin(ts*.08)*1.6+ptr.x*1.2*m+(lookX?3:0),base.y+m*Math.sin(ts*.11)*.15-ptr.y*.3*m+q*2.6,base.z-m*(1-Math.cos(ts*.06))*1.2-q*5);
    look.set(lookX,9.5+q*1.2,-40);
    if(FIXED&&!reduce){var span=Math.max(1,document.documentElement.scrollHeight-innerHeight-hh),wp=sstep(0,1,(sy-hh*.6)/span);
      if(wp>0){camera.position.lerp(wc.copy(WALK_CAM),wp*.9);look.lerp(WALK_LOOK,wp);}}
    camera.lookAt(look);
    if(sky)sky.position.copy(camera.position);
    // the beam turns once every nine seconds; it flashes when it sweeps past the camera
    var ba=reduce?.9:ts*TAU/9;beamDir.set(Math.sin(ba),0,Math.cos(ba));
    if(beam)beam.rotation.y=ba;
    var cx=camera.position.x-LAMP.x,cz=camera.position.z-LAMP.z,cl=Math.hypot(cx,cz)||1,pulse=Math.pow(Math.abs((beamDir.x*cx+beamDir.z*cz)/cl),14);
    if(glow){glow.material.opacity=L*(.55+.45*pulse);glow.scale.setScalar(6+12*pulse*L);}
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
    frames++;if(ready&&FIXED&&sy>hh*1.2&&wireFade<=0&&frames%2)return;
    if(wireFade>0){renderer.autoClear=false;renderer.clear();renderer.render(scene,camera);renderer.clearDepth();wire.uniforms.uA.value=wireFade;wire.uniforms.uR.value=1e4;wireOnly();renderer.autoClear=true;wireFade-=dt/(tw&&tw.skipped()?400:900);}
    else renderer.render(scene,camera);
    // the light in the lens: the sun by day, the lamp by night
    var sx=0,syy=0,fo=0,ro=0;
    if(L>.5){vp.copy(LAMP).project(camera);fo=vp.z<1?L*(.16+.5*pulse):0;}
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
    setNight:function(n,instant){kT=n?1:0;if(instant||reduce){k=kT;lampK=k;if(built)applyK(k);}}
  };
}
window.Lighthouse={init:init};
})();

/* Runs in <head>, before the first paint.
   1. Marks the page as scripted (.js), so the hero copy can wait for its entrance without hiding it from no-JS readers.
   2. Restores the saved day/night choice, so the page never flashes the other hour.
   3. Decides whether this visit opens on the twin (the boot log in app.js): once per browser session, on desktop
      only, never under reduced motion or when the page opens at an anchor. ?twin forces it, ?notwin skips it. */
(function(){
  var d=document.documentElement,q=location.search,mm=window.matchMedia;
  d.classList.add("js");
  try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")d.setAttribute("data-theme",t);}catch(e){}
  if(/[?&]notwin\b/.test(q))return;
  var forced=/[?&]twin\b/.test(q);
  if(!forced){
    try{if(sessionStorage.getItem("twin"))return;}catch(e){}
    if(location.hash||!mm||mm("(prefers-reduced-motion:reduce)").matches||!mm("(hover:hover) and (pointer:fine) and (min-width:761px)").matches)return;
  }
  d.classList.add("twin-run","twin-pre");
})();

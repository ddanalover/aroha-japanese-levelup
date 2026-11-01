"use strict";
let audioCtx=null;
function playSnd(t){
  try{
    const Context=window.AudioContext||window.webkitAudioContext;
    if(!Context)return;
    if(!audioCtx)audioCtx=new Context();

      if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      const n = audioCtx.currentTime;
      if (t === 'c') {
        o.type = 'square';
        o.frequency.setValueAtTime(659, n);
        o.frequency.setValueAtTime(987, n + 0.1);
        g.gain.setValueAtTime(0.055, n);
        g.gain.exponentialRampToValueAtTime(0.0001, n + 0.26);
        o.start(n); o.stop(n + 0.26);
        return;
      }
      if (t === 'b') {
        o.type = 'triangle';
        o.frequency.setValueAtTime(820, n);
        o.frequency.exponentialRampToValueAtTime(1180, n + 0.04);
        g.gain.setValueAtTime(0.042, n);
        g.gain.exponentialRampToValueAtTime(0.0001, n + 0.09);
        o.start(n); o.stop(n + 0.09);
        return;
      }
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(150, n);
      o.frequency.exponentialRampToValueAtTime(55, n + 0.28);
      g.gain.setValueAtTime(0.05, n);
      g.gain.exponentialRampToValueAtTime(0.0001, n + 0.28);
      o.start(n); o.stop(n + 0.28);
    
  }catch{/* Audio must never block learning on unsupported devices. */}
}
document.addEventListener('click',event=>{
  const button=event.target.closest('.btn-pixel');
  if(!button||button.disabled||button.id==='opt0'||button.id==='opt1')return;
  playSnd('b');
});

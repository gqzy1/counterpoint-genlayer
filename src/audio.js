let context,master,enabled=true,started=false,timer;
export function audioEnabled(){return enabled;}
function chime(frequency,start,duration,gain=.018){
  const o=context.createOscillator(),g=context.createGain();o.type='sine';o.frequency.value=frequency;
  g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(gain,start+.08);g.gain.exponentialRampToValueAtTime(.0001,start+duration);
  o.connect(g);g.connect(master);o.start(start);o.stop(start+duration+.1);
}
export async function startAudio(){
  if(started||!enabled)return;try{context=new (window.AudioContext||window.webkitAudioContext)();master=context.createGain();master.gain.value=.55;master.connect(context.destination);await context.resume();started=true;
    const notes=[130.81,164.81,196,261.63,293.66,329.63,392,523.25];let tick=0;
    const phrase=()=>{if(!enabled||document.hidden)return;const now=context.currentTime;chime(notes[tick%8],now,6,.022);chime(notes[(tick+3)%8]*.5,now+1.1,7,.013);tick++;};phrase();timer=setInterval(phrase,4200);
  }catch{enabled=false;}
}
export async function toggleAudio(){enabled=!enabled;if(enabled){if(!started)await startAudio();else master.gain.linearRampToValueAtTime(.55,context.currentTime+.4);}else if(started)master.gain.linearRampToValueAtTime(0,context.currentTime+.4);return enabled;}
export function touchSound(value=0){if(enabled&&started)chime([261.63,329.63,392,523.25][value%4],context.currentTime,1.8,.035);}

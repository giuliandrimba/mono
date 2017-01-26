import * as howler from "howler"
var loopSound = new howler.Howl({
  urls: ['audio/loop.mp3'],
  loop: true,
  volume: 0
});
loopSound._vol = 0;
loopSound._playing = false;
var gongFade = undefined;

var bellGoldenSound = new howler.Howl({
  urls: ['audio/bell-golden-amp.mp3'],
  volume: 0.15
});

var bellRedSound = new howler.Howl({
  urls: ['audio/bell-red-amp.mp3'],
  volume: 0.12
});

var bell = new howler.Howl({
  urls: ['audio/gong.mp3'],
  volume: 1
});

export function startLoop(){
  if(!loopSound._playing){
    loopSound.play();
    loopSound._playing = true;
  }
  TweenMax.to(loopSound, 2, {_vol:0.45,  onUpdate:function(){
    loopSound.volume(loopSound._vol)
  }})
}

export function stopLoop(){
  TweenMax.to(loopSound, 1, {_vol:0, ease:Quad.easeOut, onUpdate:function(){
    loopSound.volume(loopSound._vol)
  }})
}

export function playGolden(){
  bellGoldenSound.play()
}

export function playRed(){
  bellRedSound.play()
}

export function playBell(){
  window.clearTimeout(gongFade);
  bell.volume(1)
  bell.play()
  gongFade = setTimeout(()=>{
    bell.fade(1,0, 500)
  }, 9000)
}

var hidden, visibilityChange; 
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {
} else {
  document.addEventListener(visibilityChange, handleVisibilityChange, false);
}

function handleVisibilityChange() {
  if (document[hidden]) {
    pauseAudio()
  } else {
    resumeAudio()
  }
}

function pauseAudio() {
  Howler.volume(0)
}

function resumeAudio() {
  Howler.volume(1)
}
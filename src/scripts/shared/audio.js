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
  urls: ['audio/bell-golden.mp3'],
  volume: 1
});

var bellRedSound = new howler.Howl({
  urls: ['audio/bell-red.mp3'],
  volume: 1
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
  TweenMax.to(loopSound, 2, {_vol:0.15,  onUpdate:function(){
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
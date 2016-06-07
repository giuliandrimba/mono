import * as howler from "howler"

var loopSound = new howler.Howl({
  urls: ['audio/loop-noise.mp3'],
  loop: true,
  volume: 0
});
loopSound._vol = 0;
loopSound._playing = false;

var bellGoldenSound = new howler.Howl({
  urls: ['audio/bell-golden.mp3']
});

var bellRedSound = new howler.Howl({
  urls: ['audio/bell-red.mp3']
});

var bell = new howler.Howl({
  urls: ['audio/bell-1.mp3']
});

export function startLoop(){
  if(!loopSound._playing){
    loopSound.play();
    loopSound._playing = true;
  }
  TweenMax.to(loopSound, 1, {_vol:1,  onUpdate:function(){
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
  bell.play()
}
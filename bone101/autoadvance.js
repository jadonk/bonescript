autoAdvanceTimeout = null;
autoAdvanceDuration = 10000;

autoAdvance = function() {
 if(w3c_slidy.slide_number < w3c_slidy.slides.length - 1) {
  w3c_slidy.next_slide(true);
 } else {
  w3c_slidy.first_slide();
 }
 autoAdvanceTimeout = setTimeout(autoAdvance, autoAdvanceDuration);
 return w3c_slidy.cancel(event);
};

disableAutoAdvance = function() {
 if(autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);
 autoAdvanceTimeout = null;
};

enableAutoAdvance = function(duration) {
 if(duration) autoAdvanceDuration = duration;
 autoAdvanceTimeout = setTimeout(autoAdvance, autoAdvanceDuration);
};

onAutoAdvanceKeyPress = function(event) {
 // disable on any keypress (reload to restart autoAdvance)
 if(autoAdvanceTimeout) {
  disableAutoAdvanceTimeout();
 }
}

document.addEventListener("keypress", onAutoAdvanceKeyPress, false);

//enableAutoAdvance();

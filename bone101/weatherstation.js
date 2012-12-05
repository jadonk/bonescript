// Configuration data
pressureConfig = {
    file: "/sys/bus/i2c/drivers/bmp085/3-0077/pressure0_input",
    unit: "milliBar",
    delay: 5000,
    scale: 100,
    rangeHigh: 1100,
    rangeLow: 900,
};

tempConfig = {
    file: "/sys/bus/i2c/drivers/bmp085/3-0077/temp0_input",
    unit: "° C",
    delay: 2000,
    scale: 10,
    rangeHigh: 40,
    rangeLow: -20,
};

humidityConfig = {
    file: "/sys/bus/i2c/drivers/sht21/3-0040/humidity1_input",
    unit: "% RH",
    delay: 2000,
    scale: 1000,
    rangeHigh: 100,
    rangeLow: 0,
};

// global vars
var PI = 3.14;
var HALF_PI = 1.57;
var TWO_PI = 6.28;

// set defaults
var pressure = 950;
var pmax = pressureConfig.rangeHigh;
var pmin = pressureConfig.rangeLow;
var punit = pressureConfig.unit;

var temp = -25;
var tmax = tempConfig.rangeHigh;
var tmin = tempConfig.rangeLow;
var tunit = tempConfig.unit;

var humidity = 50;
var hmax = humidityConfig.rangeHigh;
var hmin = humidityConfig.rangeLow;
var hunit = humidityConfig.unit;

var lux = 0;
var lmax = 2000;
var lmin = 0;
var lunit = "lux";


var setWidth = function() {
 var canvasWidth = window.innerWidth * 0.9;
 if ( canvasWidth > (1.8 * window.innerHeight)) {
  canvasWidth = 1.8 * window.innerHeight;
  $('#heading').hide();
 } else
  $('#heading').show();

 barometerWidth = canvasWidth*0.5;
 barometerHeight = barometerWidth;
 thermometerWidth = canvasWidth*0.25;
 lightWidth = canvasWidth*0.25;
};
setWidth();

var barometerSketchProc = function(p) {
 p.size(barometerWidth, barometerWidth);
 p.draw = function() {
 p.size(barometerWidth, barometerWidth);
 barometerWidth=p.width;
 p.background(0,0);
  
  // barometer
  p.fill(220);
  p.noStroke();
  // Angles for sin() and cos() start at 3 o'clock;
  // subtract HALF_PI to make them start at the top
  p.ellipse(barometerWidth/2, barometerWidth/2, barometerWidth*0.8, barometerWidth*0.8);
  
   var angle = -HALF_PI + HALF_PI / 3;
   var inc = TWO_PI / 12;
   p.stroke(0);
   p.strokeWeight(barometerWidth*0.015);
   p.arc(barometerWidth/2, barometerWidth/2, barometerWidth*0.8, barometerWidth*0.8, -(4/3)*PI, PI/3);

   // we want a range from ±950 - ±1050 milibar
   // 1-5=1010-1050, 7-12=950-1000
   p.textSize(Math.round(barometerWidth*0.04));
   for ( i = 1; i <= 12; i++, angle += inc ) {
       if(i!=6) {
         p.line(barometerWidth/2 + Math.cos(angle) * barometerWidth*0.35,barometerWidth/2 + Math.sin(angle) * barometerWidth*.35,barometerWidth/2 + Math.cos(angle) * barometerWidth*0.4,barometerWidth/2 + Math.sin(angle) * barometerWidth*.4);
         if (i < 6) {
           myText = 1000 + 10*i;
         } else {
           myText = 880 + 10*i;
         }     
         myWidth = p.textWidth(myText);
         p.fill(0, 102, 153);
         p.text(myText, Math.round(barometerWidth/2 + Math.cos(angle) * barometerWidth*0.3 - myWidth/2),Math.round(barometerWidth/2 + Math.sin(angle) * barometerWidth*0.3));
       } else {
         myText = punit;  
         myWidth = p.textWidth(myText);
         p.fill(0, 102, 153);
         p.text(myText, Math.round(barometerWidth/2 + Math.cos(angle) * barometerWidth*0.3 - myWidth/2),Math.round(barometerWidth/2 + Math.sin(angle) * barometerWidth*0.3));
       }
   }
   
  
   // RH scale
   p.fill(220);
   p.stroke(0);
   p.strokeWeight(barometerWidth*0.005);
   p.arc(barometerWidth/2, barometerWidth/2, barometerWidth*0.4, barometerWidth*0.4, -(4/3)*PI, PI/3);
   
   // we want a range from 0 - 100%
   // 1-5=60-100, 7-12=0-50
   p.textSize(Math.round(barometerWidth*0.02));
   for ( i = 1; i <= 12; i++, angle += inc ) {
       if(i!=6) {
         p.line(barometerWidth/2 + Math.cos(angle) * barometerWidth*0.18,barometerWidth/2 + Math.sin(angle) * barometerWidth*.18,barometerWidth/2 + Math.cos(angle) * barometerWidth*0.2,barometerWidth/2 + Math.sin(angle) * barometerWidth*.2);
         if (i < 6) {
           myText = 50 +10*i;
         } else {
           myText = 10*i - 70;
         }     
         myWidth = p.textWidth(myText);
         p.fill(0, 102, 153);
         p.text(myText, Math.round(barometerWidth/2 + Math.cos(angle) * barometerWidth*0.16 - myWidth/2),Math.round(barometerWidth/2 + Math.sin(angle) * barometerWidth*0.16));
       } else {
         myText = hunit;  
         myWidth = p.textWidth(myText);
         p.fill(0, 102, 153);
         p.text(myText, Math.round(barometerWidth/2 + Math.cos(angle) * barometerWidth*0.12 - myWidth/2),Math.round(barometerWidth/2 + Math.sin(angle) * barometerWidth*0.12));
       }
   }
   
        //humidity needle
  p.stroke(60);
  p.strokeWeight(barometerWidth*0.005);
  p.line(-Math.cos(humidity) * barometerWidth*0.05  + barometerWidth/2, -Math.sin(humidity) * barometerWidth*0.05 + barometerWidth/2, Math.cos(humidity) * barometerWidth*0.15 + barometerWidth/2, Math.sin(humidity) * barometerWidth*0.15 + barometerWidth/2);
  //p.ellipse(barometerWidth/2, barometerWidth/2, barometerWidth/20, barometerWidth/20);
   
     // pressure needle
  p.stroke(60);
  p.strokeWeight(barometerWidth*0.015);
  p.line(-Math.cos(pressure) * barometerWidth*0.05  + barometerWidth/2, -Math.sin(pressure) * barometerWidth*0.05 + barometerWidth/2, Math.cos(pressure) * barometerWidth*0.35 + barometerWidth/2, Math.sin(pressure) * barometerWidth*0.35 + barometerWidth/2);
  p.ellipse(barometerWidth/2, barometerWidth/2, barometerWidth/20, barometerWidth/20);
  
 };
 p.noLoop();
}

var thermometerSketchProc = function(p) {
 p.size(thermometerWidth, barometerHeight);
 p.draw = function() {
  p.size(thermometerWidth, barometerHeight);
  thermometerWidth=p.width;
  p.background(0,0);

  // thermometer
  // contour
  p.stroke(0);
  p.strokeWeight(thermometerWidth*0.27);
  p.line(thermometerWidth/2,thermometerWidth*1.75,thermometerWidth/2,thermometerWidth/4);
  p.ellipse(thermometerWidth/2, thermometerWidth*1.75, thermometerWidth/5, thermometerWidth/5);
  
  p.strokeWeight(thermometerWidth*0.22);
  p.stroke(255);
  p.line(thermometerWidth/2,thermometerWidth*1.75,thermometerWidth/2,thermometerWidth/4);
  // mercury bubble
  if(temp > 0) {
    p.stroke(255,0,0);
  } else {
    p.stroke(0,0,255)
  }  
  p.ellipse(thermometerWidth/2, thermometerWidth*1.75, thermometerWidth/5, thermometerWidth/5);
  // temperature line
  if (temp < 44) {
    p.strokeCap("butt");
  } else {
    // don't exceed thermometer bounds.  
    temp = 44;  
    p.strokeCap("round");  
  }      
  p.line(thermometerWidth/2,thermometerWidth*1.75,thermometerWidth/2,thermometerWidth*1.1 - (thermometerWidth/50) * temp);
  // scale
  p.strokeCap("round");
  p.stroke(0);
  p.strokeWeight(thermometerWidth*0.03);
  var theight = thermometerWidth*1.5;
  var inc = thermometerWidth/5;
  
  p.textSize(Math.round(thermometerWidth*0.06));
  
  for ( i = 1; i <= 7; i++, theight -= inc ) {
    // longer bar at zero degrees C  
    if(i==3) {
        extra = thermometerWidth/10;
    } else {
        extra = thermometerWidth/20;
    }    
    p.line((thermometerWidth/2) - thermometerWidth/8,theight,(thermometerWidth/2) - thermometerWidth/8 + extra, theight );
    
    myText = -30 + i*10;
    p.fill(0, 0, 0);
    p.text(myText, (thermometerWidth/2) - thermometerWidth*0.09 + extra, theight + 4);
    
    // min/max marks
    p.strokeWeight(thermometerWidth*0.01);
    p.line((thermometerWidth/2) + thermometerWidth/8,thermometerWidth*1.1 - (thermometerWidth/50) * tmin,(thermometerWidth/2) + thermometerWidth/8 - thermometerWidth/20, thermometerWidth*1.1 - (thermometerWidth/50) * tmin );
    p.line((thermometerWidth/2) + thermometerWidth/8,thermometerWidth*1.1 - (thermometerWidth/50) * tmax,(thermometerWidth/2) + thermometerWidth/8 - thermometerWidth/20, thermometerWidth*1.1 - (thermometerWidth/50) * tmax );
    p.strokeWeight(thermometerWidth*0.03);
  }
  myText = temp + tunit;
  p.fill(0, 0, 0);
  p.textSize(Math.round(thermometerWidth*0.09));
  myWidth = p.textWidth(myText);
  p.text(myText, thermometerWidth/2 - myWidth/2, thermometerWidth*1.75 + thermometerWidth*0.045);
 };
 p.noLoop();
}


var lightSketchProc = function(p) {
 p.size(lightWidth, barometerHeight);
 p.draw = function() {
  p.size(lightWidth, barometerHeight);
  lightWidth=p.width;
  p.background(0,0);

  // contour
  p.stroke(0);
  p.strokeWeight(lightWidth*0.01);
  if(lux > (3*255))
  	lux = (3*255 - 10);
  p.fill(lux/3 + 10);
  p.ellipse(lightWidth/2,lightWidth,lightWidth/2,lightWidth/2);
  
  myText = lux + lunit;
  p.fill(0, 0, 0);
  p.textSize(Math.round(lightWidth*0.09));
  myWidth = p.textWidth(myText);
  p.text(myText, lightWidth/2 - myWidth/2, lightWidth*1.4 + lightWidth*0.045);
 };
 p.noLoop();
}

var canvas = document.getElementById("barometerCanvas");
var thermometerCanvas = document.getElementById("thermometerCanvas");
var lightCanvas = document.getElementById("lightCanvas");
var barometer = new Processing(canvas, barometerSketchProc);
var thermometer = new Processing(thermometerCanvas, thermometerSketchProc);
//var light = new Processing(lightCanvas, lightSketchProc);

pressureUpdate = function(data) {
 var myData = parseFloat(data) / pressureConfig.scale;
 // Angles for sin() and cos() start at 3 o'clock;
 // subtract HALF_PI to make them start at the top
 // 30miliBar = HALF_PI
 pressure = (myData  - 1000) * (TWO_PI / 120) - HALF_PI;

 if (myData > pmax) pmax = myData;
 if (myData < pmin) pmin = myData;
 
 barometer.redraw();
};

humidityUpdate = function(data) {
 var myData = parseFloat(data) / humidityConfig.scale;
 // Angles for sin() and cos() start at 3 o'clock;
 // subtract HALF_PI to make them start at the top
 // 30% = HALF_PI
 humidity = (myData  - 50) * (TWO_PI / 120) - HALF_PI;

 if (myData > hmax) hmax = myData;
 if (myData < hmin) hmin = myData;
 
 barometer.redraw();
};

temperatureUpdate = function(data) {
 var myData = parseFloat(data) / tempConfig.scale;
 temp = myData;
 if (myData > tmax) tmax = myData;
 if (myData < tmin) tmin = myData;
 thermometer.redraw();
};

luxUpdate = function(data) {
 lux = data;
 light.redraw();
 document.getElementById("light").innerHTML=lux + " lux"; 
};

window.onresize=resizeHandler;
function resizeHandler(){
 setWidth();
 barometer.redraw();
 thermometer.redraw();
 light.redraw();
}

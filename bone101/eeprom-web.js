$(document).ready(function() {
    //setup socket.io-client
    var socket = new io.connect(); 

    //setup handler for receiving the strict with all the expansion pins from the server
    socket.on('getEeproms', function (data) {
        eeproms = data;
        var bonename = eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'].boardName;
        var boneversion = eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'].version.substr(2);
        var boneserial = eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'].serialNumber;

        var bonestring = "BeagleBone ";
        if(bonename.match("A335BNLT")) bonestring += "Black ";
        bonestring += " revision " + boneversion + "<br/>";
        bonestring += "Serial number: " + boneserial + "<br/>";

        printPin(eeproms, '/sys/bus/i2c/drivers/at24/3-0054/eeprom');
        printPin(eeproms, '/sys/bus/i2c/drivers/at24/3-0055/eeprom');
        printPin(eeproms, '/sys/bus/i2c/drivers/at24/3-0056/eeprom');
        printPin(eeproms, '/sys/bus/i2c/drivers/at24/3-0057/eeprom');

            
        $("#eeprom").html(bonestring);
    });
    socket.emit('getEeproms','');
});

function printPin(eeproms, eeprom) {
    var pinString = "";
    address = eeprom.split("/")[6].substr(4);
	if(eeproms[eeprom]) {
        capename = eeproms[eeprom].boardName;
        capebuilder = eeproms[eeprom].manufacturer;
        $('#cape' + address).svg({onLoad: drawBone});
	    $('#cape' + address).width(scale*90 + 'px');
	    $('#cape' + address).height(scale*87 + 'px');
        for(var pin in eeproms[eeprom].mux) {
            if(eeproms[eeprom].mux[pin].used == "used") {
                colourPin($('#cape' + address).svg('get'), pin, eeproms[eeprom].mux[pin].function);
            }
        }        
    }
}

var scale = 5;
var radius1 = 25.4/4 * scale;
var radius2 = 25.4/2 * scale;
var bottomside = (2.15 * 25.4) * scale - 2 * radius2;
var topside = (2.15 * 25.4) * scale - 2 * radius1;
var largeside = (3.4 * 25.4) * scale - radius1 - radius2;

function drawBone(svg) {
    var beaglebonesvg = svg.group("beaglebone", {transform: 'translate(' + 15*scale +',1)'});
    var path = svg.createPath(); 

    svg.path(beaglebonesvg, path.move(radius1,0,false).
    line(topside, 0,true).arc(radius1, radius1, 90, false, true, radius1, radius1, true).
    line(0, largeside, true).arc(radius2, radius2, -90, false, true, -radius2, radius2,true).
    line(-bottomside, 0, true).arc(radius2, radius2, 90, false, true, -radius2, -radius2,true).
    line(0, -largeside, true).arc(radius1, radius1, 90, false, true, radius1, -radius1, true)
    .close(),  
    {fill: '#fafafa', stroke: '#000000', strokeWidth: 1});
    svg.rect(beaglebonesvg, 0, 18 * scale,5 * scale, 58 * scale, {fill: '#fafafa', stroke: '#000000', strokeWidth: 1}); //P9
    svg.rect(beaglebonesvg, bottomside + 2 * radius2 - 5*scale, 18 * scale,5 * scale, 58 * scale, {fill: '#fafafa', stroke: '#000000', strokeWidth: 1}); //P8
    for (i=0;i<=22;i++) {
        //P9
        svg.rect(beaglebonesvg, scale/3, 18.5 * scale + 2.5 * i * scale, 2 * scale, 2 * scale,{fill: '#cdcdcd'});
        svg.rect(beaglebonesvg, 2.6*scale,18.5 * scale + 2.5 * i * scale, 2 * scale, 2 * scale,{fill: '#cdcdcd'});
    }
    for (i=0;i<=22;i++) {
        //P8
        svg.rect(beaglebonesvg, scale/3 + bottomside + 2 * radius2 - 5*scale, 18.4 * scale + 2.5 * i * scale, 2 * scale, 2 * scale,{fill: '#cdcdcd'});
        svg.rect(beaglebonesvg, 2.6*scale + bottomside + 2 * radius2 - 5*scale,18.4 * scale + 2.5 * i * scale, 2 * scale, 2 * scale,{fill: '#cdcdcd'});
    }
    svg.text(beaglebonesvg, 27*scale, 30, capebuilder, {'font-family':"Verdana", 'font-size':16, 'text-anchor':"middle"});
    svg.text(beaglebonesvg, 27*scale, 50, capename, {'font-family':"Verdana", 'font-size':16, 'text-anchor':"middle"});
    svg.text(beaglebonesvg, 27*scale, 70, "I²C address 0x" + address, {'font-family':"Verdana", 'font-size':16, 'text-anchor':"middle"});
}

function colourPin(svg, pin, mux) {
	var beaglebonesvg = svg.group("beaglebone", {transform: 'translate(' + 15*scale +',1)'});
	var connector = pin.substr(0,2);
	var pinnumber = pin.substr(3);
	
	var i = Math.ceil(pinnumber/2) - 1;
	var carry = pinnumber % 2;

	var size = 2 * scale;
	var x = 0;
	var y = 0;	
	if(connector == "P8") {
		if(carry == 1){
			x = scale/3 + bottomside + 2 * radius2 - 5*scale;
			y = 18.4 * scale + 2.5 * i * scale;
		} else {
			x = 2.6*scale + bottomside + 2 * radius2 - 5*scale;
			y = 18.4 * scale + 2.5 * i * scale;
		}
	}
	if(connector == "P9") {
		if(carry == 1) {
			x = scale/3;
			y =  18.5 * scale + 2.5 * i * scale;
		} else {
			x = 2.6*scale;
			y = 18.5 * scale + 2.5 * i * scale;
		}
	};
	svg.rect(beaglebonesvg, x, y, size, size , {fill: '#000000'});
	svg.text(beaglebonesvg, x + size/1.6 - 1, y + size - 1, "" + pinnumber, {'font-family':"Verdana", 'font-size':scale*1.5, 'text-anchor':"middle", 'fill':"#bbbbbb"});
	if(carry == 1){
		svg.text(beaglebonesvg,x - scale, y + size, "" + mux, {'font-family':"Verdana", 'font-size':size, 'text-anchor':"end", 'fill':"#222222"});
	} else {
		svg.text(beaglebonesvg,x + scale*3, y + size, "" + mux, {'font-family':"Verdana", 'font-size':size, 'text-anchor':"start", 'fill':"#222222"});
	}
}


var winston = require('winston');

var debug = process.env.PARSE_DEBUG ? true : false;

// This parses pinmux data from the register value
var modeFromStatus = function(pinData, mode) {
    mode = mode || {};
    mode.mux = (pinData & 0x07);
    mode.slew = (pinData & 0x40) ? 'slow' : 'fast';
    mode.rx = (pinData & 0x20) ? 'enabled' : 'disabled';
    var pullup = (pinData & 0x18) >> 3;
    switch(pullup) {
    case 1:
        mode.pullup = 'disabled';
        break;
    case 2:
        mode.pullup = 'pullup';
        break;
    case 0:
        mode.pullup = 'pulldown';
        break;
    default:
        winston.error('Unknown pullup value: '+pullup);
    }
    return(mode);
};

var modeFromOmapMux = function(readout, mode) {
    if(debug) winston.debug('' + readout);
    mode = mode || {};
    // The format read from debugfs looks like this:
    // name: mcasp0_axr0.spi1_d1 (0x44e10998/0x998 = 0x0023), b NA, t NA
    // mode: OMAP_PIN_OUTPUT | OMAP_MUX_MODE3
    // signals: mcasp0_axr0 | ehrpwm0_tripzone | NA | spi1_d1 | mmc2_sdcd_mux1 | NA | NA | gpio3_16
    var breakdown = '';
    try {
        breakdown = readout.split('\n');
    } catch(ex) {
        winston.info('Unable to parse mux readout "' + readout + '": ' + ex);
        return(mode);
    }
    try {        
        // Parse the muxmode number, '3' in the above example
        mode.mux = breakdown[1].split('|')[1].substr(-1);
        // Parse the mux register value, '0x0023' in the above example
        var pinData = parseInt(breakdown[0].split('=')[1].substr(1,6), 16);
        if(debug) winston.debug('pinData = ' + pinData);
        mode = modeFromStatus(pinData, mode);
    } catch(ex2) {
        winston.info('Unable to parse mux mode "' + breakdown + '": ' + ex2);
    }
    try {
        mode.options = breakdown[2].split('|');
        for(var option in mode.options) {
            var x = ''+mode.options[option];
            try {
                mode.options[option] = x.replace(/ /g, '').replace('signals:', '');
            } catch(ex) {
                winston.info('Unable to parse option "' + x + '": ' + ex);
                mode.options[option] = 'NA';
            }
        }
    } catch(ex3) {
        winston.info('Unable to parse options "' + breakdown + '": ' + ex3);
        mode.options = null;
    }
    return(mode);
};

var modeFromPinctrl = function(pins, muxRegOffset, muxBase, mode) {
    if(debug) winston.debug('' + pins);
    muxBase = muxBase || 0x44e10800;
    mode = mode || {};
    // The format read from debugfs looks like this:
    // registered pins: 142
    // ...
    // pin 108 (44e109b0) 00000027 pinctrl-single
    // ...
    var pinLines = pins.split('\n');
    var numRegistered = pinLines[0].replace(/registered pins: (\d+)/, "$1");
    var pattern = new RegExp('pin ([0-9]+) .([0-9a-f]+). ([0-9a-f]+) pinctrl-single');
    var muxAddress = muxBase + muxRegOffset;
    for(var i = 0; i < numRegistered; i++) {
        if(debug) winston.debug('pinLine = ' + pinLines[i + 1]);
        var parsedFields = pattern.exec(pinLines[i + 1]);
        if(debug) winston.debug('parsedFields = ' + parsedFields);
        //var index = parseInt(parsedFields[1], 10);
        var address = parseInt(parsedFields[2], 16);
        var status = parseInt(parsedFields[3], 16);
        if(address == muxAddress) {
            mode = modeFromStatus(status, mode);
            return(mode);
        }
    }
    //winston.error('Did not find status at ' + muxAddress);
    return(mode);
};

exports.modeFromStatus = modeFromStatus;
exports.modeFromOmapMux = modeFromOmapMux;
exports.modeFromPinctrl = modeFromPinctrl;

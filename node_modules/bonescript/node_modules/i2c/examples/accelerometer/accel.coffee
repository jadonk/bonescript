Wire          = require '../../main'

# for AK8975 
# info: https://github.com/jrowberg/i2cdevlib/blob/master/Arduino/AK8975/AK8975.cpp
# http://stackoverflow.com/questions/4768933/read-two-bytes-into-an-integer

RANGE_BWIDTH      = 0x14
RANGE_BIT         = 0x04
RANGE_LENGTH      = 0x02
RANGE_2G          = 0x00
BANDWIDTH_BIT     = 0x02
BANDWIDTH_LENGTH  = 0x03
BW_25HZ           = 0x00
GET_ID            = 0x00

class Accelerometer

  constructor: (@address) -> 
    @wire = new Wire @address

    @setRange()
    @setBandwidth()

    @wire.on 'data', (data) ->
      console.log data

  setRange: ->
    @wire.write(RANGE_BWIDTH, [RANGE_BIT, RANGE_LENGTH, RANGE_2G], null)

  testConnection: (callback) ->
    @getDeviceID (err, data) ->
     data[0] == 0b010

  getDeviceID: (callback) ->
    @wire.read GET_ID, 1, callback

  setBandwidth: ->
    @wire.write(RANGE_BWIDTH, [BANDWIDTH_BIT, BANDWIDTH_LENGTH, BW_25HZ], null)

  getHeading: ->
    @wire.write(0x0A, 0x1);
    setTimeout =>
      @wire.read 0x03, 6, (err, buffer) ->
        pos = 
          x: ((buffer[1]) << 8) | buffer[0]
          y: ((buffer[3]) << 8) | buffer[2]
          z: ((buffer[5]) << 8) | buffer[4]
        console.log pos
    , 10
  getMotion:  ->
    @wire.stream 0x02, 6, 100


accel = new Accelerometer(56)
accel.getHeading()

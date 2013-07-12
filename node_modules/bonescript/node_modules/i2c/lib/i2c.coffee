_            = require 'underscore'
wire         = require '../build/Release/i2c'
EventEmitter = require('events').EventEmitter

class i2c extends EventEmitter

  history: []

  constructor: (@address, @options = {}) ->
    _.defaults @options,
      debug: false
      device: "/dev/i2c-1"

    if @options.debug 
      require('repl').start(
        prompt: "i2c > "
      ).context.wire = @
      process.stdin.emit 'data', 1 # trigger repl

    process.on 'exit', => @close()

    @on 'data', (data) => 
      @history.push data

    @on 'error', (err) ->
      console.log "Error: #{error}"

    @open @options.device, (err) =>
      unless err then @setAddress @address

  scan: (callback) ->
    wire.scan (err, data) ->
      callback err, _.filter data, (num) -> return num >= 0

  setAddress: (address) ->
    wire.setAddress address
    @address = address

  open: (device, callback) ->
    wire.open device, callback

  close: ->
    wire.close()

  writeByte: (byte, callback) ->
    @setAddress @address
    wire.writeByte byte, callback

  writeBytes: (cmd, buf, callback) ->
    @setAddress @address
    unless Buffer.isBuffer(buf) then buf = new Buffer(buf)
    wire.writeBlock cmd, buf, callback

  readByte: (callback) ->
    @setAddress @address
    wire.readByte callback

  readBytes: (cmd, len, callback) ->
    @setAddress @address
    wire.readBlock cmd, len, null, callback

  stream: (cmd, len, delay = 100) ->
    @setAddress @address
    wire.readBlock cmd, len, delay, (err, data) =>
      if err 
        @emit 'error', err
      else 
        @emit 'data', 
          address    : @address
          data       : data
          cmd        : cmd
          length     : len
          timestamp  : Date.now()

module.exports = i2c
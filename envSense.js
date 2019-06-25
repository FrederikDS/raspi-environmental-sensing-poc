const GrovePi = require('../libs').GrovePi
const Commands = GrovePi.commands
const Board = GrovePi.board
const AirQualityAnalogSensor = GrovePi.sensors.AirQualityAnalog
const DHTDigitalSensor = GrovePi.sensors.DHTDigital
const LightAnalogSensor = GrovePi.sensors.LightAnalog
const LoudnessAnalogSensor = GrovePi.sensors.LoudnessAnalog


let board

function start() {
  console.log('starting')

  board = new Board({
    debug: true,
    onError: function (err) {
      console.log('TEST ERROR')
      console.log(err)
    },
    onInit: function (res) {
      if (res) {

        console.log('GrovePi Version :: ' + board.version())

        let airQualitySensor = new AirQualityAnalogSensor(1)
        // Analog Port 1
        // Air Quality Sensor
        console.log('AirQuality Analog Sensor (start watch)')
        airQualitySensor.on('change', function (res) {
          console.log('AirQuality onChange value=' + res)
        })
        airQualitySensor.watch()

        var dhtSensor = new DHTDigitalSensor(3, DHTDigitalSensor.VERSION.DHT22, DHTDigitalSensor.CELSIUS)
        // Digital Port 3
        // DHT Sensor
        console.log('DHT Digital Sensor (start watch)')
        dhtSensor.on('change', function (res) {
          console.log('DHT onChange value=' + res)
        })
        dhtSensor.watch(500) // milliseconds
        

        var lightSensor = new LightAnalogSensor(0)
        // Analog Port 0
        // Light Sensor
        console.log('Light Analog Sensor (start watch)')
        lightSensor.on('change', function (res) {
          console.log('Light onChange value=' + res)
        })
        lightSensor.watch()

        var loudnessSensor = new LoudnessAnalogSensor(2)
        //Analog Port 2
        // Loudness Sensor
        console.log('Loudness Analog Sensor (start monitoring - reporting results every 10s)')
        loudnessSensor.start()
        setInterval(loudnessSensorGetAvgMax, 10000, loudnessSensor)

      } else {
        console.log('TEST CANNOT START')
      }
    }
  })
  board.init()
}

function loudnessSensorGetAvgMax(loudnessSensor) {
  var res = loudnessSensor.readAvgMax()
  console.log('Loudness avg value=' + res.avg + ' and max value=' + res.max)
}

function onExit(err) {
  console.log('ending')
  board.close()
  process.removeAllListeners()
  process.exit()
  if (typeof err != 'undefined')
    console.log(err)
}

// starts the test
start()
// catches ctrl+c event
process.on('SIGINT', onExit)
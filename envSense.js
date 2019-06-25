const mqtt = require('mqtt');
const GrovePi = require('../libs').GrovePi;
const Commands = GrovePi.commands;
const Board = GrovePi.board;
const AirQualityAnalogSensor = GrovePi.sensors.AirQualityAnalog;
const DHTDigitalSensor = GrovePi.sensors.DHTDigital;
const LightAnalogSensor = GrovePi.sensors.LightAnalog;
const LoudnessAnalogSensor = GrovePi.sensors.LoudnessAnalog;

let count = 0;
let board;

/*********************************************************************
 *  AllThingsTalk Maker IoT configurations
 ********************************************************************/

 // ATT MQTT borker endpoint
 const broker = 'mqtt://api.allthingstalk.io';

 // ATT MQTT username = device token, password = something
 const connectOptions = {
   username: "maker:4VC1djmG7BVFW1VeVv9XYIVLLkOVtxDZ7jX3W0D", 
   password: "justapassword"
 }
 
 // ATT Device config
 const deviceID =  'ZdFafeqtMfKloxAhTHgjd9Zn';
 //const assetName = 'Counter';
 
 // ATT MQTT topic
//  const publishTopic = `device/${deviceID}/asset/${assetName}/state`;
//  const subscribeTopic = `device/${deviceID}/asset/*/feed`;
 
 const mqttOptions={
   retain:true,
   qos:1
 };
 
 /*********************************************************************/

 // connect the client to the att mqtt broker
let client = mqtt.connect(broker, connectOptions);
console.log(`connected flag ${client.connected}`);

//handle incoming messages
client.on('message', (topic, message, packet) => {
	console.log("message is "+ message);
	console.log("topic is "+ topic);
});

//conect
client.on("connect", () => {	
	console.log("connected  "+ client.connected);
});

//handle errors
client.on("error", (error) => {
	console.log("Can't connect" + error);
	process.exit(1)
});

//publish
function publish(topic,msg, options){

	console.log("publishing",msg);

	if (client.connected == true){
		client.publish(topic,msg, options);
	}
}

function start() {
  console.log('starting')

  board = new Board({
    debug: true,
    onError: function (err) {
      console.log('TEST ERROR');
      console.log(err);
    },
    onInit: function (res) {
      if (res) {

        console.log('GrovePi Version :: ' + board.version());

        //Air Quality Sensor, A1
        let airQualitySensor = new AirQualityAnalogSensor(1);
        console.log('AirQuality Analog Sensor (start watch)');
        airQualitySensor.on('change', function (res) {

          console.log('AirQuality onChange value=' + res);
          publish(`device/${deviceID}/asset/AirQuality/state`, `{"value": ${res}}`, mqttOptions); 
        }); 
        //update on change after 5s
        airQualitySensor.watch(5000);


        let dhtSensor = new DHTDigitalSensor(3, DHTDigitalSensor.VERSION.DHT22, DHTDigitalSensor.CELSIUS)
        // Digital Port 3
        // DHT Sensor
        console.log('DHT Digital Sensor (start watch)')
        dhtSensor.on('change', function (res) {
          console.log('DHT onChange value=' + res)
          if(res[0] < 50 && res[0] > 0){
            publish(`device/${deviceID}/asset/Temperature/state`, `{"value": ${res[0]}}`, mqttOptions);
          }
          if(res[1] < 100 && res[1] > 0){
            publish(`device/${deviceID}/asset/Humidity/state`, `{"value": ${res[1]}}`, mqttOptions); 
          }
          
        })
        dhtSensor.watch(5000) // milliseconds
        

        // var lightSensor = new LightAnalogSensor(0)
        // // Analog Port 0
        // // Light Sensor
        // console.log('Light Analog Sensor (start watch)')
        // lightSensor.on('change', function (res) {
        //   console.log('Light onChange value=' + res); 
        //   publish(`device/${deviceID}/asset/Light/state`, `{"value": ${res}}`, mqttOptions);
        // })
        // lightSensor.watch(20000);

        // var loudnessSensor = new LoudnessAnalogSensor(2)
        // //Analog Port 2
        // // Loudness Sensor
        // console.log('Loudness Analog Sensor (start monitoring - reporting results every 10s)')
        // loudnessSensor.start()
        // setInterval(loudnessSensorGetAvgMax, 10000, loudnessSensor)

      } else {
        console.log('TEST CANNOT START')
      }
    }
  })
  board.init()
}

function loudnessSensorGetAvgMax(loudnessSensor) {
  var res = loudnessSensor.readAvgMax()
  console.log('Loudness avg value=' + res.avg + ' and max value=' + res.max); 
  publish(`device/${deviceID}/asset/Sound/state`, `{"value": ${res.avg}}`, mqttOptions);
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
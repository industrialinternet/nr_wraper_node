// Node-RED wrapper for node-EnOcean
// v00.2a

module.exports = function(RED) {
    function EnoceanNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        
		var enocean = require("node-enocean")({
			sensorFilePath:"/home/pi/.node-red/node_modules/node-enocean/modules/knownSensors.json"
		});

		var msg = { payload: "Listening on " + config.serial };
		node.send(msg);
		enocean.listen(config.serial);

		enocean.on("known-data",function(data){   
			node.log('known EnOcean device: '+data.senderId);
			var dbmValue = 0 - parseInt(data.rawByte.substr(data.rawByte.length - 6).substr(0, 2), 16);
			var msg = { 
				payload: {id: data.senderId, v: data.values[0].value, unit: data.values[0].unit, rssi: dbmValue,  
				type: data.values[0].type, EEP: data.sensor.eep, man: data.sensor.manufacturer, 
				Desc: data.sensor.desc, rV: data.raw, rawByte: data.rawByte } 
			};
			node.send(msg);
		});	

		enocean.on("unknown-data",function(data){   
			node.log('Unknown EnOcean device: '+data.senderId);
			var dbmValue = 0 - parseInt(data.rawByte.substr(data.rawByte.length - 6).substr(0, 2), 16);	
			var msg = { payload: {id: data.senderId, rV: data.raw, rssi: dbmValue} };
			node.send(msg);
		});
		
		/* enocean.on("data",function(data){   
			node.log('EnoTele unknown-data');
			var msg = 
			{ 
				payload: 
				"SenderID: " + data.senderId + 
				"; Data: " + data.raw + 
				"; RawByte: " + data.rawByte
			};

			node.send(msg);
		}); */

		enocean.on("ready",function(data){   
			node.log('EnO ready');
		});

    }
    RED.nodes.registerType("enocean",EnoceanNode);
} 

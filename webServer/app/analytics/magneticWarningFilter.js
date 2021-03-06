/**
@module analytics/magneticWarningFilter
@description performs analysis on the magnetometer data
@deprecated until this feature performs properly
@requires interProcessCommunication/websocket
@requires config/regulationConfig
*/

var wss = require('../interProcessCommunication/websocket');
var regulationConfig = require('../config/regulationConfig');

// if the absolute value of a number is less than this value, then it will be considered 0
var zero_threshold = 0.000001;

// constant threshold used to determine whether the magnetic field is being altered by more than the earth's magnetic field
var mag_threshold = 1;

// global mag and gyro queue
var gm_queue = [];

/**
@function magFilter
@description generates notifications based on differences in magnetic field readings and gyroscope reading
@param {string} _id - a mongo user id
@param {Number} _data_stream - gyroscopic and magnometer data in the x, y and z planes
*/
var magFilter = function(_id, _data_stream){

	// create datapoint of magnetic and gyro data to add to queue
	var magData = {
		gyro_x: Number.parseFloat(_data_stream.gyro_x),
		gyro_y: Number.parseFloat(_data_stream.gyro_y),
		gyro_z: Number.parseFloat(_data_stream.gyro_z),
		mag_x: Number.parseFloat(_data_stream.mag_x),
		mag_y: Number.parseFloat(_data_stream.mag_y),
		mag_z: Number.parseFloat(_data_stream.mag_z)
 	};

 	if (Math.abs(magData.gyro_x) < zero_threshold || magData.gyro_x == null) {
 		magData.gyro_x = 0;
 	}
 	if (Math.abs(magData.gyro_y) < zero_threshold || magData.gyro_y == null) {
 		magData.gyro_y = 0;
 	}
 	if (Math.abs(magData.gyro_z) < zero_threshold || magData.gyro_z == null) {
 		magData.gyro_z = 0;
 	}
 	if (Math.abs(magData.mag_x) < zero_threshold || magData.mag_x == null) {
 		magData.mag_x = 0;
 	}
 	if (Math.abs(magData.mag_y) < zero_threshold || magData.mag_y == null) {
 		magData.mag_y = 0;
 	}
 	if (Math.abs(magData.mag_z) < zero_threshold || magData.mag_z == null) {
 		magData.mag_z = 0;
 	}

	gm_queue.push(magData);
	// only have the most recent 10 datapoints in the queue
 	if (gm_queue.length > 2) {
 		gm_queue.shift();
 	}

 	// analyze the most recent 10 datapoints to see if the gyroscope and magnetic data are in sync
 	var magwarn = false;

 	for (var i = 1; i < gm_queue.length; i++) {
 		var gm_diff = gyromagDiff(i);
 		if (Math.abs(gm_diff.mag_x / gm_diff.gyro_x) > mag_threshold) {
			magwarn = true;
		}
 		if (Math.abs(gm_diff.mag_y / gm_diff.gyro_y) > mag_threshold) {
 			magwarn = true;
 		}
 		if (Math.abs(gm_diff.mag_z / gm_diff.gyro_z) > mag_threshold) {
 			magwarn = true;
 		}
 	}
 
	// if the threshold was exceeded then throw a warning
	if (magwarn == true)
	{
		var warning = {
			type: 'notification',
			level: 'hazard',
			param: 'magnetic field sensor',
			text: 'Your drone is nearing sources of electromagnetic interference',
			time: (new Date()) - regulationConfig.cur_flight[_id].start_time
		};
		wss.broadcast(JSON.stringify(warning));

		gm_queue = [];
	}
}

/**
@function gyromagDiff 
@description calculates difference in gyroscopic and magnometer data
@param {Number} i - index of queue
@returns {Number} difference in gyroscopic and magnometer data
*/
var gyromagDiff = function(i) {
	var gm_diff = {
		gyro_x: gm_queue[i].gyro_x - gm_queue[i-1].gyro_x,
		gyro_y: gm_queue[i].gyro_y - gm_queue[i-1].gyro_y,
		gyro_z: gm_queue[i].gyro_z - gm_queue[i-1].gyro_z,
		mag_x: gm_queue[i].mag_x - gm_queue[i-1].mag_x,
		mag_y: gm_queue[i].mag_y - gm_queue[i-1].mag_y,
		mag_z: gm_queue[i].mag_z - gm_queue[i-1].mag_z,
	}
	return gm_diff;
}

// export publice functions
module.exports = {
	magFilter: magFilter
};
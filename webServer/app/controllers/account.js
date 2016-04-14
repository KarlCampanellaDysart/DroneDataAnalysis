/**
@module account - controller to interact with user accounts directly
*/

/**
@requires buildingProximity
@requires user
@requires airport
*/

var buildingProximity = require('../analytics/buildingProximity');
var User = require('../models/user');
var BinaryMap = require('../models/binaryMap');
var Airport = require('../models/airport');

/**
@function configureUserMap - function to generate a bitmap of the given range of longitudes and latitudes
@alias controllers/account.configureUserMap
@param {object} _latLngNW - longitude latitude object for the Northwest border
@param {object} _latLngWE - longitude latitude object for the Southest border
@param {String} _username - a username
@param {function} _callback - a callback function for the result of the operation
*/
var configureUserMap = function (_latLngNW, _latLngSE, _id, _callback){
	
	// set new map set
	BinaryMap.find({ 'user': _id }, function (err, maps) {
		if (err || maps === null) _callback('error'); 
		else{
			var numMaps = maps.length;
			var mapCount = 0;

			// delete all maps
			if(numMaps > 0){
				for(var i=0;i<numMaps;i++){
					maps[i].remove(function(err, data){
						if (err) console.log(err);
						else {
							mapCount++;

							// generate range once we delete all maps
							if(mapCount === numMaps){
								deleteAllAirportsForUser(_id, function(){
									console.log('done deleting airports');
									buildingProximity.generateMapWithRange(_latLngNW, _latLngSE, _id, _callback);
								});
							}
						}
					});
				} 
			}
			else{ 
				deleteAllAirportsForUser(_id, function(){
					console.log('done deleting airports');
					buildingProximity.generateMapWithRange(_latLngNW, _latLngSE, _id, _callback);
				});
			}
		}
	});
}

var deleteAllAirportsForUser = function(_id, _callback){
	Airport.find({ 'user': _id }, function (err, airports) {
		if (err || airports === null) _callback('error'); 
		else{
			var numAirports = airports.length;
			var airportCount = 0;

			// delete all maps
			if(numAirports > 0){
				for(var i=0;i<numAirports;i++){
					airports[i].remove(function(err, data){
						if (err) console.log(err);
						else {
							airportCount++;

							// generate range once we delete all maps
							if(airportCount === numAirports) _callback();
						}
					});
				} 
			}
			else _callback();
		}
	});
};

/**
@function isUserMapConfigured - function to check if a given user already generated a map
@alias controllers/account.isUserMapConfigured
@param {String} _username - a username
@param {function} _callback - a callback function for the result of the operation
*/
var getUserMapConfigured = function (_id, _callback){

	// check current map configuration
	BinaryMap.find({ 'user': _id }, function (err, maps) {
		if (err || maps === null){ _callback({success: false}); }
		else{

			// return success if map is set
			_callback({success: true, data: maps}); 
		}
	});
}



/**
@function loginUser - a function to login a user
@alias controllers/account.loginUser
@param {String} _username - username
@param {String} _pass - password
@param {Function} _callback - a callback function
*/
var loginUser = function (_username, _pass, _callback){

	User.findOne({ 'username': _username, 'password': _pass }, function (err, user) {
		if (err || user === null){
			_callback('error'); 
		}
		else{ _callback('sucessful', _username); }
	});
}

/**
@function createNewUser - a function to create a new user
@alias controllers/account.createNewUser
@param {String} _username - username
@param {String} _pass - password
@param {String} _name - the users full name
@param {Function} _callback - a callback function
*/
var createNewUser = function (_username, _pass, _name, _callback){

	// look for user with same username
	User.findOne({ 'username': _username }, function (err, user) {

		// found a duplicate
		if (!(err || user === null)){ _callback('user with same username exists'); }
		
		// no matches
		else{

			// set up data
			var data = {
				name: _name,
				username: _username,
				password: _pass,
				admin: false,
				map: null
			}

			// create new model and save
			var u = new User(data);
			u.save(function (error, data){
                if(error){ console.log(error); }
                else{ console.log(data); }
            });

			// callback to client
			_callback('new user created', _username);
		}
	});
}

// export all modules
module.exports = {
	loginUser: loginUser,
	createNewUser: createNewUser,
	configureUserMap: configureUserMap,
	getUserMapConfigured: getUserMapConfigured
};
/**
@module models/altitude
@requires mongoose
*/

var mongoose = require('mongoose');

// initalize scheme object
var Schema = mongoose.Schema;

// describe user in schema
var altitudeSchema = new Schema({
	flight_id: { type: Schema.Types.ObjectId, ref: 'Flight' },
	alt: { type: Number, required: true},
	created_at: Date
});

// declare exported module
var Altitude = mongoose.model('Altitude', altitudeSchema);

// export module 
module.exports = Altitude;
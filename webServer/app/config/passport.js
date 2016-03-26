/**
@module passport
*/

/**
@requires user
@requires passport
*/

var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/**
@function setupUser - to setup passport options with express app
@param {Object} _app - the express app object
*/
var setupUser = function(_app){

	_app.use(passport.initialize());
	_app.use(passport.session());

	passport.use(new LocalStrategy(User.authenticate()));
	passport.serializeUser(User.serializeUser());
	passport.deserializeUser(User.deserializeUser());
};

// export module
module.exports = setupUser;
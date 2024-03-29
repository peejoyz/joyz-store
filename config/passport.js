let LocalStrategy = require('passport-local').Strategy;
let User = require('../models/user');
let bcrypt = require('bcryptjs');

module.exports = function(passport) {
    passport.use(new LocalStrategy(function(username, password, done) {
        //signing in
        User.findOne({username: username}, function(err, user) {
            if(err)
                //console.log(err);
                return done(err);
            if(!user) {
                return done(null, false, {message: 'No user found'});
            }

            bcrypt.compare(password, user.password, function(err, isMatch) {
                if(err) 
                    // console.log(err);
                    return done(err);
                if(!isMatch) 
                    return done(null, false, {message: 'The credentials you entered is incorrect.'});
                    return done(null, user);
            })
        })
    }));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
}
// jshint esversion:6

const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Model
const User = require('./../models/user');

module.exports = function(passport) {  // Passport will be passed in from 'app.js' file
  passport.use(
    new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
      // Match User
      User.findOne({email: email})
      .then(user => {
        if (!user) {
          return done(null, false, {message: 'That email is not registered!'});
        }

        // Match Password
         bcrypt.compare(password, user.password, (err, isMatch) => {
           if (err) throw err;

           if (isMatch === true) {
             return done(null, user);
           } else {
             return done(null, false, {message: 'Password is incorrect!'});
           }
         });
      })
      .catch(err => {
        console.log(err);
      });
    })
  );

  // Serialise & Deserialise User
  passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
};

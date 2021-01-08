// jshint esversion:6

require('dotenv').config({path: './config.env'});
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('passport-local');
const flash = require('connect-flash');

const app = express();
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.static(`${__dirname}/public`));
app.use('/account', express.static(`${__dirname}/public`));
app.use('/account/details', express.static(`${__dirname}/public`));

// Express-Session
app.use(session({
  secret: 'JavaScript',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

// Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Passport
require('./config/passport')(passport);

// DB Config
const DB = require('./config/keys').MongoURI;

mongoose.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  console.log('MongoDB Connected!');
})
.catch(err => {
  console.log(err);
});

const User = require('./models/user-model');

// For Next Time: Start testing register POST route!

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/account', (req, res) => {
  res.render('account');
});

app.get('/account/register', (req, res) => {
  res.render('register');
});

app.get('/account/login', (req, res) => {
  res.render('login');
});

app.get('/account/details', (req, res) => {
  res.render('update');
});

app.get('/account/details/login', (req, res) => {
  res.render('update-login');
});

app.get('/account/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are now logged out!');
  res.redirect('/account/login');
});

app.post('/account/register', (req, res) => {
  const { name, email, password1, password2 } = req.body;
  let errors = [];  // Holds error message objects

  // Check for missing fields
  if (!name || !email || !password1 || !password2) {
    errors.push({
      message: 'Please fill out all the fields!'
    });
  }

  // Check that passwords match
  if (password1 !== password2) {
    errors.push({
      message: 'Passwords don\'t match!'
    });
  }

  // Check password length
  if (password1.length < 6) {
    errors.push({
      message: 'Password should be AT LEAST 6 characters!'
    });
  }

  // Page will be re-rendered if any validaton checks fail
  if (errors.length > 0) {
    res.render('register', {
      errors, name, email, password1, password2
    });
  } else {
    // Validation Passed
    User.findOne({email: email})
    .then(user => {
      // If user exists
      if (user) {
        errors.push({message: 'That email is already registered!'});
        res.render('register', {
          name, email, password1, password2
        });
      } else {
        // If user doesn't exist, create one & save. Mongoose Encryption will automatically encrypt user password...
        const newUser = new User({
          name,
          email,
          password: password1
        });

        // Save user
        newUser.save()
        .then(user => {
          req.flash('success_msg', 'You have now been registered!');
          res.redirect('/account/login');
        });
      }
    })
    .catch(err => {
      errors.push({message: 'An error occcurred, please try again!'});
      res.render('register', {
        name, email, password1, password2
      });
    });
  }
});

const port = process.env.PORT;

app.listen(port, (req, res) => {
  console.log(`Listening on port ${port}...`);
});

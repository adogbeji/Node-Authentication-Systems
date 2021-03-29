// jshint esversion:6

require('dotenv').config({path: './config.env'});
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('passport-local');
const bcrypt = require('bcryptjs');
const saltRounds = 9;
const flash = require('connect-flash');

const app = express();
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.static(`${__dirname}/public`));
app.use('/account', express.static(`${__dirname}/public`));
app.use('/account/details', express.static(`${__dirname}/public`));

// Express Session
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

mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
.then(() => {
  console.log('MongoDB Connected!');
})
.catch(err => {
  console.log(err);
});

const User = require('./models/user-model');

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/account', (req, res) => {  // Put in Account Page: <%= name %>
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


const port = process.env.PORT;

// For Next Time: Build 'logout' & 'delete' routes, then start building POST routes!

app.listen(port, (req, res) => {
  console.log(`Listening on port ${port}...`);
});

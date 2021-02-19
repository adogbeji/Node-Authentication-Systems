// jshint esversion:6

require('dotenv').config({path: './config.env'});
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express();
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.static(`${__dirname}/public`));
app.use('/account', express.static(`${__dirname}/public`));
app.use('/account/details', express.static(`${__dirname}/public`));

const DB = 'mongodb+srv://ben:uNEFt4nW3Ok2kpAF@authentication-app.beqyt.mongodb.net/userDB?retryWrites=true&w=majority';

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

const port = process.env.PORT;

// For Next Time: Create Schema & Model and continue building server

app.listen(port, (req, res) => {
  console.log(`Listening on port ${port}...`);
});

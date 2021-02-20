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

const port = process.env.PORT;

// For Next Time: Create Atlas Cluster and continue building server

app.listen(port, (req, res) => {
  console.log(`Listening on port ${port}...`);
});

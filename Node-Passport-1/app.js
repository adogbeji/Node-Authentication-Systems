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

// Protecting RESTRICTED Pages
const { ensureAuthenticated_1, ensureAuthenticated_2, ensureAuthenticated_3 } = require('./config/auth');

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
const db = require('./config/keys').MongoURI;

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  console.log('MongoDB Connected!');
})
.catch(err => {
  console.log(err);
});

const User = require('./models/user');


const getHomePage = (req, res) => {
  res.render('home');
};

const getAccountPage = (req, res) => {
  const clientName = req.user.name;  // req.user contains autheticated user
  res.render('account', {name: clientName});
};

const getRegisterPage = (req, res) => {
  res.render('register');
};

const getLoginPage = (req, res) => {
  res.render('login');
};

const getAccountDetailsPage = (req, res) => {
  res.render('update');
};

const getAccountDetailsLoginPage = (req, res) => {
  res.render('update-login');
};

const accountLogout = (req, res) => {
  req.logout();
  req.flash('success_msg', 'You have now logged out!');
  res.redirect('/account/login');
};

const accountDelete = (req, res) => {
  let errors = [];

  User.deleteOne({name: req.user.name})
  .then(noAccount => {
    if (noAccount) {
      req.flash('success_msg', 'Your account has now been closed!');
      res.redirect('/account/register');
    }
  })
  .catch(err => {
    errors.push({
      message: 'An error occurred, please try again!'
    });
  });
};

const createAccount = (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Check for missing fields
  if (!name || !email || !password || !password2) {
    errors.push({
      message: 'Please fill out all the fields!'
    });
  }

  // Check that passwords match
  if (password !== password2) {
    errors.push({
      message: 'Passwords don\'t match!'
    });
  }

  // Check password length
  if (password.length < 6) {
    errors.push({
      message: 'Password should be AT LEAST 6 characters!'
    });
  }

  // Page will be re-rendered if any validaton checks fail
  if (errors.length > 0) {
    res.render('register', {
      errors, name, email, password, password2
    });
  } else {
    // Validation passed
    User.findOne({email: email})
    .then(user => {
      // If user exists
      if (user) {
        errors.push({message: 'That email is already registered!'});
        res.render('register', {
          name, email, password, password2
        });
      } else {
        // If user doesn't exist, create new one & ENCRYPT password!
        const newUser = new User({
          name,
          email,
          password
        });

        // Hash passwod
        bcrypt.genSalt(saltRounds, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
             if (err) throw err;
             // Set password to Hash
             newUser.password = hash;
             // Save user
             newUser.save()
             .then(user => {
               req.flash('success_msg', 'You have now been registered!');
               res.redirect('/account/login');
             });
           });
        });
      }
    })
    .catch(err => {
      errors.push({message: 'An error occurred, please try again!'});
      res.render('register', {
        name, email, password, password2
      });
    });
  }
};

const accountLogin = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: '/account',
    failureRedirect: '/account/login',
    failureFlash: true
  })(req, res, next);
};

const updateAccountDetails = (req, res) => {
  const {name, email, password} = req.body;
  let errors = [];
  let success = [];

  //Check for missing fields
  if (!name && !email && !password) {
    errors.push({
      message: 'Please update at least ONE field below!'
    });
  }

  //Page will be re-rendered if validation fails
  if (errors.length > 0) {
    res.render('update', {errors});
  }

  // Check for completed fields - WORKS!
  if (name !== '' && email !== '' && password !== '') {
    return User.findOne({name: req.user.name}, (err, user) => {
      if (!err) {
        // Update fields of returned user
        user.name = name;
        user.email = email;
        user.password = password;

        // Hash Password
        bcrypt.genSalt(saltRounds, (err, salt) => {
    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) throw err;
        // Set password to hash
        user.password = hash;
        // Save new user
        user.save()
        .then(user => {
          success.push({
            message: 'Your details have been updated!'
          });
          return res.render('update', {success, name, email});
        });
      });
    });
      } else {
        errors.push({
          message: 'An error occurred, please try again!'
        });
        res.render('update', {errors});
      }
    });
  }


  // Check for Name & Email - WORKS
 if (name !== "" && email !== "") {
   return User.findOne({name: req.user.name}, (err, user) => {
     if (!err) {
       // Update fields of returned user
       user.name = name;
       user.email = email;

       // Save user
       user.save()
       .then(user => {
         success.push({
           message: "Name and Email have been updated!"
         });
         return res.render("update", {success, name, email});
       });
     } else {
       errors.push({
         message: "An error occurred, please try again!"
       });
       res.render("update", {errors});
     }
   });
}

  // Check for Name & Password - WORKS!
  if (name !== "" && password !== "") {
    return User.findOne({name: req.user.name}, (err, user) => {
      if (!err) {
        // Update fields of returned user
        user.name = name;
        user.password = password;

        // Hash Password
        bcrypt.genSalt(saltRounds, (err, salt) => {
    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) throw err;
        // Set password to hash
        user.password = hash;
        // Save new user
        user.save()
        .then(user => {
          success.push({
            message: "Name and Password have been updated!"
          });
          return res.render("update", {success, name});
        });
      });
    });
      } else {
        errors.push({
          message: "An error occurred, please try again!"
        });
        res.render("update", {errors});
      }
    });
  }

  // Check for Password & Email - WORKS!
  if (email !== "" && password !== "") {
    return User.findOne({name: req.user.name}, (err, user) => {
      if (!err) {
        // Update fields of returned user
        user.email = email;
        user.password = password;

        // Hash Password
        bcrypt.genSalt(saltRounds, (err, salt) => {
    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) throw err;
        // Set password to hash
        user.password = hash;
        // Save new user
        user.save()
        .then(user => {
          success.push({
            message: "Email and Password have been updated!"
          });
          return res.render("update", {success, email});
        });
      });
    });
      } else {
        errors.push({
          message: "An error occurred, please try again!"
        });
        res.render("update", {errors});
      }
    });
  }

  // Check for Name - WORKS!
  if (name !== "") {
    return User.findOne({name: req.user.name}, (err, user) => {
      if (!err) {
        // Update fields of returned user
        user.name = name;

        // Save new user
        user.save()
        .then(user => {
          success.push({
            message: "Your Name has been updated!"
          });
          return res.render("update", {success, name});
        });
      } else {
        errors.push({
          message: "An error occurred, please try again!"
        });
        res.render("update", {errors});
      }
    });
  }


  // Check for Email - WORKS!
  if (email !== "") {
    return User.findOne({name: req.user.name}, (err, user) => {
      if (!err) {
        // Update fields of returned user
        user.email = email;

        // Save new user
        user.save()
        .then(user => {
          success.push({
            message: "Your Email has been updated!"
          });
          return res.render("update", {success, email});
        });
      } else {
        errors.push({
          message: "An error occurred, please try again!"
        });
        res.render("update", {errors});
      }
    });
  }

  // Check for Password - WORKS!
  if (password !== "") {
    return User.findOne({name: req.user.name}, (err, user) => {
      if (!err) {
        // Update fields of returned user
        user.password = password;

        // Hash Password
        bcrypt.genSalt(saltRounds, (err, salt) => {
    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) throw err;
        // Set password to hash
        user.password = hash;
        // Save new user
        user.save()
        .then(user => {
          success.push({
            message: "Your Password has been updated!"
          });
          return res.render("update", {success});
        });
      });
    });
      } else {
        errors.push({
          message: "An error occurred, please try again!"
        });
        res.render("update", {errors});
      }
    });
  }
};

const accountDetailsLoginPage = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/account/details',
    failureRedirect: '/account/details/login',
    failureFlash: true
  })(req, res, next);
};

app
.route('/')
.get(getHomePage);

app
.route('/account')
.get(ensureAuthenticated_1, getAccountPage);

app
.route('/account/register')
.get(getRegisterPage)
.post(createAccount);

app
.route('/account/login')
.get(getLoginPage)
.post(accountLogin);

app
.route('/account/details')
.get(ensureAuthenticated_2, getAccountDetailsPage)
.post(updateAccountDetails);

app
.route('/account/details/login')
.get(getAccountDetailsLoginPage)
.post(accountDetailsLoginPage);

app
.route('/account/logout')
.get(ensureAuthenticated_3, accountLogout);

app
.route('/account/delete')
.get(ensureAuthenticated_3, accountDelete);


const port = process.env.PORT;

app.listen(port, (req, res) => {
  console.log(`Listening on port ${port}...`);
});

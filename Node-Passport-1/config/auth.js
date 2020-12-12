// jshint esversion:6

exports.ensureAuthenticated_1 = function(req, res, next) {  // Account Page
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view this page!');
    res.redirect('/account/login');
  };

exports.ensureAuthenticated_2 = function(req, res, next) {  // Account Details Page
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'Please log in to view this page!');
  res.redirect('/account/details/login');
};

exports.ensureAuthenticated_3 = function(req, res, next) {  // Logout & Delete Account Route
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'Please create an account below!');
  res.redirect('/account/register');
};

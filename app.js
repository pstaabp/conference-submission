
/**
 * Module dependencies.
 */

var express = require('express')
  , ldap_settings = require('./ldap')
  , flash = require('connect-flash')
  , jade = require('jade')
  , _und = require('underscore')
  , http = require('http')
  , path = require('path')
  , connect = require('connect')
  , connectTimeout = require('connect-timeout')
  , morgan = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , mongoose = require('mongoose')
  , mongoStore = require('connect-mongodb')
  , nodemailer = require("nodemailer")
  , models = require('./models')
  , templatesDir   = path.join(__dirname, 'templates')
  , emailTemplates = require('email-templates')
  , LoginRoutes = require('./routes/loginRoutes')
  , UserRoutes = require('./routes/userRoutes')
  , ProposalRoutes = require('./routes/proposalRoutes')
  , db
  , User
  , Proposal
  , LoginToken
  , Judge
  , Settings = { development: {}, test: {}, production: {} };

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('combined'))
app.use(express.static(path.join(__dirname, 'public')));
//app.set('port',8080);
mongoose.set('debug',true);
app.set('db-uri', 'mongodb://localhost:27017/conf-dev');
app.locals.pretty = true;
app.locals.moment = require('moment');
app.locals._ = require('underscore');
app.use("/conference-submission/stylesheets",express.static(__dirname + "/public/stylesheets"));
app.use("/conference-submission/javascripts",express.static(__dirname + "/public/javascripts"));
app.use("/conference-submission/img",express.static(__dirname + "/public/images"));


// app.configure('development', function() {
//   mongoose.set('debug',true);
   app.set('db-uri', 'mongodb://localhost:27017/conf-dev');
//   app.use(express.errorHandler({ dumpExceptions: true }));
//   app.locals.pretty = true;
//   app.locals.moment = require('moment');
//   app.locals._ = require('underscore');
// }); 

/*app.configure('production', function() {
  mongoose.set('debug',true);
  app.set('db-uri', 'mongodb://localhost:27017/conf2014');
  app.use(express.errorHandler({ dumpExceptions: true }));
  app.locals.pretty = true;
  app.locals.moment = require('moment');
  app.locals._ = require('underscore');
}); */ 


// app.configure(function(){
//   app.set('port', process.env.PORT || 8080);
//   app.set('views', __dirname + '/views');
//   app.use(express.favicon());
//   app.use(express.bodyParser());
//   app.use(express.cookieParser());
//   app.use(connectTimeout({ time: 10000 }));
//   app.use(express.session({ store: mongoStore(app.set('db-uri')), secret: 'topsecret' }));
//   app.use(express.logger({ format: '\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms' }))
//   app.use(express.methodOverride());
//   app.use(flash());
//   app.use("/conference-submission/stylesheets",express.static(__dirname + "/public/stylesheets"));
//   app.use("/conference-submission/javascripts",express.static(__dirname + "/public/javascripts"));
//   app.use("/conference-submission/img",express.static(__dirname + "/public/images"));
// });

models.defineModels(mongoose, function() {
  app.Proposal = Proposal = mongoose.model('Proposal');
  app.User = User = mongoose.model('User');
  app.LoginToken = LoginToken = mongoose.model('LoginToken');
  app.Judge = Judge = mongoose.model('Judge');
  db = mongoose.connect(app.set('db-uri'));
});

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    host: "barracuda.fitchburgstate.edu"
});




function routeUser(res,user){
  res.redirect("/conference-submission/" + (typeof(user.role[0])==="undefined"? "welcome": user.role[0]));
}

function loadUser(req, res, next) {
  if (req.session.user_id) {
    User.findById(req.session.user_id, function(err, user) {
      if (user) {
        req.currentUser = user;
        next();
      } else {
        res.redirect('/conference-submission/login',{user: {}, msg: ""});
      }
    });
  } else if (req.cookies.logintoken) {
    authenticateFromLoginToken(req, res, next);
  } else {
    console.log("[loadUser]  No session data");
    res.redirect('/conference-submission/login',{user: {}, msg: ""});
  }
}

function authenticateFromLoginToken(req, res, next) {
  var cookie = JSON.parse(req.cookies.logintoken);

  LoginToken.findOne({ email: cookie.email,
                       series: cookie.series,
                       token: cookie.token }, (function(err, token) {

    if (!token) {
      res.redirect('/conference-submission/login');
      return;
    }

    User.findOne({ email: token.email }, function(err, user) {
      if (user) {
        console.log("in auth");
        console.log(user);
        req.session.user_id = user.id;
        req.currentUser = user;

        token.token = token.randomToken();
        token.save(function() {
          res.cookie('logintoken', token.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
          next();
        });
      } else {
        res.redirect('/conference-submission/login');
      }
    });
  }));
}

console.log("Connecting to mongodb, port 27017");
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

mongoose.connection.on('error', function(err){console.log("err: " + err)});

var loginRoutes = new LoginRoutes(app,User,routeUser,LoginToken,loadUser);
var userRoutes = new UserRoutes(app,loadUser,User,Proposal,Judge);
var proposalRoutes = new ProposalRoutes(app,loadUser,User,Proposal);

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

var server = app.listen(8080, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})


// if (!module.parent) {
//   app.listen(app.set("port"));
//   console.log('Express server listening on port %s, environment: %s', app.set("port"), app.settings.env);
//   console.log('Using connect %s, Express %s, Jade %s', connect.version, express.version, jade.version);
// }

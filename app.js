
/**
 * Module dependencies.
 */

var express = require('express')
  , ldap_settings = require('./ldap')
  , flash = require('connect-flash')
  , jade = require('jade')
  , session = require('express-session')
  , _und = require('underscore')
  , http = require('http')
  , path = require('path')
  , connect = require('connect')
  , connectTimeout = require('connect-timeout')
  , morgan = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , jsonParser = bodyParser.json()
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

app.use(express.static(path.join(__dirname, 'public')));
//app.set('port',8080);
//mongoose.set('debug',true);
app.set('db-uri', 'mongodb://localhost:27017/' + ldap_settings.settings.db_name);
app.locals.pretty = true;
app.locals.moment = require('moment');
app.locals._ = require('underscore');
app.set('views', __dirname + '/views');
app.use('/' + ldap_settings.settings.top_dir + '/stylesheets',express.static(__dirname + "/public/stylesheets"));
app.use('/' + ldap_settings.settings.top_dir + '/javascripts',express.static(__dirname + "/public/javascripts"));
app.use('/' + ldap_settings.settings.top_dir + '/img',express.static(__dirname + "/public/images"));

// change this to either development or production
app.set('env','production');

// set up the session variables

var sess = {
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {}
};


// app.configure('development', function() {
//   mongoose.set('debug',true);
//   app.set('db-uri', 'mongodb://localhost:27017/conf-2015');
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

//   app.use(express.favicon());
//   app.use(express.bodyParser());
//   app.use(express.cookieParser());
//   app.use(connectTimeout({ time: 10000 }));
//   app.use(express.session({ store: mongoStore(app.set('db-uri')), secret: 'topsecret' }));
//   app.use(express.logger({ format: '\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms' }))
//   app.use(express.methodOverride());
//   app.use(flash());
//   app.use("/' + ldap_settings.settings.top_dir + '/stylesheets",express.static(__dirname + "/public/stylesheets"));
//   app.use("/' + ldap_settings.settings.top_dir + '/javascripts",express.static(__dirname + "/public/javascripts"));
//   app.use("/' + ldap_settings.settings.top_dir + '/img",express.static(__dirname + "/public/images"));
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
  res.redirect('/' + ldap_settings.settings.top_dir + '/' + (typeof(user.role[0])==="undefined"? "welcome": user.role[0]));
}

function loadUser(req, res, next) {
  if (req.session.user_id) {
    User.findById(req.session.user_id, function(err, user) {
      if (user) {
        req.currentUser = user;
        next();
      } else {
        res.redirect('/' + ldap_settings.settings.top_dir + '/login',{user: {}, msg: ""});
      }
    });
  } else if (req.cookies.logintoken) {
    authenticateFromLoginToken(req, res, next);
  } else {
    console.log("[loadUser]  No session data");
    res.redirect({user: {}, msg: ""},'/' + ldap_settings.settings.top_dir + '/login');
  }
}

function authenticateFromLoginToken(req, res, next) {
  var cookie = JSON.parse(req.cookies.logintoken);

  LoginToken.findOne({ email: cookie.email,
                       series: cookie.series,
                       token: cookie.token }, (function(err, token) {

    if (!token) {
      res.redirect('/' + ldap_settings.settings.top_dir + '/login');
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
        res.redirect('/' + ldap_settings.settings.top_dir + '/login');
      }
    });
  }));
}

console.log("Connecting to mongodb, port 27017");
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

mongoose.connection.on('error', function(err){console.log("err: " + err)});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    app.use(morgan('dev'));
    res.render('error', {
      message: err.message,
      error: err
    });
  });
} else {

  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    app.use(morgan('combined'))
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies

    res.render('error', {
      message: err.message,
      error: {}
    });
  });
}
app.use(session(sess));

// testing the session data

app.use(function (req, res, next) {
  console.log("testing");
  next();
});


var loginRoutes = new LoginRoutes(app,User,routeUser,LoginToken,loadUser);
var userRoutes = new UserRoutes(app,loadUser,User,Proposal,Judge);
var proposalRoutes = new ProposalRoutes(app,loadUser,User,Proposal);


module.exports = app;

var server = app.listen(ldap_settings.settings.app_port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})


// if (!module.parent) {
//   app.listen(app.set("port"));
//   console.log('Express server listening on port %s, environment: %s', app.set("port"), app.settings.env);
//   console.log('Using connect %s, Express %s, Jade %s', connect.version, express.version, jade.version);
// }

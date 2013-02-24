
/**
 * Module dependencies.
 */

var express = require('express')
  , flash = require('connect-flash')
  , jade = require('jade')
  //, user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , connect = require('connect')
  , connectTimeout = require('connect-timeout')
  , mongoose = require('mongoose')
  , mongoStore = require('connect-mongodb')
  , nodemailer = require("nodemailer")
  , models = require('./models')
  , db
  , User
  , Proposal
  , LoginToken
  , Settings = { development: {}, test: {}, production: {} }
  ;


//var Schema = mongoose.Schema; 

//require('./models/server/ProposalSchema.js').make(Schema, mongoose);
//var User = require("./models/server/UserSchema.js").make(Schema,mongoose);

var app = express();

app.configure('development', function() {
  mongoose.set('debug',true);
  app.set('db-uri', 'mongodb://localhost:27017/conf-development');
  app.use(express.errorHandler({ dumpExceptions: true }));
  app.locals.pretty = true;
});



//db = mongoose.connect(app.set('db-uri'));

function mongoStoreConnectionArgs() {
  return { dbname: db.db.databaseName,
           host: db.db.serverConfig.host,
           port: db.db.serverConfig.port,
           username: db.uri.username,
           password: db.uri.password };
}


// connect to Mongo when the app initializes
//mongoose.connect('mongodb://localhost:27017/conf');
//mongoose.set('debug',true);
console.log("Connecting to mongodb, port 27017");

mongoose.connection.on('error', function(err){console.log("err: " + err)});


app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(connectTimeout({ time: 10000 }));
  app.use(express.session({ store: mongoStore(app.set('db-uri')), secret: 'topsecret' }));
  app.use(express.logger({ format: '\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms' }))
  app.use(express.methodOverride());
  app.use(flash());
  app.use("/conference-submission/stylesheets",express.static(__dirname + "/public/stylesheets"));
  app.use("/conference-submission/javascripts",express.static(__dirname + "/public/javascripts"));
});

models.defineModels(mongoose, function() {
  app.Proposal = Proposal = mongoose.model('Proposal');
  app.User = User = mongoose.model('User');
  app.LoginToken = LoginToken = mongoose.model('LoginToken');
  db = mongoose.connect(app.set('db-uri'));
});

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    host: "cas.fitchburgstate.edu",
    secureConnection: true,
    auth: {
        user: "ugrad-conf@fitchburgstate.edu",
        pass: "UnderC0nf"
    }
});

// setup e-mail data with unicode symbols
var resetPasswordOptions = {
    from: "FSU Undergraduate Conference <ugrad-conf@fitchburgstate.edu>", // sender address
    subject: "Password Reset for FSU Conference", // Subject line
    text: "You have requested a password reset for the Fitchburg State Undergraduate Conference Submission website", // plaintext body
    html: "You have requested a password reset for the Fitchburg State Undergraduate Conference Submission website" // html body
}


function authenticateFromLoginToken(req, res, next) {
  var cookie = JSON.parse(req.cookies.logintoken);

  LoginToken.findOne({ email: cookie.email,
                       series: cookie.series,
                       token: cookie.token }, (function(err, token) {

    if (!token) {
      res.redirect('/conference-submission/sessions/new');
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
        res.redirect('/conference-submission/sessions/new');
      }
    });
  }));
}

function loadUser(req, res, next) {
  console.log("in loadUser");
  console.log(req.session);
  if (req.session.user_id) {
    User.findById(req.session.user_id, function(err, user) {
      if (user) {
        req.currentUser = user;
        next();
      } else {
        res.redirect('/conference-submission/sessions/new');
      }
    });
  } else if (req.cookies.logintoken) {
    authenticateFromLoginToken(req, res, next);
  } else {
    res.redirect('/conference-submission/sessions/new');
  }
}

function routeUser(res,user){

  console.log(user);

  switch(user.role){
    case "student":
      res.redirect("/conference-submission/student");
      break;
    case "faculty":
      res.redirect("/conference-submission/faculty");
      break;
    case "admin":
      res.redirect("/conference-submission/admin")
      break;
  }
}

app.post('/conference-submission/users/add', function(request, response){

  var newUser = new User({email: request.body.email, password: request.body.password, role: request.body.role, reset_pass: false});
  
  function userSaveFailed() {
    request.flash('error', 'Account creation failed');
    response.render('users/new.jade', {
      locals: { user: user }
    });
  }

  newUser.save(function(err, _user) {
    if (err){
      console.log(err);
}
    console.log("saved!!");
    console.log(_user);

    //routeUser(response,_user);
    response.redirect("/conference-submission/sessions/new");
//    response.send(request.body);    // echo the result back
  });
});

// users routes

app.get('/conference-submission/users/new', function(req, res) {
  res.render('users/new.jade');
});

 app.get('/conference-submission/users', function(req, res){

  console.log("in get /users");

  var query = User.find();

  query.exec(function(err,users) {
    // 'users' will contain all of the users returned by the query

    if (err) return handleError(err);
    
    res.json(users);
  });  
  
}); 

//app.post(/^\/conference-submission\/users\/(\w+)$/, function (req,res){


app.put(/^\/conference-submission\/users\/(\w+)$/, function (req,res){
  console.log("in post /users/user");
  console.log(req.params[0]);
  var newInfo = {email: req.body.email, last_name: req.body.last_name, first_name: req.body.first_name, 
      type: req.body.type, major: req.body.major};
  console.log(req.body);
  User.findByIdAndUpdate(req.params[0],newInfo, function (err, user) {
   //if (err) return handleError(err);
    
    console.log("updated!!");
    console.log(err);
    console.log(user);
    res.json(user);
  });
});

app.post('/conference-submission/users/exists',function(req,res){
  User.findOne({email: req.body.email},function(err,_user){
    if (err){
      console.log(err);
    }
    if (_user){
      res.json({user_exists: true});
    } else {
      res.json({user_exists: false});
    }
  });
})

// proposals routes

app.get("/conference-submission/proposals", function(req,res){
  console.log("in /proposals");
  var _email = req.param("email")

  var query = (_email)? Proposal.find({email: _email}) : Proposal.find();

  query.exec(function(err,proposals) {
    // 'users' will contain all of the users returned by the query

    if (err) return handleError(err);
    
    res.json(proposals);
  }); 
})

app.post("/conference-submission/proposals",function(req,res){
   console.log("in post /proposals");
   console.log(req.body);

   var proposal = new Proposal(req.body);
   proposal.save(function (err, prop) {
    if (err) {console.log(err);}
    res.json(prop);
  })

});

app.put(/^\/conference-submission\/proposals\/(\w+)$/, function (req,res){
  console.log("in post /proposal/id");
  console.log(req.params[0]);
  var newInfo = {title: req.body.title, type: req.body.type, sponsor_email: req.body.sponsor_email, 
      sponsor_name: req.body.sponsor_name, sponsor_dept: req.body.sponsor_dept,
      content: req.body.content, use_animal_subjects: req.body.use_animal_subjects, 
      use_human_subjects: req.body.use_human_subjects,
      other_equipment: req.body.other_equipment};

  console.log(newInfo);
  Proposal.findByIdAndUpdate(req.params[0],newInfo, function (err, prop) {
    if (err) return handleError(err);
    
    console.log("updated!!");
    res.json(prop);
  });
});


app.get('/conference-submission/', loadUser, function(req, res) {
  console.log(" in get /conference-submission/");

   User.findOne({_id: req.currentUser.id},function(err,_user){
    routeUser(req,_user);
  });
});

app.get('/conference-submission/admin',loadUser, function(req,res){
  User.findOne({_id: req.currentUser.id},function(err,_user){
    console.log("in /admin");
    console.log(_user);
    if (_user.role==="admin")
      res.render('admin/admin.jade',{user:_user});
    else
      res.redirect("/"+_user.role);
  });
  // check to make sure the user has the correct role. 
  res.render('admin/admin.jade');
})

app.get('/conference-submission/faculty', loadUser, function(req, res) {
    User.findOne({_id: req.currentUser.id},function(err,_user){
    res.render('faculty.jade',{user: _user});
  });
});

app.get('/conference-submission/student',loadUser,function(req,res){

  User.findOne({_id: req.currentUser.id},function(err,_user){
    console.log("in /student");
    console.log(_user);

    res.render('student.jade',{user: _user});
  });
});

app.get("/conference-submission/forgot", function(req,res){
  res.render('sessions/forgot.jade');
});


/*  Sessions Routes  */



// Sessions
app.get('/conference-submission/sessions/new', function(req, res) {
  res.render('sessions/new.jade', {user: new User()});
});

app.post('/conference-submission/sessions', function(req, res) {
  User.findOne({ email: req.body.user.email }, function(err, user) {
    console.log("in post sessions");
    console.log(user);
    if (user && user.authenticate(req.body.user.password)) {
      req.session.user_id = user.id;


      // Remember me
      if (req.body.remember_me) {
        var loginToken = new LoginToken({ email: user.email });
        loginToken.save(function() {
          res.cookie('logintoken', loginToken.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });

          routeUser(res,user);
        });
      } else {
        routeUser(res,user);
      }
    } else {
      console.log("Incorrect credentials");
      req.flash('error', 'Incorrect credentials');
      res.redirect('/conference-submission/sessions/new');
    }
  }); 
});

app.del('/conference-submission/sessions', loadUser, function(req, res) {
  if (req.session) {
    LoginToken.remove({ email: req.currentUser.email }, function() {});
    res.clearCookie('logintoken');
    req.session.destroy(function() {});
  }
  res.redirect('/conference-submission/sessions/new');
});

app.post('/conference-submission/sessions/send-reset', function(req,res){
  res.redirect("/conference-submission/sessions/password-sent", {user: req.body.user});
});

app.post("/conference-submission/sessions/password-sent", function(req,res){
  res.render('sessions/password-reset.jade', {email: req.body.email});
});

app.post("/conference-submission/sessions/reset", function (req,res){
  var _email = req.body.email;

  User.findOne({email: _email},function(err,user){

    console.log(err)

    if (err) {
      console.log(err);
    }
    if (user){
      console.log("user " + user);
      
      console.log("Attempting to send mail to " + user.email);

      resetPasswordOptions.to=user.email;

      smtpTransport.sendMail(resetPasswordOptions, function(error, response){
        if(error){
            console.log(error);
            res.json({user_found: true, user: user});
        }else{
            res.json({user_found: true, user: user, message: "An email has been sent to " + email + ".  Please follow the instructions to reset your password."});
            console.log("Message sent: " + response.message);
        }

      });
     }  else {
      res.json({user_found: false, message: "Your email address was not found.  Please try again."});
    }
      
    // if you don't want to use this transport object anymore, uncomment following line
    //smtpTransport.close(); // shut down the connection pool, no more messages
  });


});



if (!module.parent) {
  app.listen(app.set("port"));
  console.log('Express server listening on port %s, environment: %s', app.set("port"), app.settings.env);
  console.log('Using connect %s, Express %s, Jade %s', connect.version, express.version, jade.version);
}



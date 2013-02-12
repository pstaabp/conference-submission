
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
  app.use(express.static(__dirname + '/public'));
});

models.defineModels(mongoose, function() {
  app.Proposal = Proposal = mongoose.model('Proposal');
  app.User = User = mongoose.model('User');
  app.LoginToken = LoginToken = mongoose.model('LoginToken');
  db = mongoose.connect(app.set('db-uri'));
})


function authenticateFromLoginToken(req, res, next) {
  var cookie = JSON.parse(req.cookies.logintoken);

  LoginToken.findOne({ email: cookie.email,
                       series: cookie.series,
                       token: cookie.token }, (function(err, token) {
    if (!token) {
      res.redirect('/sessions/new');
      return;
    }

    User.findOne({ email: token.email }, function(err, user) {
      if (user) {
        req.session.user_id = user.id;
        req.currentUser = user;

        token.token = token.randomToken();
        token.save(function() {
          res.cookie('logintoken', token.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
          next();
        });
      } else {
        res.redirect('/sessions/new');
      }
    });
  }));
}

function loadUser(req, res, next) {
  if (req.session.user_id) {
    User.findById(req.session.user_id, function(err, user) {
      if (user) {
        req.currentUser = user;
        next();
      } else {
        res.redirect('/sessions/new');
      }
    });
  } else if (req.cookies.logintoken) {
    authenticateFromLoginToken(req, res, next);
  } else {
    res.redirect('/sessions/new');
  }
}

function routeUser(res,user){

  console.log(user);

  switch(user.role){
    case "student":
      res.redirect("/student");
      break;
    case "faculty":
      res.redirect("/faculty");
      break;
    case "admin":
      res.redirect("/admin")
      break;
  }
}

app.post('/users/add', function(request, response){
  console.log(request.body);      // your JSON

  // detect the email address to determine the role.  
  var emailRe = /(\w+)\@(student\.)?fitchburgstate\.edu$/;
  
  var newUser = new User({email: request.body.email, password: request.body.password, role: request.body.role});
  
  function userSaveFailed() {
    request.flash('error', 'Account creation failed');
    response.render('users/new.jade', {
      locals: { user: user }
    });
  }

  newUser.save(function(err) {
    if (err){
      console.log(err);


    }
    console.log("saved!!");

    routeUser(response,newUser);

//    response.send(request.body);    // echo the result back
  });
});

// users routes

app.get('/users/new', function(req, res) {
  res.render('users/new.jade');
});

 app.get('/users', function(req, res){

  console.log("in get /users");

  var query = User.find();

  query.exec(function(err,users) {
    // 'users' will contain all of the users returned by the query

    if (err) return handleError(err);
    
    res.json(users);
  });  
  
}); 


app.put(/^\/users\/(\w+)$/, function (req,res){
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

app.post('/users',function(req,res){
  console.log("in post /users");
  console.log(req.body);
  res.send("Yeah!");
})

// proposals routes

app.get("/proposals", function(req,res){
  console.log("in /proposals");
  var _email = req.param("email")

  var query = (_email)? Proposal.find({email: _email}) : Proposal.find();

  query.exec(function(err,proposals) {
    // 'users' will contain all of the users returned by the query

    if (err) return handleError(err);
    
    res.json(proposals);
  }); 
})

app.post("/proposals",function(req,res){
   console.log("in post /proposals");
   console.log(req.body);

   var proposal = new Proposal(req.body);
   proposal.save(function (err, prop) {
    if (err) {console.log(err);}
    res.json(prop);
  })

});

app.put(/^\/proposals\/(\w+)$/, function (req,res){
  console.log("in post /proposal/id");
  console.log(req.params[0]);
  var newInfo = {title: req.body.title, type: req.body.type, sponsor_email: req.body.sponsor_email, 
      sponsor_name: req.body.sponsor_name, sponsor_dept: req.body.sponsor_dept,
      content: req.body.content, use_animal_subjects: req.body.use_animal_subjects, 
      use_human_subjects: req.body.use_human_subjects};
  Proposal.findByIdAndUpdate(req.params[0],newInfo, function (err, prop) {
    if (err) return handleError(err);
    
    console.log("updated!!");
    res.json(prop);
  });
});


app.get('/', loadUser, function(req, res) {
   User.findOne({_id: req.currentUser.id},function(err,_user){
    console.log("in /");

    routeUser(req,_user);
  });
});

app.get('/admin',loadUser, function(req,res){
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

app.get('/faculty', function(req, res) {
   User.findOne({_id: req.currentUser.id},function(err,_user){
    console.log("in /faculty");
    console.log(_user);
    res.render('faculty.jade');
  });
});

app.get('/student',loadUser,function(req,res){

  User.findOne({_id: req.currentUser.id},function(err,_user){
    console.log("in /student");
    console.log(_user);

    res.render('student.jade',{user: _user});
  });
});


// Sessions
app.get('/sessions/new', function(req, res) {
  res.render('sessions/new.jade', {user: new User()});
});

app.post('/sessions', function(req, res) {
  User.findOne({ email: req.body.user.email }, function(err, user) {
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
      res.redirect('/sessions/new');
    }
  }); 
});

app.del('/sessions', loadUser, function(req, res) {
  if (req.session) {
    LoginToken.remove({ email: req.currentUser.email }, function() {});
    res.clearCookie('logintoken');
    req.session.destroy(function() {});
  }
  res.redirect('/sessions/new');
});



if (!module.parent) {
  app.listen(app.set("port"));
  console.log('Express server listening on port %s, environment: %s', app.set("port"), app.settings.env)
  console.log('Using connect %s, Express %s, Jade %s', connect.version, express.version, jade.version);
}



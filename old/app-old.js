
/**
 * Module dependencies.
 */

var express = require('express')
  , settings = require('./settings')
  , flash = require('connect-flash')
  , jade = require('jade')
  , _und = require('underscore')
  , http = require('http')
  , path = require('path')
  , connect = require('connect')
  , connectTimeout = require('connect-timeout')
  , mongoose = require('mongoose')
  , mongoStore = require('connect-mongodb')
  , nodemailer = require("nodemailer")
  , models = require('./models')
  , templatesDir   = path.join(__dirname, 'templates')
  , emailTemplates = require('email-templates')
  , LoginRoutes = require('./routes/loginRoutes')
  , db
  , User
  , Proposal
  , LoginToken
  , Judge
  , Settings = { development: {}, test: {}, production: {} };

var app = express();

app.configure('development', function() {
  mongoose.set('debug',false);
  app.set('db-uri', 'mongodb://localhost:27017/conf-development');
  app.use(express.errorHandler({ dumpExceptions: true }));
  app.locals.pretty = true;
}); 

/* app.configure('production', function() {
  mongoose.set('debug',false);
  app.set('db-uri', 'mongodb://localhost:27017/conf-production');
  app.use(express.errorHandler({ dumpExceptions: true }));
  app.locals.pretty = true;
}); */ 



//db = mongoose.connect(app.set('db-uri'));

function mongoStoreConnectionArgs() {
  return { dbname: db.db.databaseName,
           host: db.db.serverConfig.host,
           port: db.db.serverConfig.port,
           username: db.uri.username,
           password: db.uri.password };
}


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
  app.use("/conference-submission/img",express.static(__dirname + "/public/images"));
});

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

// setup e-mail data with unicode symbols
var resetPasswordOptions = {
    from: "FSU Undergraduate Conference <ugrad-conf@fitchburgstate.edu>", // sender address
    subject: "Password Reset for FSU Conference", // Subject line
    text: "You have requested a password reset for the Fitchburg State Undergraduate Conference Submission website."
          + "  Please go to http://webwork.fitchburgstate.edu/conference-submission/sessions/password and "
          + " enter the temporary password ", // plaintext body
    html: "You have requested a password reset for the Fitchburg State Undergraduate Conference Submission website."
          + "  Please go to <a href='http://webwork.fitchburgstate.edu/conference-submission/sessions/password'>http://webwork.fitchburgstate.edu/conference-submission/sessions/password</a> and "
          + " enter the temporary password " // html body
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
  if (req.session.user_id) {
    User.findById(req.session.user_id, function(err, user) {
      if (user) {
        req.currentUser = user;
        next();
      } else {
        console.log("[loadUser] User not defined.  ");
        res.redirect('/conference-submission/sessions/new');
      }
    });
  } else if (req.cookies.logintoken) {
    authenticateFromLoginToken(req, res, next);
  } else {
    console.log("[loadUser]  No session data");
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
  console.log(req.body);

  var query = User.find();

  query.exec(function(err,users) {
    // 'users' will contain all of the users returned by the query

    if (err) return handleError(err);
    
    res.json(users);
  });  
  
}); 

 app.get(/^\/conference-submission\/users\/(\w+)$/, function (req,res){
  User.findById(req.params[0], function (err, user) {
   if (err) console.log(err);
    
    res.json(user.getPublicFields());
  });
});

 app.del(/^\/conference-submission\/users\/(\w+)$/, loadUser, function (req,res){

  User.findById(req.session.user_id, function(err, admin_user) {

    if(admin_user.role!=="admin"){ 
      res.json({deleted: false, message: "You do not have crendentials to do this."});
      return;
    }

    User.findByIdAndRemove(req.params[0], function (err, user) {
      if (err) {
        console.log(err);
      } else {
        res.json({deleted: true, message: "Successfully deleted user " + user.email});
      }
    });
  });
});


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
    res.json(user.getPublicFields());
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
});

app.post('/conference-submission/users/password',function(req,res){
  var _email = req.body.email;
  var tmpPassword = req.body.temp_pass;
  var _password = req.body.password;

  User.findOne({email: _email}, function(err,_user) {
    if (err) {console.log(err);}

    if(_user){

      if (!_user.reset_pass) {
        res.json({success: false, message: "You don't have permission to reset this password. " +
          " Click <a href='/conference-submission/forgot'>here</a> if you have forgotten your password."})
      }

      if (_user.temp_pass !== tmpPassword) {
        res.json({success: false, message: "Your temporary Password is incorrect"});
      }

      var encryptedPassword = _user.encryptPassword(_password);
      console.log(encryptedPassword);

      User.findByIdAndUpdate(_user.id,{reset_pass: false, temp_pass: "", hashed_password: encryptedPassword},
          function(err,theUser){
            if (err) {console.log(err);}

            if(theUser){
              res.json({success: true, user: theUser.getPublicFields()});
          }
       });
    } else {
      res.json({success: false, message: "A user with email " + _email + " does not exist"});
    }
  });
});

// proposals routes

app.get("/conference-submission/proposals", loadUser, function(req,res){
  var _email = req.param("email")
  , semail = req.param("sponsor_email")
  , query = null;

  User.findOne({_id: req.currentUser.id},function(err,_user){
    
    var role = _user.role;  

    console.log(_email);
    console.log(semail);

    if (_email) {
       query = (_email)? Proposal.find({email: _email}) : Proposal.find(); 
    } else if (semail){
      query = (semail)? Proposal.find({sponsor_email: semail}) : Proposal.find(); 
    } else if (role==="admin") {
      query = Proposal.find();
    }

    query.exec(function(err,proposals) {
      if (err) {
        console.log(err);
      }
      
      res.json(proposals);
      console.log(proposals);
    }); 
  });
});



app.post("/conference-submission/proposals",function(req,res){
   var proposal = new Proposal(req.body);
   proposal.save(function (err, prop) {
    if (err) {console.log(err);}
    res.json(prop);
  })

});

app.put("/conference-submission/proposals/:id", loadUser, function (req,res){
  //console.log("in put /proposal/id");
  //console.log(req.body);


  Proposal.findByIdAndUpdate(req.params.id,_und.omit(req.body, "_id"), function (err, prop) {
    if (err) {
      console.log(err);
    }
  
    console.log(prop);  

    /*
    console.log("updated!!");

    // send email that a proposal was received. 

    User.findOne({_id: req.currentUser.id},function(err,_user){
     console.log("Trying to send email");


      emailTemplates(templatesDir, function(err, template) {

        if (err) {
          console.log(err);
        } else {

          locals = {first_name: _user.first_name, last_name: _user.last_name};
          _und.extend(locals,prop);
          // ## Send a single email

           // Send a single email
          template('submitted', locals, function(err, html, text) {
            if (err) {
              console.log(err);
            } else {
              smtpTransport.sendMail({
                from: "FSU Undergraduate Conference <ugrad-conf@fitchburgstate.edu>", // sender address
                subject: "Submission Received for FSU Conference", // Subject line
                to: locals.email,
                cc: "ugrad-conf@fitchburgstate.edu",
                html: html,
                // generateTextFromHTML: true,
                text: text
              }, function(err, responseStatus) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(responseStatus.message);
                }
              });
            }
          });

       



        }
      });



      emailTemplates(templatesDir, function(err, template) {

        if (err) {
          console.log(err);
        } else {

          locals = {first_name: _user.first_name, last_name: _user.last_name};
          _und.extend(locals,prop);
          // ## Send a single email


                // Send a single email
          template('sponsor', locals, function(err, html, text) {
            if (err) {
              console.log(err);
            } else {
              smtpTransport.sendMail({
                from: "FSU Undergraduate Conference <ugrad-conf@fitchburgstate.edu>", // sender address
                subject: "Submission Received for FSU Conference", // Subject line
                to: locals.sponsor_email,
                html: html,
                // generateTextFromHTML: true,
                text: text
              }, function(err, responseStatus) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(responseStatus.message);
                }
              });
            }
          });



        }


    });
  }); */

    res.json(prop);
  });
});


app.del(/^\/conference-submission\/proposals\/(\w+)$/, loadUser, function (req,res){

  User.findById(req.session.user_id, function(err, admin_user) {

    if(admin_user.role!=="admin"){ 
      res.json({deleted: false, message: "You do not have crendentials to do this."});
      return;
    }

    Proposal.findByIdAndRemove(req.params[0], function (err, proposal) {
      if (err) {
        console.log(err);
      } else {
        res.json({deleted: true, message: "Successfully deleted proposal titled " + proposal.title});
      }
    });
  });
});

/***
*   These are definitions of public views
*
*/

app.get("/conference-submission/views",function(req,res){
  Proposal.find({}).exec(function(err,_proposals){
    res.render('all-proposals.jade',{proposals: _proposals});
  });

});


app.get("/conference-submission/schedule",function(req,res){

//  var sessionRE = /OP-(\d+)-(\d+)/


  Proposal.find({type: "Oral Presentation"}).exec(function(err,_proposals){
    var props = [], row,col,session,theProp;
    for(k=0;k<2;k++){
      for(row=0;row<5;row++){
        for(col=0; col<6; col++){
          session = 6*k+col;
          theProp = _und.find(_proposals,function(proposal){ return proposal.session === "OP-" + session + "-" + row});
          var sess = (theProp)? theProp.session: "none";
          console.log(sess);
          props.push(theProp);
        }
      }
    }

    res.render('schedule.jade',{proposals: props});
  });

});

app.get("/conference-submission/posters",function(req,res){
  Proposal.find({type: "Poster Presentation"}).sort('session').exec(function(err,_proposals){
    res.render('posters.jade',{proposals: _proposals});
  });
});

app.get("/conference-submission/showjudges",function(req,res){
  Judge.find({}).sort('session').sort("name").exec(function(err,_judges){
    res.render('showjudges.jade',{judges: _judges});
  });
});

app.get("/conference-submission/posterjudges",function(req,res){
  Proposal.find({type: "Poster Presentation"}).sort('session').exec(function(err,_proposals){
    if (err) { console.log(err);}

    var _posters = [];


    Judge.find({}).exec(function(err2,_judges){
      if(err2) {console.log(err2);}

      for(i=0;i<_proposals.length;i++){
        console.log(_proposals[i].session);
        var poster = _und.pick(_proposals[i],'session','author','title');
        var theJudges= []; 
        for(j=0;j<_judges.length;j++){
           if (_und.contains(_judges[j].session,_proposals[i].session)){
            theJudges.push(_judges[j].name);
           }
        }
        _und.extend(poster,{judges: theJudges});
        console.log(poster);
        _posters.push(poster);

      }


      res.render('posterjudges.jade',{posters: _posters});
    });

  });
});


app.get("/conference-submission/view-proposal",function(req,res){
  var session = req.query.session;
  console.log(session);

  Proposal.findOne({session: req.query.session}, function (err,_proposal){
    if (err ) console.log(err);
    console.log(_proposal);
    res.render("show-proposal.jade", {proposal: _proposal});
  });

});

app.get("/conference-submission/orals",function(req,res){
  Proposal.find({type: "Oral Presentation"}).sort("session").exec(function(err,_proposals){

    var rooms = ["Hammond 214","Hammond 314","Alumni A", "Alumni C", "Hammond G19", "CTL"];
    var times = ["9:00-9:15","9:20-9:35","9:40-9:55","10:00-10:15","11:00-11:15","11:20-11:35","11:40-11:55","12:00-12:15","12:20-12:35"]

    var props = [], row,col,session,theProp;
    for(k=0;k<2;k++){
      for(row=0;row<5;row++){
        for(col=0; col<6; col++){
          session = 6*k+col;
          theProp = _und.find(_proposals,function(proposal){ return proposal.session === "OP-" + session + "-" + row});
          var sess = (theProp)? theProp.session: "none";
          if(theProp) {
            theProp.room = rooms[col];
            theProp.time = times[4*k+row];
            props.push(theProp);
            
          }
        }
      }
    }

    res.render("orals.jade", {proposals: props});
  });
});




app.get('/conference-submission/', loadUser, function(req, res) {
  console.log(" in get /conference-submission/");

   User.findOne({_id: req.currentUser.id},function(err,_user){

    if(err){
      res.redirect("/conference-submission/sessions/new");
    }

    routeUser(req,_user);

  });

});

app.get('/conference-submission/admin',loadUser, function(req,res){
  User.findOne({_id: req.currentUser.id},function(err,_user){
    console.log("in /admin");
    console.log(_user);
    if (_user.role==="admin")

      User.find({},function(err,_users){
        if (err) {console.log(err);}

        Proposal.find({},function(err2,_proposals){
          if (err2) {console.log(err2);}

          Judge.find({},function(err3,_judges){
            if (err3) {console.log(err3);}            
            res.render('admin/admin.jade', {users: _users, proposals: _proposals, judges: _judges});  
          })

        });


      });


      
    else
      res.redirect("/conference-submission/"+_user.role);
  });
});

// Act as user view

app.get("/conference-submission/admin/:id",loadUser,function(req,res){
  User.findOne({_id: req.currentUser.id},function(err,_user) {
    // first make sure the current user is an admin;
    if (_user.role !=="admin") { res.redirect("/conference-submission/"+_user.role);}

    // The effective user id is passed in the URL.

    User.findOne({_id: req.params.id}, function(err,eff_user){

      console.log("The user is " + eff_user.first_name + " " + eff_user.last_name);
      if (eff_user.role === "faculty"){
        res.render('faculty.jade',{user: eff_user});
      } else if (eff_user.role === "student") {
        res.render("student.jade", {user: eff_user});
      } else {
        res.redirect('/conference-submission/admin');
      }

    });



  });

});


app.get('/conference-submission/judges',function(req,res){

  if(req.xhr){
    Judge.find({},function(err,_judges){
      if(err) {console.err(err);}
        res.send(_judges);
    })
  } else {
    res.render('users/judges.jade');
  }
});

app.post("/conference-submission/judges",function(req,res){
  var pres = _und(req.body.presentation).keys();
  var judge = new Judge({name: req.body.name, email: req.body.email, type: req.body.type, presentation: pres});
  judge.save(function (err, _judge) {
    if (err) {console.log(err);}

/*
      emailTemplates(templatesDir, function(err, template) {

        if (err) {
          console.log(err);
        } else {

//          var locals = {};
  //        _und.extend(locals, _judge);
           // Send a single email


          template('judge', _judge, function(err, html, text) {
            if (err) {
              console.log(err);
            } else {
              smtpTransport.sendMail({
                from: "FSU Undergraduate Conference <ugrad-conf@fitchburgstate.edu>", // sender address
                subject: "Judging for FSU Conference", // Subject line
                to: _judge.email,
                cc: "ugrad-conf@fitchburgstate.edu",
                html: html,
                // generateTextFromHTML: true,
                text: text
              }, function(err, responseStatus) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(responseStatus.message);
                  res.render("users/judges-email.jade");
                }
              });


            }
          });
        } 

 

      }); */

    res.render("users/judges-email.jade");
  });
});


 app.del(/^\/conference-submission\/judges\/(\w+)$/, loadUser, function (req,res){

  User.findById(req.session.user_id, function(err, admin_user) {

    if(admin_user.role!=="admin"){ 
      res.json({deleted: false, message: "You do not have crendentials to do this."});
      return;
    }

    Judge.findByIdAndRemove(req.params[0], function (err, _judge) {
      if (err) {
        console.log(err);
      } else {
        res.json({deleted: true, message: "Successfully deleted judge " + _judge.name});
      }
    });
  });
});

app.put("/conference-submission/judges/:id",loadUser,function(req,res){
  
  var obj = _und.omit(_und.clone(req.body),"_id");
  console.log(obj);
  Judge.findByIdAndUpdate(req.params.id,obj, function(err,_judge){
    if(err) {console.log(err);}
    res.json(_judge);
  });
});


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
      res.redirect('/conference-submission/sessions/new?password-correct=false');
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

app.get("/conference-submission/sessions/password",function(req,res){
  res.render('sessions/change-password.jade');
});



app.post("/conference-submission/sessions/reset", function (req,res){
  var _email = req.body.email;


  function emailReset(err,user) {
    console.log(err)

    if (err) {
      console.log(err);
    }
    if (user){
    
      console.log("Attempting to send mail to " + user.email);

      var resetPasswordEmail = _und.clone(resetPasswordOptions);

      resetPasswordEmail.to=user.email;
      var tmpPassword = parseInt(999999*Math.random());
      console.log(tmpPassword);

      resetPasswordEmail.text += tmpPassword;
      resetPasswordEmail.html += tmpPassword;

      User.findByIdAndUpdate(user.id , {reset_pass: true, temp_pass: tmpPassword}, 
        function (error, _user) {
          if (error){console.log(error);} 
          if (_user){
            console.log(_user);
            smtpTransport.sendMail(resetPasswordEmail, function(err,response){
              if(err){
                console.log(err);
              }else{
                res.json({user_found: true, user: user, message: "An email has been sent to " + 
                            user.email + ".  Please follow the instructions to reset your password."});
                console.log("Message sent: " + response.message);
              }
            });
          }
        });

     }  else {
      res.json({user_found: false, message: "Your email address was not found.  Please try again."});
    }
    
  }



  User.findOne({email: _email},emailReset );

});


var loginRoutes = new LoginRoutes(app,settings.settings);  // not sure why I need to do settings.settings here to pass in the settings. 




if (!module.parent) {
  app.listen(app.set("port"));
  console.log('Express server listening on port %s, environment: %s', app.set("port"), app.settings.env);
  console.log('Using connect %s, Express %s, Jade %s', connect.version, express.version, jade.version);
}



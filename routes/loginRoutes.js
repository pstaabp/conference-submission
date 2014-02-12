var ldap = require('ldapjs');
var ldap_settings = require('../ldap');
var _ = require("underscore");

module.exports = function loginRoutes(app,User,routeUser,LoginToken,loadUser) {
    
    var client = ldap.createClient({
	url: ldap_settings.settings.ldap_url
    });

    app.get('/conference-submission/login', function(req, res) {
  	res.render('login.jade',{user: {}, msg: ""});
    });

    app.get('/conference-submission/login-check',function(req,res){
	console.log(req.body.user);
	//console.log(client);
	client.bind("fscad\\"+req.body.user.falconkey,req.body.user.password,function(err,_res){
	    console.log("error: " + err);
	    res.json({});
	});
    });

    app.post('/conference-submission/login',function(req,res){
	console.log(req.body);
	//check the password of the user
	client.bind("fscad\\" +req.body.user.falconkey,req.body.user.password, function(err,_res){
            console.log(err);
	    console.log(_res);
	    if(_res){ 

		// lookup the User in the DB
		User.findOne({falconkey: req.body.user.falconkey},function(err2,_user){
		    if(_user){
			req.session.user_id = _user.id;

			// save a cookie
			var loginToken = new LoginToken({ email: _user.email });
        		loginToken.save(function() {
          		    res.cookie('logintoken', loginToken.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
          		    routeUser(res,_user);
		        }); 
				
		    } else { //the user isn't in the database yet
			client.search("",{filter: "(&(sAMAccountName="+req.body.user.falconkey+"))",scope: "sub"},function(_err2,_res2){
			    var searchResult = {};
			    _res2.on('searchEntry', function(entry) {
				searchResult = entry.object;
				console.log(searchResult);
			    });
			    _res2.on('end',function(result){
				if(_.isEqual(searchResult,{})){ // can't find the user
				    res.render('login.jade',{user: {falconkey: req.body.user.falconkey}, msg: "Your username and password are not correct. Please try again." }); 
				}
				var _role = (searchResult.description.match(/^Student/))? ["student"] : [];
				new User({email: searchResult.mail, first_name: searchResult.givenName, 
					  last_name: searchResult.sn,falconkey: req.body.user.falconkey, role: _role}).save(function(err, _user) {
					if (err){
			    		    console.log(err);
					} else { 
					    console.log("saved!!");
					    // save a cookie
					    req.session.user_id = _user.id;
					    var loginToken = new LoginToken({ email: _user.email });
				 	    loginToken.save(function() {
				   		res.cookie('logintoken', loginToken.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
						req.flash('other', 'test');
						res.redirect("/conference-submission/welcome");
				            });
					}
				});
			    });
			});
		     }
		});
	    } else { // the password was incorrect
	 	res.render('login.jade',{user: {falconkey: req.body.user.falconkey}, msg: "Your username and password are not correct. Please try again." })
	    }
			    });
	});

	app.post('/conference-submission/logout',loadUser,function(req,res){
		if (req.session) {
		    LoginToken.remove({ email: req.currentUser.email }, function() {});
		    res.clearCookie('logintoken');
		    req.session.destroy(function() {});
		}
		res.redirect('/conference-submission/login');
	});


	// The following is a route for student or faculty that is at the website for the first time. 

	app.get('/conference-submission/welcome',loadUser, function(req,res){
		console.log(req.flash("other"));
		console.log(req.currentUser);
		res.render('welcome.jade',{user: req.currentUser});
	});

	// The following is used to help finalize the role of the faculty/staff member.

    app.post('/conference-submission/user',loadUser,function(req,res){
	// update the User in the DB
	User.update({falconkey: req.currentUser.falconkey},{role: _.keys(req.body)},function(err,numAffected, raw){
	    res.redirect('/conference-submission/'+_(req.body).keys()[0]);
	});		
    });
}

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

	app.post('/conference-submission/login',function(req,res){
		//check the password of the user
//		client.bind("fscad\\"+req.body.user.falconkey,req.body.user.password, function(err,_res){
//			if(_res){ 

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
//						client.search("",{filter: "(&(sAMAccountName="+req.body.user.falconkey+"))",scope: "sub"},function(_err2,_res2){
//							_res2.on('searchEntry', function(entry) {
//								res.json({first_name: entry.object.givenName, last_name: entry.object.sn,email:entry.object.mail , other: entry.object.description});
//});					
							new User({email: req.body.user.falconkey+"@student.fitchburgstate.edu",
									first_name: "first",
									last_name: "last",
									falconkey: req.body.user.falconkey}).save(function(err, _user) {
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
					}
				});
			// } else { // the password was incorrect
			// 	res.render('login.jade',{user: {falconkey: req.body.user.falconkey}, msg: "Your username and password are not correct. Please try again." })
			// }
		//});
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
		if(req.currentUser.email.match(/@student.fitchburgstate.edu/)){
			
			res.render('welcome-student.jade',req.currentUser);
		} else {
			res.render('welcome-faculty.jade',req.currentUser);
		}
	});
}

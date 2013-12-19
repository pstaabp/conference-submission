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
		console.log(req.body);
		//console.log(ldap_settings);
		//console.log({falconkey: req.body.user.falconkey, password: req.body.user.password});

		//res.render('login.jade',{user: {falconkey: req.body.user.falconkey}, msg: "Your username and password are not correct. Please try again." })

		// lookup the User in the DB

		client.bind("fscad\\"+req.body.user.falconkey,req.body.user.password, function(err,_res){
			if(_res){ 

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
							_res2.on('searchEntry', function(entry) {
								res.json({first_name: entry.object.givenName, last_name: entry.object.sn,email:entry.object.mail , other: entry.object.description});
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
}

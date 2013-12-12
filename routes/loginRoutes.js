var ldap = require('ldapjs');

module.exports = function loginRoutes(app,settings) {


	var client = ldap.createClient({
	 	url: settings.ldap_url
	});

	app.get('/conference-submission/login', function(req, res) {
  		res.render('login.jade',{user: {}, msg: ""});
	});

	app.post('/conference-submission/login',function(req,res){
		console.log(req.body);
		console.log({falconkey: req.body.user.falconkey, password: req.body.user.password});

		res.render('login.jade',{user: {falconkey: req.body.user.falconkey}, msg: "Your username and password are not correct. Please try again." })
	});

}

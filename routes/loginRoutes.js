var ldap = require('ldapjs');

module.exports = function loginRoutes(app,User,settings) {


	var client = ldap.createClient({
	 	url: settings.ldap_url
	});

	app.get('/conference-submission/login', function(req, res) {
  		res.render('login.jade',{user: new User()});
	});

	app.post('/conference-submission/login',function(req,res){
		console.log(req.body);
		console.log({falconkey: req.body.user.falconkey, password: req.body.user.password});

	    client.bind(settings.ldap_user,settings.ldap_password, function(err,res){
        	if(res){
	   			client.search("",opts,function(_err,_res){
	      			_res.on('end', function(result) {
    					//console.log('status: ' + result.status);
						response.json({status: result.status});
			  	    });
			      	_res.on('error', function(err) {
		    			console.error('error: ' + err.message);
		  	      	});

	      			_res.on('searchEntry', function(entry) {
						response.json(und.pick(entry.object,"cn","sn"));
						//console.log('entry: ' + JSON.stringify(entry.object));
  					});

			     	_res.on('searchReference', function(referral) {
    					console.log('referral: ' + referral.uris.join());
  	     			});
           		});
	       	}
		});	
	});

}

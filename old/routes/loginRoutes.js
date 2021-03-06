var ldap = require('ldapjs'), 
ldap_settings = require('../ldap'),
_ = require("underscore"),
assert = require("assert"),
sprintf = require("util").format;

module.exports = function loginRoutes(app,User,routeUser,LoginToken,loadUser,bodyParser) {
    
    function LDAPBind(callback){
		assert.equal(typeof (callback), 'function');

		var client = ldap.createClient({
		    	url: ldap_settings.settings.ldap_url
			}), entry;
		    
		return client.bind(ldap_settings.settings.ldap_user,ldap_settings.settings.ldap_password,function(err){
		    if(err){
			console.log("in LDAPbind error");
			console.log({user: ldap_settings.settings.ldap_user,pass: ldap_settings.settings.ldap_password});
			
			return callback(err);
		    }
		    client.unbind(function(err) {
			assert.ifError(err);
		    });
		    return callback(null);
		});
    }
			
    function LDAPcheckPassword(user,pass,callback){

		if(pass==="") {
		    return callback({error: "You must provide a password!"});
		}

		console.log("checking password");
		assert.equal(typeof (user), 'string');
		assert.equal(typeof (pass), 'string');
		assert.equal(typeof (callback), 'function');
		
		var client = ldap.createClient({
		    url: ldap_settings.settings.ldap_url
		});
		//console.log({user: user, password: pass});
		
		client.bind(user,pass,function(err){
		    console.log("inside client.bind");
		    
		    if(err)
		    {
		    	console.log(err);
				return callback(err);
		    }
		    client.unbind(function(err) {
			assert.ifError(err);
		    });
		    return callback(null);
		});

    }

    function LDAPsearch(falconkey,callback){

		var FILTER_FMT = "(&(sAMAccountName=%s))"
		, opts = { filter: sprintf(FILTER_FMT, falconkey), scope: 'sub' }
		, client = ldap.createClient({
		    url: ldap_settings.settings.ldap_url
		});

		client.bind(ldap_settings.settings.ldap_user,ldap_settings.settings.ldap_password,function(err){
		    if(err)
			assert.ifError(err);
		    
		    client.search("",opts,function(_err,_res){
			var searchResult = {};					

		      	_res.on('end', function(result) {
			    client.unbind(function(err){
				assert.ifError(err);
			    });
			    return callback(null,searchResult);
	  	      	});
		      	_res.on('error', function(err) {
	    		    console.error('error: ' + err.message);
	  	      	});
		      	_res.on('searchEntry', function(entry) {
			    searchResult = {
			    		first_name: entry.object.givenName, 
					    last_name:entry.object.sn,
					    email:entry.object.mail, 
					    other: entry.object.description
					};
	           	});
		    });
		});
    }
	
	/*
	*  The login routes 
	*/

    app.post('/' + ldap_settings.settings.top_dir + '/login',function(req,res){

    	console.log('in POST /' + ldap_settings.settings.top_dir + '/login')

		function saveCookieAndRoute(user){
		    req.session.user_id = user._id;	
		    var loginToken = new LoginToken({ email: user.email });
	            loginToken.save(function() {
	          	res.cookie('logintoken', loginToken.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
	          	routeUser(res,user);
			
		    });
		}

		if(ldap_settings.settings.use_ldap){


		LDAPcheckPassword("fscad\\"+req.body['user[falconkey]'],req.body['user[password]'],function(err2,res2){
		    console.log("in callback");
		    if(err2){ // the password was incorrect
		 		res.render('login.jade',{user: {falconkey: req.body['user[password]']},top_dir: ldap_settings.settings.top_dir,  
		 			msg: "Your username and password are not correct. Please try again." })
		    } else { // password was correct
			User.findOne({falconkey: req.body['user[falconkey]']},function(err2,_user){
			    console.log(_user);
			    if(_user){
					//saveCookieAndRoute(_user);
					req.session.user_id = _user._id;
					routeUser(res,_user);	
			    } else {//the user isn't in the database yet 
					LDAPsearch(req.body['user[falconkey]'],function(err,result){
					    console.log("in LDAPsearch callback");
					    if(err)
						assert.ifError(err);
					    if(result){
						console.log(result);
						if(_.isEqual(result,{})){ // can't find the user
						    res.render('login.jade',{top_dir: ldap_settings.settings.top_dir,user: {falconkey: req.body['user[falconkey]']}, 
						    	msg: "Your username and password are not correct. Please try again." }); 
						}
						var _role = (result.other.match(/^Student/))? ["student"] : [];
						user = new User({email: result.email, first_name: result.first_name, 
							  last_name: result.last_name,falconkey: req.body['user[falconkey]'], role: _role})
						    .save(function(error, _user) {
							if (error)
							    console.log(error);
							if(_user)
								req.session.user_id = _user._id;
								routeUser(res,_user);	
						    });
					    }
					    
					});
			    }
			});
		    }
		});
	} else { // don't use ldap (for testing only)

		console.log("we didn't use LDAP ");
		User.findOne({falconkey: req.body['user[falconkey]']},function(err2,_user){
				console.log(_user);
			    if(_user){
			    	console.log("found the user")
					//saveCookieAndRoute(_user);
					req.session.user_id = _user._id;
					routeUser(res,_user);	
			    } else { 
			    	console.log("a new user");
			    	// this is for testing only
			    	var result = {email : "pstaab@fitchburgstate.edu",
			    		first_name : "Peter",
			    		last_name : "Staab",
			    		role : ["sponsor"],
			   			};

			    	user = new User({email: result.email, first_name: result.first_name, 
							  last_name: result.last_name,falconkey: req.body['user[falconkey]'], role: result.role})
						    .save(function(error, _user) {
							if (error)
							    console.log(error);
							if(_user)
							    //saveCookieAndRoute(_user);
								req.session.user_id = _user._id;
								routeUser(res,_user);	
						    });
			    }
			});
		}
    });
 
    app.get('/' + ldap_settings.settings.top_dir + '/login', function(req, res) {
  		res.render('login.jade',{user: {}, msg: "", top_dir: ldap_settings.settings.top_dir});
    });

    app.get('/' + ldap_settings.settings.top_dir + '/login-check',function(req,res){
    	console.log("in GET login-check");
		console.log(req.body.user);
		//console.log(client);
		client.bind("fscad\\"+req.body['user[falconkey]'],req.body['user[password]'],function(err,_res){
		    console.log("error: " + err);
		    res.json({});
		});
    });


    app.post('/' + ldap_settings.settings.top_dir + '/logout',loadUser,function(req,res){
	if (req.session) {
	    LoginToken.remove({ email: req.currentUser.email }, function() {});
	    res.clearCookie('logintoken');
	    req.session.destroy(function() {});
	}
	res.redirect('/' + ldap_settings.settings.top_dir + '/login');
    });


    // The following is a route for student or faculty that is at the website for the first time. 

    app.get('/' + ldap_settings.settings.top_dir + '/welcome',loadUser, function(req,res){
		//console.log(req.flash("other"));
		console.log(req.currentUser);
		res.render('welcome.jade',{user: req.currentUser,top_dir: ldap_settings.settings.top_dir});
    });

    // The following is used to help finalize the role of the faculty/staff member.

    app.post('/' + ldap_settings.settings.top_dir + '/user',loadUser,function(req,res){
		// update the User in the DB
		User.update({falconkey: req.currentUser.falconkey},{role: _.keys(req.body)},function(err,numAffected, raw){
		    res.redirect('/' + ldap_settings.settings.top_dir + '/'+_(req.body).keys()[0]);
		});		
    });


	/**
	 *  This method checks for a user based on the email address.  
	 * 
	 *  It will lookup the user via ldap and if successful return 
	 *  first name, last name, and email address.  If unsuccessful, it will return {}
	 *
	 */

    app.get('/' + ldap_settings.settings.top_dir + '/users/:falconkey/check',function(req,res){
	//console.log(req.param("falconkey"));
		console.log(ldap_settings.settings.use_ldap);
		if(ldap_settings.settings.use_ldap){
			LDAPsearch(req.param("falconkey"),function(err,results){
			    if(err)
					assert.ifError(err);
			    if(results)
					res.json(results);

			});
		} else {
			res.json({first_name: "Peter", 
					    last_name: "Staab",
					    email: "pstaab@fitchburgstate.edu", 
					    other: "Mathematics"});
		}
    });


}


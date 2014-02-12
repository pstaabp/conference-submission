var _ = require("underscore");
var ldap = require('ldapjs');
var ldap_settings = require('../ldap');

module.exports = function userRoutes(app,loadUser,User,Proposal,Judge){
	
    var client = ldap.createClient({
	url: ldap_settings.settings.ldap_url
    });

    app.get('/conference-submission/admin',loadUser, function(req,res){
	console.log("in /admin");
	User.findOne({_id: req.currentUser.id},function(err,_user){
	    console.log(_user);
	    if (_.contains(_user.role,"admin")){
		User.find({},function(err,_users){
		    if (err) {console.log(err);}

		    Proposal.find({},function(err2,_proposals){
      			if (err2) {console.log(err2);}

		        Judge.find({},function(err3,_judges){
		            if (err3) {console.log(err3);}            
		            res.render('admin/admin.jade', {users: _users, proposals: _proposals, judges: _judges});  
  			});
		    });
		});
	    } else {
		res.redirect("/conference-submission/"+_user.role);
	    }
	});
    });

    app.put("/conference-submission/users/:user_id", loadUser, function (req,res){
	console.log("in put /users/user");
	User.findByIdAndUpdate(req.params.user_id,_.omit(req.body,"_id"), function (err, user) {    
	    console.log("updated!!");
	    if(err) {
    		res.json({msg: "An error occurred"});
	    }

	    res.json(user.getPublicFields());
	});
    });

	/**
	 *  This method checks for a user based on the email address.  
	 * 
	 *  It will lookup the user via ldap and if successful return 
	 *  first name, last name, and email address.  If unsuccessful, it will return {}
	 *
	 */

    app.post("/conference-submission/users/check",function(req,response){
	console.log(req.param("email"));
	client.bind(ldap_settings.settings.ldap_user,ldap_settings.settings.ldap_password, function(err,res){
            if(res){
	   	client.search("",{filter: "(&(mail="+req.param("email")+"))",scope: "sub"},function(_err,_res){
		    var searchResult = {};					

	      	    _res.on('end', function(result) {
			console.log(result.status);
			response.json(searchResult);				
  	      	    });
	      	    _res.on('error', function(err) {
    			console.error('error: ' + err.message);
  	      	    });
	      	    _res.on('searchEntry', function(entry) {
			searchResult = {first_name: entry.object.givenName, 
					last_name:entry.object.sn,email:entry.object.mail, 
					other: entry.object.description};
           	    });
		});
		if(err){
		    console.log("error in client.bind: " + err);
		}
	    }
	});
    });


	
  	app.get('/conference-submission/users/:user_id',loadUser, function(req,res){
  		User.findById(req.param("user_id"),function(err,user){
  			res.json(user);
  		});
  	});


	// The main page for student views

	app.get('/conference-submission/student',loadUser, function(req,res){
		Proposal.find({email: req.currentUser.email}, function(err,_proposals){
		   	res.render('student.jade',{user: req.currentUser, proposals: _proposals});			
		});
  	});

  	// The main page for sponsors

  	app.get('/conference-submission/sponsor',loadUser,function(req,res){
  		console.log("in /conference-submission/sponsor");
  		console.log(req.currentUser);
  		Proposal.find({sponsor_email: req.currentUser.email},function(err,_proposals){
  			console.log(_proposals);
  			res.render('sponsor.jade',{user: req.currentUser, proposals: _proposals});
  		});
  	});


    
}

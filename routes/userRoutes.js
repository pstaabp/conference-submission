var _ = require("underscore");

module.exports = function userRoutes(app,loadUser,User,Proposal,Judge){
	
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
		            res.render('admin/admin.jade', {user: _user,users: _users, proposals: _proposals, judges: _judges});  
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

  	  	// Add a role

  	app.get('/conference-submission/add-role',loadUser,function(req,res){
		res.render('welcome.jade',{user: req.currentUser});  		
  	});


    
}

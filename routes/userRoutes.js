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

}
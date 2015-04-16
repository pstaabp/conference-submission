var _ = require("underscore")
, ldap_settings = require('../ldap');

module.exports = function userRoutes(app,loadUser,User,Proposal,Judge){
	
    app.get('/' + ldap_settings.settings.top_dir + '/admin',loadUser, function(req,res){
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
			            res.render('admin/admin.jade', {user: _user,users: _users, proposals: _proposals, judges: _judges, 
			            				top_dir: ldap_settings.settings.top_dir});  
	  			});
			    });
			});
		    } else {
			res.redirect('/' + ldap_settings.settings.top_dir + '/'+_user.role);
		    }
		});
    });

    app.put('/' + ldap_settings.settings.top_dir + '/users/:user_id', loadUser, function (req,res){
		console.log("in put /users/user");
		User.findByIdAndUpdate(req.params.user_id,_.omit(req.body,"_id"), function (err, user) {    
		    console.log("updated!!");
		    if(err) {
	    		res.json({msg: "An error occurred"});
		    }

		    res.json(user.getPublicFields());
		});
    });

	
  	app.get('/' + ldap_settings.settings.top_dir + '/users/:user_id',loadUser, function(req,res){
  		User.findById(req.param("user_id"),function(err,user){
  			res.json(user);
  		});
  	});

  	app.delete('/' + ldap_settings.settings.top_dir + '/users/:user_id',loadUser, function(req,res){
  		User.remove({_id: req.param("user_id")},function(err,user){
  			if(err){
  				console.log(err);
  			}
  			res.json(user);
  		});
  	});


	// The main page for student views

	app.get('/' + ldap_settings.settings.top_dir + '/student',loadUser, function(req,res){
		Proposal.find({email: req.currentUser.email}, function(err,_proposals){
		   	res.render('student.jade',{user: req.currentUser, proposals: _proposals,top_dir: ldap_settings.settings.top_dir});			
		});
  	});

  	// The main page for sponsors

  	app.get('/' + ldap_settings.settings.top_dir + '/sponsor',loadUser,function(req,res){
  		console.log('in /' + ldap_settings.settings.top_dir + '/sponsor');
  		console.log(req.currentUser);
  		Proposal.find({sponsor_email: req.currentUser.email},function(err,_proposals){
  			console.log(_proposals);
  			res.render('sponsor.jade',{user: req.currentUser, proposals: _proposals,top_dir: ldap_settings.settings.top_dir});
  		});
  	});

  	  	// Add a role

  	app.get('/' + ldap_settings.settings.top_dir + '/add-role',loadUser,function(req,res){
  		console.log(req.currentUser);
		res.render('addrole.jade',{user: req.currentUser,top_dir: ldap_settings.settings.top_dir});  		
  	});

  	// Update the role for a user

  	app.post('/' + ldap_settings.settings.top_dir + '/add-role',loadUser,function(req,res){
  		var roles = _(req.currentUser.role).union(_.keys(req.body));
  		User.findByIdAndUpdate(req.currentUser._id,{role: roles}, function(err,user){
  			console.log(user);
 			res.redirect('/' + ldap_settings.settings.top_dir + '/'+_.last(roles));
  		})
  	})

	app.get('/' + ldap_settings.settings.top_dir + '/judge',loadUser,function(req,res){
		Judge.findOne({email: req.currentUser.email},function(err,_judge){
			if(err){
				console.log(err);
				return;
			}
			if(_judge){ // the person has already signed up
				Proposal.find({feedback: { $elemMatch: { judge_id: _judge._id }}}).exec(function(err2,_proposals){
					var _user = {judge_id: _judge._id};
					_(_user).extend(_(req.currentUser).pick("falconkey","first_name","last_name","email"));
					res.render('submit-feedback.jade',{user:_user, proposals: _proposals,top_dir: ldap_settings.settings.top_dir});
				});	
			} else {
				res.render('users/judges.jade',{user: req.currentUser,top_dir: ldap_settings.settings.top_dir});				
			}
		})

	});

	app.get('/' + ldap_settings.settings.top_dir + '/judges',loadUser,function(req,res){
		Judge.find({},function(err,_judges){
      		if(err) {console.err(err);}
        		res.send(_judges);
    		});	
		});	

	app.post('/' + ldap_settings.settings.top_dir + '/judges',function(req,res){
	  	var pres = _(req.body.presentation).keys();
  		var judge = new Judge({name: req.body.name, email: req.body.email, type: req.body.type, presentation: pres});
  		judge.save(function (err, _judge) {
    		if (err) {console.log(err);}

		    res.render("users/judges-email.jade",{top_dir: ldap_settings.settings.top_dir});
		});
	});

	app.put('/' + ldap_settings.settings.top_dir + '/judges/:id',loadUser,function(req,res){
  
  		var obj = _.omit(_.clone(req.body),"_id");
		console.log(obj);
  		Judge.findByIdAndUpdate(req.params.id,obj, function(err,_judge){
    		if(err) {console.log(err);}
    		res.json(_judge);
  		});
	});

	app.delete('/' + ldap_settings.settings.top_dir + '/judges/:id',loadUser, function(req,res){
  		Judge.remove({_id: req.param("id")},function(err,judge){
  			if(err){
  				console.log(err);
  			}
  			User.findOne({email: judge.email},function(err2,_user){
  				User.findByIdAndUpdate(_user._id,{role: _(_user.role).difference(["judge"])},function(err3,_user2){
  					if(err3){
  						console.log(err3);
  					}	
	  				console.log(_user2.role);
  				});

  			});

  			res.json(judge);
  		});
  	});


	var oralSessions=[
		{session: "0", location: "CTL  (9am-10am)"},
		{session: "1", location: "Hamm. G01 (9am-10am)"},
		{session: "2", location: "Hamm. G01B (9am-10am)"},
		{session: "3", location: "Hamm. 314 (9am-10am)"},
		{session: "4", location: "Hamm. S08 (9am-10am)"},
		{session: "5", location: "Hamm. G19 (9am-10:15am)"},
		{session: "6", location: "CTL  (11am-noon)"},
		{session: "7", location: "Hamm. G01 (11am-noon)"},
		{session: "8", location: "Hamm. G01B (11am-noon)"},
		{session: "9", location: "Hamm. 314 (11am-noon)"},
		{session: "10", location: "Hamm. S08 (11am-noon)"},
		{session: "11", location: "Hamm. G19 (11am-noon)"}];

	var oralRE = /OP-(\d+)-(\d+)/;


	app.get('/' + ldap_settings.settings.top_dir + '/judges-schedule',function(req,res){
		var judgeInfo = [], i= 1; 
		Judge.count(function(err3,numjudges){
	  		Judge.find({}).sort("name").exec(function(err,_judges){
	  			console.log(_judges);
	  			_(_judges).each(function(_judge){
		  			var j = {name: _judge.name, sessions: [] }
		  			Proposal.find({feedback: { $elemMatch: { judge_id: _judge._id }}}).exec(function(err2,_proposals){
		  				j.sessions=_(_proposals).pluck("session");
		  				judgeInfo.push(j);
		  				if(numjudges===judgeInfo.length){
		  					_(judgeInfo).each(function(jud,i){
		  						console.log(jud);
		  						var sessions = _(jud.sessions).chain().map(function(s) {
		  							return oralRE.test(s)? _(oralSessions).findWhere({session: oralRE.exec(s)[1]}).location : s;
		  						}).uniq().value();
		  						judgeInfo[i].sessions = sessions;

		  					})
			  				res.render("showjudges.jade",{judges: judgeInfo,top_dir: ldap_settings.settings.top_dir});
			  			} 
		  			})
		  		});
	  		});
	  	});
	});



    
}

var _ = require("underscore")
  , ldap_settings = require('../ldap')
  , path = require('path')
  , nodemailer = require("nodemailer")
  , templatesDir   = path.join(__dirname, '../templates')
, emailTemplates = require('email-templates');

module.exports = function proposalRoutes(app,loadUser,User,Proposal){

    // create reusable transport method (opens pool of SMTP connections)
    var smtpTransport = nodemailer.createTransport("SMTP",{
	host: "barracuda.fitchburgstate.edu"
    });


    function sendEmail(_options, callback)
    {
        emailTemplates(templatesDir, function(err, template) {

            if (err) {
		console.log(err);
            } else {
		locals = {first_name: _options.user.first_name, last_name: _options.user.last_name};
		_.extend(locals,_options.proposal);

		locals.o_authors = _(locals.other_authors).map(function(a) {return a.first_name + " " + a.last_name;}).join(", ");
		// ## Send a single email
		console.log(locals);

		template('submitted', locals, function(err, html, text) {
		    if (err) {
				console.log(err);
		    } else {
			smtpTransport.sendMail({
			    from: "FSU Undergraduate Conference <ugrad-conf@fitchburgstate.edu>", // sender address
			    subject: "Submission Received for FSU Conference", // Subject line
			    to: _options.email,
			    cc: "ugrad-conf@fitchburgstate.edu," + (_options.cc || ""),
			    html: html,
			    // generateTextFromHTML: true,
			    text: text
			}, function(err, responseStatus) {
			    if (err) {
					return callback(err);
				
			    } else {
					console.log(responseStatus);
					return callback(null,{msg_status:responseStatus.message}); 
			    }
			});
		    }
		});
            }
	});
    }

    app.post('/' + ldap_settings.settings.top_dir + '/email/test',function(req,res){
		var prop = {title: "The Title",sponsor_name: "Peter Staab",sponsor_dept: "Mathematics",
			    sponsor_email: "pstaab@fitchburgstate.edu", type: "poster", 
			    other_authors: [],other_equipment: "",content: "This is the proposal"};
		var _user = {first_name: "Peter", last_name: "Staab", email: "pstaab@fitchburgstate.edu"};
		sendEmail({user:_user,proposal: prop, email: _user.email},function(err,msg){
		    if(err){
			console.log(err);
		    }
		    if(msg){
			res.json(msg);
		    }
		});
    });


    app.get('/' + ldap_settings.settings.top_dir + '/proposals/:proposal_id',function(req,res){
		Proposal.findById(req.param("proposal_id"),function(err,_proposal){
			console.log(req.is("html"));
			console.log(req.is());
			if(req.is("application/json")){
				res.json(_proposal);
			} else {
				res.render('show-proposal.jade',{proposal: _proposal,top_dir: ldap_settings.settings.top_dir})
			    
			}

		});
    });

    app.delete('/' + ldap_settings.settings.top_dir + '/proposals/:proposal_id',loadUser,function(req,res){
  		User.findById(req.session.user_id, function(err, admin_user) {

  			console.log(admin_user);

	    	if(! _(admin_user.role).contains("admin")){ 
	      		res.json({deleted: false, message: "You do not have crendentials to do this."});
	      		return;
	    	}

	    	Proposal.findByIdAndRemove(req.param("proposal_id"), function (err, _prop) {
	      		if (err) {
	        		console.log(err);
      			} else {
        			res.json({deleted: true, proposal: _prop});
      			}
    		});
  		});

    });

    app.post('/' + ldap_settings.settings.top_dir + '/users/:user_id/proposals',loadUser,function(req,res){
		var proposal = new Proposal(req.body);

		proposal.save(function (err, prop) {
    	    if (err){ 
				console.log(err);
				return;
		    }
		    if(prop){
				var emails = _(prop.other_authors).pluck("email");
				emails.push(prop.sponsor_email);
				console.log(emails);
				if(ldap_settings.settings.use_ldap){
		    		sendEmail({user:req.currentUser ,proposal: prop, email: prop.email, cc: emails.join(", ")},function(err,msg){

					    if(err)
							console.log(err);
					    if(msg)
							res.json({emailsSent: true});
					});
		    	} else {
		    		console.log("sending email not supported. ");
		    		res.json({emailsSent: false});
		    	}
		    }
		   
    	});
    });

    app.put('/' + ldap_settings.settings.top_dir + '/proposals/:proposal_id',loadUser,function(req,res){
		Proposal.findByIdAndUpdate(req.params.proposal_id,_.omit(req.body, "_id"), function (err, prop) {
	    	    if (err) {console.log(err);}
		    
	    	    res.json(prop);
		});
    });


    app.put('/' + ldap_settings.settings.top_dir + '/users/:user_id/proposals/:proposal_id',loadUser,function(req,res){
	Proposal.findByIdAndUpdate(req.params.proposal_id,_.omit(req.body, "_id"), function (err, prop) {
    	    if (err) {console.log(err);}
	    
    	    res.json(prop);
	});
    });

    app.get('/' + ldap_settings.settings.top_dir + '/posters',function(req,res){
    	Proposal.find({type: "Poster Presentation"},function(err,_proposals){
    		var props = _(_proposals).sortBy("session");
    		res.render('posters.jade',{proposals: props,top_dir: ldap_settings.settings.top_dir});
    	});
    });


    app.get('/' + ldap_settings.settings.top_dir + '/orals',function(req,res){
    	Proposal.find({type: "Oral Presentation"},function(err,_proposals){
    		res.render('orals.jade',{proposals: _proposals,top_dir: ldap_settings.settings.top_dir});
    	});
    });

    app.get('/' + ldap_settings.settings.top_dir + '/schedule',function(req,res){
        console.log("in GET /"+ldap_settings.settings.top_dir + "/schedule");

  Proposal.find({type: "Oral Presentation"}).exec(function(err,_proposals){
    var props = [], row,col,session,theProp;
    for(k=0;k<2;k++){
      for(row=0;row<5;row++){
        for(col=0; col<6; col++){
          session = 6*k+col;
          theProp = _.find(_proposals,function(proposal){ return proposal.session === "OP-" + session + "-" + row});
          var sess = (theProp)? theProp.session: "none";
          props.push(theProp);
        }
      }
    }
    res.render('schedule.jade',{proposals: props,top_dir: ldap_settings.settings.top_dir});
  });

});


}

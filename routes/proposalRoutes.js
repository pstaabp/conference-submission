var _ = require("underscore")
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

		console.log(locals);
		// ## Send a single email

		// Send a single email
		template('submitted', locals, function(err, html, text) {
		    if (err) {
			console.log(err);
		    } else {
			smtpTransport.sendMail({
			    from: "FSU Undergraduate Conference <ugrad-conf@fitchburgstate.edu>", // sender address
			    subject: "Submission Received for FSU Conference", // Subject line
			    to: _options.email,
			    //cc: "ugrad-conf@fitchburgstate.edu",
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

    app.post('/conference-submission/email/test',function(req,res){
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


    app.get('/conference-submission/proposals/:proposal_id',loadUser,function(req,res){
	Proposal.findById(req.param("proposal_id"),function(err,proposal){
	    res.json(proposal);
	});
    });

    app.del('/conference-submission/proposals/:proposal_id',loadUser,function(req,res){
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

    app.post("/conference-submission/users/:user_id/proposals",loadUser,function(req,res){
	var proposal = new Proposal(req.body);
	var emailsSent = {student: false, sponsor: false};

	proposal.save(function (err, prop) {
    	    if (err) 
		console.log(err);
    	    /*sendEmail({user: {},proposal: prop, email: prop.email},function(err,msg){
		if(err)
		    console.log(err);
		if(msg){
		    emailsSent.student = true;
		    console.log(msg);
		    if(_(emailsSent).isEqual({student: true, sponsor: true}))
			res.json({emailsSent: true});
		}
	    });
    	    sendEmail({user: {},proposal: prop, email: prop.sponsor_email},function(err,msg){
		if(err)
		    console.log(err);
		if(msg){
		    emailsSent.sponsor = true;
		    console.log(msg);
		    if(_(emailsSent).isEqual({student: true, sponsor: true}))
			res.json({emailsSent: true});
		} 
	    });*/
  	});
    });

    app.put("/conference-submission/users/:user_id/proposals/:proposal_id",loadUser,function(req,res){
	
	Proposal.findByIdAndUpdate(req.params.proposal_id,_.omit(req.body, "_id"), function (err, prop) {
    	    if (err) {console.log(err);}
    	    res.json(prop);
	});
    });

}
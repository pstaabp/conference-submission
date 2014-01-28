var _ = require("underscore");

module.exports = function proposalRoutes(app,loadUser,User,Proposal){

	app.get('/conference-submission/proposals/:proposal_id',loadUser,function(req,res){
		Proposal.findById(req.param("proposal_id"),function(err,proposal){
			res.json(proposal);
		});
	});

	app.post("/conference-submission/users/:user_id/proposals/",loadUser,function(req,res){
		var proposal = new Proposal(req.body);
		proposal.save(function (err, prop) {
    		if (err) {console.log(err);}
    		res.json(prop);
  		});
	});

	app.put("/conference-submission/users/:user_id/proposals/:proposal_id",loadUser,function(req,res){
		console.log(req.params.proposal_id);
		console.log(req.body);
		Proposal.findByIdAndUpdate(req.params.proposal_id,_.omit(req.body, "_id"), function (err, prop) {
    		if (err) {console.log(err);}
    		res.json(prop);
		});
	});

}
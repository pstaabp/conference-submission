module.exports = function proposalRoutes(app,loadUser,User,Proposal){

	app.get('/conference-submission/proposals/:proposal_id',loadUser,function(req,res){
		Propsoal.findById(req.param("proposal_id"),function(err,proposal){
			res.json(proposal);
		});
	});

}
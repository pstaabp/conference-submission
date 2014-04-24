// make sure that require-config.js is loaded before this file. 
define(['module','jquery','backbone', 'underscore','views/WebPage','models/ProposalList'],
function(module,$, Backbone, _,WebPage,ProposalList) {
	var JudgeFeedbackPage = WebPage.extend({
		initialize: function(opts){
			this.proposals = (module.config())? new ProposalList(module.config().proposals,{parse: true}) : new ProposalList();
            this.user = (module.config())? module.config().user : {}
            
            console.log(this.proposals);
            console.log(this.user);
		},
		render: function(){
			this.$el.html($("#feedback-template").html())
		}

	});

	new JudgeFeedbackPage({el: $("#feedback-container")}).render()
});
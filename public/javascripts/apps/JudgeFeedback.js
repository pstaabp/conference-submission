// make sure that require-config.js is loaded before this file. 
define(['module','jquery','backbone', 'underscore','views/WebPage','models/ProposalList','views/FeedbackView','bootstrap'],
function(module,$, Backbone, _,WebPage,ProposalList,FeedbackView) {
	var JudgeFeedbackPage = WebPage.extend({
		initialize: function(opts){
			var self = this;
			WebPage.prototype.initialize.apply(this, {el: this.el});
			this.proposals = (module.config())? new ProposalList(module.config().proposals,{parse: true}) : new ProposalList();
            this.user = (module.config())? module.config().user : {}
            
            this.proposals.on("sync",function(_prop){
                self.messagePane.addMessage({short:"The proposal for " + _prop.get("author") + 
					     " was saved.", type: "success"});
            });

		},
		render: function(){
			WebPage.prototype.render.apply(this);  // Call  WebPage.render(); 
			var self = this; 
			this.$el.html($("#feedback-tabs-template").html());
			var feedbackTabTemplate = _.template($("#feedback-tab-template").html());
			this.proposals.each(function(_proposal,i){
				self.$(".feedback-tabs").append(feedbackTabTemplate({prop_num: (i+1),author: _proposal.get("author")}));
				var feedback = _proposal.get("feedback").findWhere({judge_id: self.user.judge_id});
				self.$(".feedback-content").append(new FeedbackView({model: feedback, proposal: _proposal, tab_num: (i+1)}).render().el);
			});

			this.$(".feedback-tabs a:first").tab("show");
		},

	});

	new JudgeFeedbackPage({el: $("#feedback-container")}).render()
});
define(['Backbone','apps/common','models/FeedbackList','models/Feedback','views/FeedbackView', 
    'stickit'], 
    function(Backbone,common,FeedbackList,Feedback,FeedbackView){

    var AllFeedbackView = Backbone.View.extend({
    	initialize: function(options){
    		_.bindAll(this,"render");
    		this.rowTemplate = $("#feedback-row-template").html();
            this.proposals = options.proposals;
    	},
    	render: function(){
    		var self = this;
    		this.allFeedback = this.proposals.filter(function(prop) { return prop.get("feedback").length >0 });
    		var table = this.$(".all-feedback-table tbody").html("");
    		_(this.allFeedback).each(function(proposal){
    			table.append((new FeedbackRowView({model: proposal, rowTemplate: self.rowTemplate})).render().el);
    		}); 
    	}
	});

	var FeedbackRowView = Backbone.View.extend({
		tagName: "tr",
		initialize: function(options){
    		_.bindAll(this,"render");
    		this.rowTemplate = options.rowTemplate;
    	},
    	render: function(){
    		this.$el.html(this.rowTemplate);
    		this.stickit();
    		return this;
    	},
		showFeedback: function(evt){
            var feedbackID = $(evt.target).data("id");
            var feedback = this.model.get("feedback").find(function(feed) { 
                return feed.id===feedbackID;
            });

            (new FeedbackView({model: feedback, el: $(".proposal-modal")})).render();

        },
    	events: {"click a.showFeedback": "showFeedback"},
    	bindings: { ".session": "session",
    				".author": "author",
    				".title": "title",
    			 	".feedback": {
    			 		observe: "feedback",
    			 		updateMethod: 'html',
      					onGet: function(val) { 
      						var output = val.map(function(f,i) { return "<a class='showFeedback' href='#' data-id='" + f.id + "'>Judge " + (i+1) + "</a>";});
      						return output.join(", "); }
    			 	}}
	});

	return AllFeedbackView; 
});
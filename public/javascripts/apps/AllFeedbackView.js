/*define(['backbone','apps/common','models/FeedbackList','models/Feedback', 
    'jquery-ui','stickit','bootstrap'], 
    function(backbone,common,FeedbackList,Feedback){ */
define(['backbone','views/CollectionTableView','models/ProposalList', 'stickit'],function(Backbone,CollectionTableView,ProposalList){

    var AllFeedbackView = Backbone.View.extend({
        initialize: function(options){
            var self = this;
            _.bindAll(this, "render");
            this.rowTemplate = $("#all-feedback-template").html();
            this.proposals = options.proposals;
            this.proposals.on("remove",this.render);
            this.users = options.users;
            this.judges = options.judges;
            this.tabTemplate = _.template($("#feedback-tab-template").html());

            this.proposals.on("sync",function(_proposal){
                self.render();
            });
        },
        render: function(){
            var self = this;
            switch($("input[type='radio'][name='feedview']:checked").val()){
                case "all": 
                    this.proposalList = new ProposalList(this.proposals.toArray());
                    break;
                case "orals":
                    this.proposalList = new ProposalList(this.proposals.filter(function(_prop) {
                            return _prop.get("type") === "Oral Presentation"}));
                    break;
                case "posters":
                    this.proposalList = new ProposalList(proposals = this.proposals.filter(function(_prop){
                            return _prop.get("type") === "Poster Presentation"}));
                    break;
            }
            var table = this.$(".feedback-table tbody");
            this.tableSetup();

            this.proposalList.on("change",function(_p){
                console.log(_p.changed);
                });
            this.feedbackTable = new CollectionTableView({columnInfo: this.cols, collection: this.proposalList, row_id_field: "_id",
                                paginator: {page_size: 15, button_class: "btn btn-default", row_class: "btn-group"}});
            this.feedbackTable.render().$el.addClass("table table-bordered table-condensed");
            this.$('.feedback-table-container').html(this.feedbackTable.el);
            this.$('.num-proposals').text("There are " + this.proposals.size() + " proposals shown.");
        },
        events: {
            "keyup .search-all-feedback": "search",
            "click .clear-search-all-feedback": "clearSearch",
            "change input[name='feedview']": "render",
        },
        showHideFeedback: function ($el,model,target) {
            if(target.text()==="Show"){
                target.text("Hide");
                $el.parent().siblings(".feedback-tab-row").each(function(i,v){
                    $(v).prev().children(".show-proposal").children("button").text("Show");
                    $(v).remove();
                })
                $el.parent().after(new FeedbackTabView({model: model, proposals: this.proposals, judges: this.judges, 
                        tabTemplate: this.tabTemplate}).render().el);
            } else {
                target.text("Show");
                $el.parent().siblings(".feedback-tab-row").remove();
            }   
            
        },
        tableSetup: function(){
            var self = this;
            var roleTemplate = _.template($("#role-template").html());
            this.cols = [{name: "Show", key: "show_proposal", classname: "show-proposal", 
                stickit_options: {update: function($el, val, model, options) {
                    $el.html($("#show-button-template").html());
                    $el.children(".btn").on("click",function(evt) {
                        self.showHideFeedback($el,model,$(evt.target));
                    });
                }}},
            {name: "Session", key: "session", classname: "session", editable: false, datatype: "string"},
            {name: "Main Author", key: "author", classname: "author", editable: false, datatype: "string",
                sort_function: function(author){
                    var names = author.split(" ");
                    return names[names.length-1].toLowerCase();
                }},
            {name: "Proposal Title", key: "title", classname: "title", additionalClass: "col-md-6", datatype: "string"},
            {name: "Score (# judges)", key: "score", classname: "score", datatype: "number", 
                value: function(model){
                    var score = model.get("feedback").map(function(f) { return f.score();})
                    if(score.length>0){
                        var numJudges = model.get("feedback").length; 
			            var sc = _(score).reduce(function(n,m){return n+m;});
			            return sc/numJudges;
                    } else {
                        return 0;
                    }
                },
                stickit_options: {
                    update: function($el, val, model, options) {
                        var numJudges = model.get("feedback").length; 
			            var score = model.get("score");
			            var scoreAsString = parseInt(100*score)/100;
			            $el.text((numJudges==0)?"---":scoreAsString + " (" +numJudges + ")");
                    }
                }},
            {name: "feedback", key: "feedback", classname: "feedback", show_column: false},
            {name: "_id", key: "_id", classname: "id", show_column: false}
            ];
        },
        search: function(evt){
            this.feedbackTable.set({filter_string: $(evt.target).val()});
            this.feedbackTable.render();
            this.$('.num-proposals').text("There are " + this.feedbackTable.filteredCollection.length
                + " of " + this.proposals.size() 
                + " proposals shown.");
        },
        clearSearch: function(evt){
            this.$(".search-all-feedback").val("");
            this.feedbackTable.set({filter_sring: ""});
            this.feedbackTable.render();
            this.$('.num-proposals').text("There are " + this.proposals.size() + " proposals shown.");
        }

    });

    var FeedbackTabView = Backbone.View.extend({
        tagName: "tr",
        className: "feedback-tab-row",
        initialize: function (options){
            var self = this; 
            this.judges = options.judges;
            this.proposals = options.proposals;
            this.tabTemplate = options.tabTemplate;
            _(this).bindAll("render");
            this.model.get("feedback").on("remove",function(feedback){
                self.render();
                self.proposals.get(self.model.get("_id")).save();
            });
        },
        render: function(){
            var self = this;
            var hi = "hi";
            this.$el.html($("#feedback-tabs").html());
            this.model.get("feedback").each(function(feedback,i){
		        var judgeName =   self.judges.get(feedback.get("judge_id")) ? self.judges.get(feedback.get("judge_id")).get("name") : "OOPS";
		
                var obj = {
                    judge_name:  (feedback.get("judge_id")=="") ? "NONE": judgeName, tab_no: (i+1)};
                self.$(".feedback-tabs").append(self.tabTemplate(obj));
                self.$(".feedback-tab-content").append( 
                    new FeedbackView({tab_no: (i+1), model: feedback, proposal: self.model, judges: self.judges,
                                             proposals: self.proposals}).render().el);
            });

            this.$(".feedback-tabs a:first").tab('show');
            this.$("#feedback-tab-1").addClass("active");
            return this;
        },
        events: { 'a[data-toggle-tab] show.bs.tab': function(evt){
            evt.preventDefault()
            $(this).tab('show');}
        }
    });

    var FeedbackView = Backbone.View.extend({
        tagName: "div",
        className: "tab-pane",
        initialize: function (options){
            var self = this; 
            this.judges = options.judges;
            this.proposal = options.proposal;
            this.proposals = options.proposals;
            this.invBindings = _.invert(_.extend(_.omit(this.bindings,".judge"),{".judge": "judge_id"}));
            this.tab_no = options.tab_no; 
            this.model.on("change",function(m){
                self.$(".total-score").text(self.model.score());
            })
        },
        render: function (){
            var self = this;
            this.$el.attr("id", "feedback-tab-" + this.tab_no);
            this.$el.html($("#feedback-edit-template").html());
            Backbone.Validation.bind(this);
            this.stickit();
            this.$(".total-score").text(this.model.score());
            return this;
        },
        bindings: {
            ".visual-design": "visual_design",
            ".knowledge": "knowledge",
            ".verbal-presentation": "verbal_presentation",
            ".organization-and-logic": "organization_and_logic",
            ".overall": "overall",
            ".comments": "comments"
        },
        events: {
            "click .save-feedback-button": "saveFeedback",
            "click .delete-feedback-button": "deleteFeedback"
        },
        saveFeedback: function (){
            var self = this;
            var errors = this.model.validate();
            if(errors){
                _(errors).chain().keys().each(function(attr){
                    self.$(self.invBindings[attr]).popover({content: errors[attr]}).popover("show").addClass("error");
                });
            } else {
                this.$(".error").removeClass("error");
                //this.proposal.save();
                this.proposals.get(this.proposal.get("_id")).save();
            }
        },
        deleteFeedback: function(){
            var del = confirm("Do you want to delete this feedback?");
            if(del){
                this.model.collection.remove(this.model);
                this.remove();
            }
        }
    });

    


   


    return AllFeedbackView;

});

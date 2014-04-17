/*define(['backbone','apps/common','models/FeedbackList','models/Feedback', 
    'jquery-ui','stickit','bootstrap'], 
    function(backbone,common,FeedbackList,Feedback){ */
define(['backbone','views/CollectionTableView', 'stickit'],function(Backbone,CollectionTableView){

    var AllFeedbackView = Backbone.View.extend({
        initialize: function(options){
            _.bindAll(this, "render");
            this.rowTemplate = $("#all-feedback-template").html();
            this.proposals = options.proposals;
            this.proposals.on("remove",this.render);
            this.users = options.users;
            this.judges = options.judges;
        },
        render: function(){
            var self = this;
            var table = this.$(".feedback-table tbody");
            this.tableSetup();
            this.feedbackTable = new CollectionTableView({columnInfo: this.cols, collection: this.proposals, 
                                paginator: {page_size: 15, button_class: "btn btn-default", row_class: "btn-group"}});
            this.feedbackTable.render().$el.addClass("table table-bordered table-condensed");
            this.$('.feedback-table-container').html(this.feedbackTable.el);
            this.$('.num-proposals').text("There are " + this.proposals.size() + " proposals shown.");
        },
        events: {
            "keyup .search-proposals": "search",
            "click .clear-search-proposal": "clearSearch"
        },
        showHideFeedback: function ($el,model,target) {
            if(target.text()==="Show"){
                target.text("Hide");
                $el.parent().siblings(".feedback-tab-row").each(function(i,v){
                    $(v).prev().children(".show-proposal").children("button").text("Show");
                    $(v).remove();
                })
                $el.parent().after(new FeedbackTabView({model: model, judges: this.judges}).render().el);
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
            {name: "Proposal Title", key: "title", classname: "title", additionalClass: "col-md-6", editable: true, datatype: "string"},
            ];
        },
        search: function(evt){
            this.proposalsTable.filter($(evt.target).val());
            this.proposalsTable.render();
            this.$('.num-proposals').text("There are " + this.proposalsTable.filteredCollection.length
                + " of " + this.proposals.size() 
                + " proposals shown.");
        },
        clearSearch: function(evt){
            this.$(".search-proposals").val("");
            this.proposalsTable.filter("");
            this.proposalsTable.render();
            this.$('.num-proposals').text("There are " + this.proposals.size() + " proposals shown.");
        }

    });

    var FeedbackTabView = Backbone.View.extend({
        tagName: "tr",
        className: "feedback-tab-row",
        initialize: function (options){
            this.judges = options.judges;
            _(this).bindAll("render");
        },
        render: function(){
            this.$el.html($("#feedback-tabs").html());
            var session = this.model.get("session");
            var judges = this.judges.filter(function(judge){ return _(judge.get("sessions")).contains(session);})
            return this;
        },
         bindings: {".accepted": "accepted",
                ".author": "author",
                ".session": "session",
                ".type": "type",
                ".title": "title",
                ".submitted-date": "submit_date",
                ".sponsor-name": "sponsor_name",
                ".sponsor-email": "sponsor_email",
                ".sponsor-dept": "sponsor_dept",
                ".use-human-subjects": "use_human_subjects",
                ".use-animal-subjects": "use_animal_subjects",
                ".proposal-content": "content",
                ".sponsor-statement": "sponsor_statement",
                ".human-subjects-number": "human_subjects_number",
                ".animal-subjects-number": "animal_subjects_number",
                ".grad-year": "grad_year",
                ".presented-before": "presented_before",
                ".other-authors": {observe: "other_authors", onGet: function(val){
                    return _(val.map(function(author) { return author.get("first_name") + " " + author.get("last_name");})).join(", ");
                }}
        }    
    });


    var FeedbackView2 = Backbone.View.extend({
        initialize: function (options){
            _.bindAll(this,"render","newFeedback");
            this.judgeList = options.judgeList;
            this.proposal = options.proposal;
        },
        render: function() {
            var self = this; 
            this.$el.html($("#feedback-tabs").html());
            this.proposal.get("feedback").each(function(feed,i){
                var linkName = self.proposal.id  + "j" + (i+1);
                this.$(".feedback-tabs").append(_.template($("#feedback-tab").html(),{tabID: linkName, judgeNum: (i+1)}));
                this.$(".feedback-tab-content").append((new FeedbackItemView({num: (i+1), tabID: linkName,
                                model: feed, judgeList: self.judgeList, proposal: self.proposal})).render().el);
            });

            this.$("ul.feedback-tabs li:eq(0)").addClass("active");
            this.$(".feedback-tab-content .tab-pane:eq(0)").addClass("active");
            
        }, 
        events: {"click .new-feedback-btn": "newFeedback",
                 "click .feedback-tabs a": "showTab"},
        newFeedback: function (){
            this.proposal.get("feedback").add(new Feedback());
            this.render();
            this.$('.feedback-tabs a:last').tab('show');
        }, 
        // Not sure why this is needed.  This is perhaps because it is generated dynamically. 
        showTab: function(evt){
          evt.preventDefault();
          $(this).tab('show');
        }
    });

    var FeedbackItemView = Backbone.View.extend({
        tagName: "div",
        className: "tab-pane",
        initialize: function (){
            var self = this; 
            _.bindAll(this,"render","saveFeedback");
            this.judgeList = this.options.judgeList;
            this.proposal = this.options.proposal;
            this.invBindings = _.invert(_.extend(_.omit(this.bindings,".judge"),{".judge": "judge_id"}));
        },
        render: function (){
            var self = this;
            this.$el.attr("id", this.options.tabID);
            this.$el.html($("#feedback-edit-template").html());
            backbone.Validation.bind(this);
            this.stickit();
            return this;
        },
        bindings: {".judge": {
                observe: "judge_id",
                selectOptions: { collection: "this.judgeList", labelPath: "name", valuePath: "id", 
                    defaultOption: { label: 'Choose one...',  value: null },
                }
            },
            ".visual-design": "visual_design",
            ".knowledge": "knowledge",
            ".verbal-presentation": "verbal_presentation",
            ".explanations": "explanations",
            ".organization-and-logic": "organization_and_logic",
            ".overall": "overall",
            ".strength": "strength_comment",
            ".improvement": "improvement_comment"
        },
        events: {"click .save-feedback-button": "saveFeedback"},
        saveFeedback: function (){
            var self = this;
            var errors = this.model.validate();
            if(errors){
                _(errors).chain().keys().each(function(attr){
                    self.$(self.invBindings[attr]).popover({content: errors[attr]}).popover("show").addClass("error");
                });
            } else {
                this.$(".error").removeClass("error");
                this.proposal.save();
            }
        }
    });

    


   


    return AllFeedbackView;

});
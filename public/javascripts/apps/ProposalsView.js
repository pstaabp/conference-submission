/*define(['backbone','apps/common','models/FeedbackList','models/Feedback', 
    'jquery-ui','stickit','bootstrap'], 
    function(backbone,common,FeedbackList,Feedback){ */
define(['backbone','views/CollectionTableView', 'stickit'],function(Backbone,CollectionTableView){

    var ProposalsView = Backbone.View.extend({
        initialize: function(options){
            _.bindAll(this, "render");
            this.rowTemplate = $("#proposal-template").html();
            this.proposals = options.proposals;
            this.proposals.on("remove",this.render);
            this.users = options.users;

            // this is used for the stickit select options below. 
            this.judgeList = options.judges.chain().sortBy(function(judge){ return judge.get("name");}).
                map(function(judge){ return {name: judge.get("name"), id: judge.id};}).value();            
        },
        render: function(){
            var self = this;
            var table = this.$(".proposals-table tbody");
            this.tableSetup();
            this.proposalsTable = new CollectionTableView({columnInfo: this.cols, collection: this.proposals, 
                                paginator: {page_size: 15, button_class: "btn btn-default", row_class: "btn-group"}});
            this.proposalsTable.render().$el.addClass("table table-bordered table-condensed");
            this.$('.proposals-table-container').html(this.proposalsTable.el);

        },
        showHideProposal: function ($el,model,target) {
            if(target.text()==="Show"){
                target.text("Hide");
                $el.parent().siblings(".proposal-detail-row").each(function(i,v){
                    $(v).prev().children(".show-proposal").children("button").text("Show");
                    $(v).remove();
                })
                $el.parent().after(new ProposalDetailView({proposal: model, users: this.users}).render().el);
            } else {
                target.text("Show");
                $el.parent().siblings(".proposal-detail-row").remove();
            }   
            
        },
        tableSetup: function(){
            var self = this;
            var roleTemplate = _.template($("#role-template").html());
            this.cols = [{name: "Show", key: "show_proposal", classname: "show-proposal", 
                stickit_options: {update: function($el, val, model, options) {
                    $el.html($("#show-button-template").html());
                    $el.children(".btn").on("click",function(evt) {
                        self.showHideProposal($el,model,$(evt.target));
                    });
                }}},
            {name: "Accepted", key: "accepted", classname: "accepted", editable: true, datatype: "boolean"},
            {name: "Session", key: "session", classname: "session", editable: false, datatype: "string"},
            {name: "Main Author", key: "author", classname: "author", editable: false, datatype: "string"},
            {name: "Proposal Title", key: "title", classname: "title", additionalClass: "col-md-6", editable: true, datatype: "string"},
            {name: "Proposal Type", key: "type", classname: "type", editable: false, datatype: "string"}
            ];
        }
    });

    var ProposalDetailView = Backbone.View.extend({
        tagName: "tr",
        className: "proposal-detail-row",
        initialize: function (options){
            var ExtendedProposal = Backbone.Model.extend({})
                , attrs = {};
            _(attrs).extend(options.proposal.attributes);
            _(attrs).extend(options.users.findWhere({email: options.proposal.get("email")}).pick("grad_year","presented_before"));
            this.model = new ExtendedProposal(attrs);

        },
        render: function(){
            this.$el.html($("#proposal-details-template").html());
            this.stickit();
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
                ".presented-before": "presented_before"
        },    
    });


    var FeedbackView = Backbone.View.extend({
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

    


   


    return ProposalsView;

});
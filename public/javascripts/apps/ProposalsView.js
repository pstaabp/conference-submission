define(['Backbone','./common','models/FeedbackList','models/Feedback', 
    'jquery-ui','stickit','bootstrap'], 
    function(Backbone,common,FeedbackList,Feedback){

    var ProposalsView = Backbone.View.extend({
        initialize: function(options){
            _.bindAll(this, "render","sortProposals");
            this.rowTemplate = $("#proposal-row-template").html();
            this.proposals = options.proposals;
            this.proposals.on("remove",this.render);

            // this is used for the stickit select options below. 
            this.judgeList = options.judges.chain().sortBy(function(judge){ return judge.get("name");}).
                map(function(judge){ return {name: judge.get("name"), id: judge.id};}).value();            
        },
        render: function(){
            var self = this;
            this.$("tbody").html("");
            this.proposals.each(function(proposal){
                self.$(".proposal-table > tbody").append((new ProposalRowView({model: proposal, 
                        rowTemplate: self.rowTemplate, judgeList: self.judgeList})).render().el);
            });
        },
        events: {"change input.sortable": "sortProposals"},
        sortProposals: function(evt){
            this.proposals.sortField = $(evt.target).val();
            this.proposals.sort();
            this.render();
        }
    });


    var ProposalRowView = Backbone.View.extend({
        tagName: "tr",
        className: "proposal-row",
        initialize: function(options){
            _.bindAll(this,"render","deleteProposal","changeAcceptedStatus");
            this.rowTemplate = options.rowTemplate;
            this.judgeList = options.judgeList;

        },
        render: function() {
            var self = this;
            if(!this.model) { return this; }

            var subDate = this.model.get("submit_date");
            var subTime = this.model.get("submit_date");

            this.$el.html(this.rowTemplate);
            this.$el.attr("id",this.model.cid);

            // include the feedback form
            this.feedbackView = new FeedbackView({el: this.$(".feedback-cell"),judgeList: this.judgeList, proposal: this.model});
            this.feedbackView.open = false; 

            if(this.model.get("accepted")){this.$("table").removeClass("not-accepted");}
            this.stickit();
            return this;
        },
        events: {"click .delete-proposal": "deleteProposal",
                 "dblclick .proposal-content": "editContent",
                 "change .edit-content": "saveContent",
                 "focusout .edit-content": "closeContent",
                 "change input[type='checkbox']": "changeAcceptedStatus",
                 "click .show-feedback": "showHideFeedback"}
                 ,
        bindings: {".accepted": "accepted",
                ".author": "author",
                ".session": "session",
                ".type": "type",
                ".title": "title",
                ".sponsor-name": "sponsor_name",
                ".sponsor-email": "sponsor_email",
                ".sponsor-dept": "sponsor_dept",
                ".use-human-subjects": "use_human_subjects",
                ".use-animal-subjects": "use_animal_subjects",
                ".proposal-content": "content",
                ".sponsor-statement": "sponsor_statement"},
        deleteProposal: function(){
            var del = confirm("Do you wish to delete the proposal " + this.model.get("title") +"?");
            if(del){
                this.model.destroy();
            }
        },
        editContent: function(){
            var self = this;
            var content = this.$(".proposal-content").text();
            this.$(".proposal-content").html("<textarea rows='10' class='edit-content'>" + content + "</textarea>");
            this.$(".edit-content").focus();
            this.delegateEvents();
        },
        saveContent: function(){
            var newContent = this.$(".edit-content").val();
            this.model.set({content: newContent});
            this.model.save();
        
        },
        closeContent: function(){
            var content = this.$(".edit-content").val();
            this.$(".proposal-content").html(content);
        },

        changeAcceptedStatus: function(evt){
            this.model.set({accepted: $(evt.target).prop("checked")});
            this.model.save();
            if($(evt.target).prop("checked")){
                this.$("table").removeClass("not-accepted");
            } else {
                this.$("table").addClass("not-accepted");
            }
        },
        showHideFeedback: function(evt){
            if(this.feedbackView.open){

                this.feedbackView.$el.hide("blind",500);
                this.$(".show-feedback").text("Show Feedback");
                this.feedbackView.open = false;
                this.feedbackView.$el.html("");
            } else {
                this.feedbackView.render();
                this.feedbackView.$el.show("blind",500);
                this.$(".show-feedback").text("Hide Feedback");
                this.feedbackView.open = true;
            }
        }

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
            Backbone.Validation.bind(this);
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
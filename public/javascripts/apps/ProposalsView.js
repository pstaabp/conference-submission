define(['Backbone','./common','../views/EditableCell','../models/FeedbackList','../models/Feedback', 
    'jquery-ui-blind','stickit','bootstrap'], 
    function(Backbone,common,EditableCell,FeedbackList,Feedback){

    var ProposalsView = Backbone.View.extend({
        initialize: function(){
            _.bindAll(this, "render");
            this.rowTemplate = $("#proposal-row-template").html();
            this.proposals = this.options.proposals;
            this.proposals.on("remove",this.render);

            // this is used for the stickit select options below. 
            this.judgeList = this.options.judges.chain().sortBy(function(judge){ return judge.get("name");}).
                map(function(judge){ return {name: judge.get("name"), id: judge.id};}).value();            
        },
        render: function(){
            var self = this;
            this.$("tbody").html("");
            this.proposals.each(function(proposal){
                self.$(".proposal-table > tbody").append((new ProposalRowView({model: proposal, 
                        rowTemplate: self.rowTemplate, judgeList: self.judgeList})).render().el);
            });
        }
    });


    var ProposalRowView = Backbone.View.extend({
        tagName: "tr",
        className: "proposal-row",
        initialize: function(){
            _.bindAll(this,"render","deleteProposal","changeAcceptedStatus");
            this.rowTemplate = this.options.rowTemplate;
            this.judgeList = this.options.judgeList;

        },
        render: function() {
            var self = this;
            if(!this.model) { return this; }

            var subDate = (new XDate(this.model.get("submit_date"))).toLocaleDateString();
            var subTime = (new XDate(this.model.get("submit_date"))).toLocaleTimeString();

            //this.$el.html(_.template($("#proposal-row-template").html(),_.extend(this.model.attributes,{date: subDate, time: subTime})));
            this.$el.html(this.rowTemplate);
            this.$el.attr("id",this.model.cid);
            // include the feedback form
            this.feedbackView = new FeedbackView({el: this.$(".feedback-cell"),collection: this.model.get("feedback"),
                    judgeList: this.judgeList, proposal: this.model});
            this.feedbackView.open = false; 
            //this.$(".accepted-checkbox").prop("checked",this.model.get("accepted"));
            if(this.model.get("accepted")){this.$("table").removeClass("not-accepted");}
            //_(common.proposalParams).each(function(prop){
            //    self.$(prop.class).html((new EditableCell({model: self.model, property: prop.field})).render().el);    
            //})
            this.stickit();
            return this;
        },
        events: {"click .delete-proposal": "deleteProposal",
                 "dblclick .proposal-content": "editContent",
                 "change .edit-content": "saveContent",
                 "focusout .edit-content": "closeContent",
                 "change input[type='checkbox']": "changeAcceptedStatus",
                 "click .show-feedback": "showHideFeedback"},
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
            } else {
                this.feedbackView.render();
                this.feedbackView.$el.show("blind",500);
                this.$(".show-feedback").text("Hide Feedback");
                this.feedbackView.open = true;
            }
        }

    });

    var FeedbackView = Backbone.View.extend({
        initialize: function (){
            _.bindAll(this,"render","newFeedback");
            this.judgeList = this.options.judgeList;
            this.proposal = this.options.proposal;
        },
        render: function() {
            var self = this; 
            this.$el.html($("#feedback-tabs").html());
            this.collection.each(function(feedback,i){
                this.$(".feedback-tabs").append(_.template($("#feedback-tab").html(),{tabID: "judge"+(i+1), judgeNum: (i+1)}));
                this.$(".feedback-tab-content").append((new FeedbackItemView({num: (i+1), 
                                model: feedback, judgeList: self.judgeList, proposal: self.proposal})).render().el);
            });

            this.$("ul.feedback-tabs li:eq(0)").addClass("active");
            this.$(".feedback-tab-content .tab-pane:eq(0)").addClass("active");
            
        }, 
        events: {"click .new-feedback-btn": "newFeedback"},
        newFeedback: function (){
            this.collection.add(new Feedback());
            this.render();
        }
    });

    var FeedbackItemView = Backbone.View.extend({
        tagName: "div",
        className: "tab-pane",
        initialize: function (){
            _.bindAll(this,"render");
            this.judgeList = this.options.judgeList;
            this.proposal = this.options.proposal;
            this.invBindings = _.invert(this.bindings);
        },
        render: function (){
            var self = this;
            this.$el.attr("id","judge"+this.options.num);
            this.$el.html($("#feedback-edit-template").html());
            Backbone.Validation.bind(this, {
                valid: function(view,attr){ self.$(self.invBindings[attr]).css("background-color","white");},
              invalid: function(view, attr, error) {
                self.$(self.invBindings[attr])
                    .popover({content: error}).popover("show")
                    .css("background-color","pink");
              }
            });
            this.stickit();
            return this;
        },
        bindings: {".judge": {
                observe: "judge_id",
                selectOptions: { collection: "this.judgeList", labelPath: "name", valuePath: "id", 
                    defaultOption: { label: 'Choose one...',  value: null }
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
            console.log(this.model.attributes);
            this.proposal.save();
        }
    });

    


   


    return ProposalsView;

});
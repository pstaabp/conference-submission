define(['backbone', 'underscore','views/FeedbackView', 'stickit','bootstrap'], function(Backbone, _,FeedbackView){
    /**
     *
     * This defines a ProposalView, which shows a single proposal
     *
     * needed parameters:  
     *     parent:  the View that is above it.
     *     editable: a boolean that determine if the proposal can be edited.  
     * 
     * @type {*}
     */

    var ProposalView = Backbone.View.extend({
    	initialize: function (options) {
            var self = this;
    	},
    	render: function (){
            var self = this; 
    		this.$el.html($("#proposal-view").html());
            $("#other-equip-help").popover({html: true, placement: "left",content: $("#other-equip-help-text").html()});
            this.stickit();
            return this;
    	},
        events: {"click button.submit-proposal-button": "submit",
                 "click button.add-author-button": "addAuthor",
                 "click button.show-feedback-btn": "showFeedback"},
        bindings: { ".title": "title",
                    ".author-name": "author",
                    ".author-email": "email",
                    ".presentation-type": "type",
                    ".human-subjects": "use_human_subjects",
                    ".animal-subjects": "use_animal_subjects",
                    ".sponsor-name": "sponsor_name",
                    ".sponsor-email": "sponsor_email",
                    ".proposal-text": "content",
                    ".other-equipment": "other_equipment",
                    ".sponsor-statement": "sponsor_statement",
                    ".sponsor-dept": { observe: "type",
                                selectOptions:  { collection: ["Behavioral Sciences", "Biology & Chemistry",
                                "Business Administration",
                                "Communications Media", "Computer Science", "Economics, History & Political Science",
                                "Education","English Studies","Exercise & Sports Science", "Geo/Physical Science",
                                "Humanities","Industrial Technology","Mathematics","Nursing","Other"]}}
                            },
        submit: function (){
            console.log("submitting proposal");
            this.model.save({success: this.saved, error: this.error});    
        },
        addAuthor: function (){
            this.additionalAuthorsViews.push(new AdditionalAuthorView({parent: this}));
            this.render();
        },
        removeAuthor: function (_cid){
            this.additionalAuthorsViews = _(this.additionalAuthorsViews).reject(function(view) { return view.cid===_cid;});
            this.render();
        },
        saveStatement: function ()
        {
            this.model.set("sponsor_statement", this.$("#sponsor-statement").val());
            this.model.save({sponsor_statement: this.model.get("sponsor_statement")}, {success: this.savedStatement } )
        },
        
        saved: function(model, response, options) {
            this.parent.announce.addMessage("The proposal was updated.");
            this.parent.announce.addMessage("If you are satisfied with your proposal, please logout.  You will receive an email with a confirmation that your proposal was received.");
        },
        error: function(model, xhr, options){
            console.log("oops an error!")
            console.log(model);
            console.log(xhr);
            console.log(options);
        }, 
        savedStatement: function (model, response,options){
            this.parent.announce.addMessage("The sponsor statement was saved.");
            $("li.active a").removeClass("review-needed");
            
        },
        getOtherAuthors: function(){
            var otherAuthors =[];
            _(this.additionalAuthorsViews).each(function(view){
                otherAuthors.push(view.getAuthor());
            });
            return otherAuthors;
        },
        showFeedback: function(evt){
            var feedbackID = $(evt.target).data("id");
            var feedback = this.model.get("feedback").find(function(feed) { return feed.id===feedbackID;});

            (new FeedbackView({model: feedback, el: $(".feedback-modal")})).render();

        }

    });


    var AdditionalAuthorView = Backbone.View.extend({
        tagName: "tr",
        className: "add-author-row",
        initialize: function (){
            _.bindAll(this,"render","getAuthor","deleteAuthor");
            _.extend(this,this.options);
            if (!this.author){
                this.author = {name: "", email: ""};
            }
        },
        render: function(){
            this.$el.html(_.template($("#add-author-template").html(),this.author));
            this.$("button").prop("disabled",!this.parent.editMode);
            this.delegateEvents();  // this seems to be needed because the button is originally disabled. 

            return this;
        },
        events: {"click button": "deleteAuthor",
                "change input": "saveField"},
        deleteAuthor: function (){
            this.parent.removeAuthor(this.cid);
        },
        saveField: function(evt){
            this.author[$(evt.target).data("field").split("-")[1]] = $(evt.target).val();
        },
        getAuthor: function (){         
            return this.author;
        }

    });

    return ProposalView;

});
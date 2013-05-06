define(['Backbone', 'underscore','bootstrap','stickit'], function(Backbone, _){
    /**
     *
     * This defines a User
     * 
     * @type {*}
     */

    var ProposalView = Backbone.View.extend({
    	template: _.template($("#proposal-view").html()),
    	initialize: function () {
            var self = this;
    		_.bindAll(this,"render","update","saved","savedStatement");
            this.parent = this.options.parent;
            this.facultyView = this.options.facultyView;
            this.editable = (this.options.editable)?this.options.editable:false;

            this.additionalAuthorsViews = [];
            _(this.model.get("other_authors")).each(function(_author){
                self.additionalAuthorsViews.push(new AdditionalAuthorView({author: _author, parent: self}));
            })

    		this.render();

            this.fieldsToSave = {};

    	},
    	render: function (){
            var self = this; 
    		this.$el.html(this.template);

            if(this.editable){
                this.$(".editable").each(function(i,v){ $(v).prop("readonly",false); });
                this.$("submit-proposal-button").text("Save the Proposal");
                
            } else {
                this.$(".editable").each(function(i,v){ $(v).prop("readonly",true); })
                this.$("submit-proposal-button").text("Edit the Proposal");
            }

            this.model.get("feedback").each(function(feed,i){
                this.$(".feedback-row").append("<td><button data-id='" + feed.id  
                        +"' class='show-feedback-btn btn'>Feedback from Judge #" + (i+1) + "</button>");
            })


            $("#other-equip-help").popover({html: true, content: $("#other-equip-help-text").html()});
            this.stickit();


    	},
        events: {"click button#submit-proposal-button": "submit",
                 "change input": "update",
                 "change select": "update",
                 "change #proposal-text": "update",
                 "click button#save-statement": "saveStatement",
                 "click button#add-author": "addAuthor",
                 "click button.show-feedback-btn": "showFeedback"},
        bindings: { ".title": "title",
                    ".author-name": "author",
                    ".author-email": "email",
                    ".sponsor-dept": { observe: "type",
                                selectOptions:  { collection: ["Behavioral Sciences", "Biology & Chemistry",
                                "Business Administration",
                                "Communications Media", "Computer Science", "Economics, History & Political Science",
                                "Education","English Studies","Exercise & Sports Science", "Geo/Physical Science",
                                "Humanities","Industrial Technology","Mathematics","Nursing","Other"]}}
                            },
        update: function (evt){
            var targ = $(evt.target)
                ,field = targ.data("field")
                ,value = (targ.attr("type")==="checkbox")?targ.prop("checked"):targ.val()
                ,obj = {};

            obj[field] = value;
            _(this.fieldsToSave).extend(obj);
        },
        submit: function ()
        {
            if (this.editMode){
                this.editMode = false;
                _.extend(this.fieldsToSave,{other_authors: this.getOtherAuthors()});
                this.model.save(this.fieldsToSave,{success: this.saved, error: this.error});    
                this.fieldsToSave = {};
                this.render();
            } else {
                this.editMode = true;
                this.render();
                return;
            } 
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
            console.log(model);
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

    var FeedbackView = Backbone.View.extend({
        initialize: function (){
            _.bindAll(this,"render");
        },
        render: function(){
            this.$el.html($("#feedback-template").html());
            this.stickit();
            this.$(".modal").modal().width($(window).width()*0.90)
                .css("margin-left", -1*this.$(".modal").width()/2 + "px");
            this.$(".total-score").text(0 + this.model.get("visual_design") + this.model.get("knowledge") 
                    + this.model.get("verbal_presentation") + this.model.get("organization_and_logic")
                    + this.model.get("explanations") + this.model.get("overall"));
        },
        bindings: {".visual-design": "visual_design",
                    ".knowledge": "knowledge",
                    ".verbal-presentation" : "verbal_presentation",
                    ".organization-and-logic": "organization_and_logic",
                    ".explanations": "explanations",
                    ".overall": "overall",
                    ".strength": "strength_comment",
                    ".improvement": "improvement_comment"}
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
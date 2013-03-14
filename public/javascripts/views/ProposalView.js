define(['Backbone', 'underscore','bootstrap'], function(Backbone, _){
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
            this.editMode = (this.options.editMode)?this.options.editMode:false;

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
            if(this.model){
                this.$("#title").val(this.model.get("title"));
                this.$("#pres-type").val(this.model.get("type"));
                this.$("#semail").val(this.model.get("sponsor_email"));
                this.$("#sponsor").val(this.model.get("sponsor_name"));
                this.$("#sponsor-dept").val(this.model.get("sponsor_dept"));
                this.$("#proposal-text").val(this.model.get("content"));
                this.$("#human-subjects").prop("checked",this.model.get("use_human_subjects"));
                this.$("#animal-subjects").prop("checked",this.model.get("use_animal_subjects"));
                this.$("#other-equip").val(this.model.get("other_equipment"));

                _(this.additionalAuthorsViews).each(function(view) {
                    self.$(".add-author-button-row").before(view.render().el);});

                
            }
            if(this.model && this.facultyView){
                console.log(this.model.attributes);
                this.$("#title").html(this.model.get("title"));
                this.$("#pres-type").html(this.model.get("type"));
                this.$("#other-equip").html(this.model.get("other_equipment"));
                this.$("#proposal-text").html(this.model.get("content"));
                this.$("#sponsor-statement").val(this.model.get("sponsor_statement"));
                this.$("#author").html(this.model.get("author"));
                if (this.model.get("other_authors").length >0){
                    this.$("#author").prev().html("Project Authors");
                    this.$("#author").append(", " + (_(this.model.get("other_authors")).pluck("name")).join(", "));
                }

            }
            if (!this.editMode){
                this.$("#submit-proposal-button").html("Edit Proposal");
                this.$("input").prop("disabled",true);
                this.$("select").prop("disabled",true);
                this.$("#proposal-text").prop("disabled",true);
                this.$("#add-author").prop("disabled",true);
            }
            $("#other-equip-help").popover({html: true, content: $("#other-equip-help-text").html()});
    	},
        events: {"click button#submit-proposal-button": "submit",
                 "change input": "update",
                 "change select": "update",
                 "change #proposal-text": "update",
                 "click button#save-statement": "saveStatement",
                 "click button#add-author": "addAuthor"},
        showOtherEquipHelp: function(){

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
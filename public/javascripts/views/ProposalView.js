define(['backbone', 'underscore','views/FeedbackView','apps/common','models/Author','models/AuthorList', 'stickit','bootstrap','backbone-validation'], 
    function(Backbone, _,FeedbackView,common,Author,AuthorList){
    /**
     *
     * This defines a ProposalView, which shows a single proposal
     */

    var ProposalView = Backbone.View.extend({
    	initialize: function (options) {
            _.bindAll(this,"render","updateAuthors","authorChange","verifySponsorEmail");
            //this.model.on("change:other_authors",this.render);
            this.model.get("other_authors").on({add: this.authorChange, remove: this.authorChange});
            this.facultyView = options.facultyView || false;
            this.model.on({"change:use_human_subjects change:use_animal_subjects": this.toggleCheckbox});
    	},
    	render: function (){
            var self = this; 
            Backbone.Validation.bind(this, {
                invalid: function(view, attr, error) {
                    $(_(view.bindings).invert()[attr]).closest(".form-group").addClass("has-error")
                        .popover({title: "Error", content: error, placement: "auto top"}).popover("show");
                },
                valid: function(view, attr, error) {
                    $(_(view.bindings).invert()[attr]).closest(".form-group").removeClass("has-error").popover("hide");
                }
            });

    	    this.$el.html($("#proposal-view").html());
            if(this.facultyView){
                this.$("input,.presentation-type,.proposal-text,.add-author-button").each(function(i,v){ $(v).prop("disabled",true)});
                this.$(".sponsor-row").removeClass("hidden");
                this.$(".submit-proposal-button").text("Submit Sponsor Statement");
            }
            new AdditionalAuthorsView({el: this.$(".other-author-info"),model: this.model}).render();
            $("#other-equip-help").popover({html: true, placement: "left",content: $("#other-equip-help-text").html()});
            this.stickit();
            this.$(".submit-proposal-button").button();
            this.model.on({sync: function(){
                    self.$(".submit-proposal-button").button("saved").attr("disabled","disabled");
                }, 
                change: function () {
                    self.$(".submit-proposal-button").button("reset").attr("disabled",false);
                }
            })
            return this;
    	},
        events: {"click button.submit-proposal-button": "submit",
                 "click button.add-author-button": "updateAuthors",
                 "click button.show-feedback-btn": "showFeedback",
                 "blur .sponsor-email": "checkSponsorEmail",
                 "hidden.bs.modal #additional-author-modal": "addAuthor",
                 //"change input[type='checkbox']": "toggleCheckbox"},
             },
        bindings: { ".title": "title",
                    ".author-name": "author",
                    ".author-email": "email",
                    ".presentation-type": "type",
                    ".human-subjects": {observe: "use_human_subjects", update: function($el, val, model, options) { 
                        $el.prop("checked",val);
                        if(val){
                            this.$(".human-subjects-number").closest(".form-group").removeClass("hidden")
                        }
                    }},
                    ".animal-subjects": {observe: "use_animal_subjects", update: function($el, val, model, options) { 
                        $el.prop("checked",val);
                        if(val){
                            this.$(".animal-subjects-number").closest(".form-group").removeClass("hidden")
                        }
                    }},
                    ".human-subjects-number": "human_subjects_number",
                    ".animal-subjects-number": "animal_subjects_number",
                    ".other-authors": { observe: "other_authors", update: function($el, val, model, options) { 
                        $el.val(model.get("other_authors").map(function(auth) { return auth.get("first_name") + " " + auth.get("last_name");}).join(", ")); 
                    }},
                    ".sponsor-name": "sponsor_name",
                    ".sponsor-email": "sponsor_email",
                    ".proposal-text": "content",
                    ".other-equipment": "other_equipment",
                    ".sponsor-statement": "sponsor_statement",
                    ".sponsor-dept": { observe: "type", selectOptions:  { collection: common.departments}}
        },
        toggleCheckbox: function(model){
            var type = _(model.changed).keys()[0].match(/_(\w+)_/)[1]
            if(_(model.changed).values()[0]){ 
                $("."+type+"-subjects-number").closest(".form-group").removeClass("hidden");
            } else {
                $("."+type+"-subjects-number").closest(".form-group").addClass("hidden");
            }
        },
        authorChange: function(model){
            this.model.trigger("change:other_authors",this.model);
            console.log(this.model);
        },
        submit: function (){
            this.$(".submit-proposal-button").button("saving")
            this.model.save();    
        },
        updateAuthors: function() {
            this.$(".other-author-info").width(this.$(".other-author-info").parent().width()-100).toggle("blind",500);
        },
        addAuthor: function (){
            this.model.save({success: function () {
                this.model.trigger("change:other_authors",this.model);    
            }});
        },
        checkSponsorEmail: function (){
            console.log("in checkSponsorEmail");
	    var FSUemailRE = /^(\w+)@fitchburgstate.edu$/;
	    var match = FSUemailRE.exec(this.model.get("sponsor_email"));
	    if(match){
		$.ajax({url: "/conference-submission/users/"+match[1]+"/check",
                    type: "GET", success: this.verifySponsorEmail});
	    } else {
		this.verifySponsorEmail({});
	    }
        },
        verifySponsorEmail: function (data) {
            if(_(data).isEqual({})){
		this.$(".sponsor-email").closest(".form-group").addClass("has-error");
		this.$(".sponsor-email").popover({placement: "top",content: "Email address was not found."}).popover("show");
	    } else {
		this.$(".sponsor-email").closest(".form-group").removeClass("has-error");
		this.$(".sponsor-email").popover("hide");
	    }
	    this.model.set({sponsor_name: data.first_name + " " + data.last_name, sponsor_dept: data.other});
        }
    });


    var AdditionalAuthorsView = Backbone.View.extend({
        initialize: function (){
            _.bindAll(this,"render","updateAuthorList");
            this.model.get("other_authors").on({add: this.render, remove: this.render});

        },
        render: function(){
            var self = this;
            this.$el.html($("#add-author-template").html());
            var ul = this.$(".author-list");
            this.model.get("other_authors").each(function(author){
                ul.append(new AuthorRowView({model: author, authors: self.model.get("other_authors")}).render().el);
            });
            this.addAuthor = new Author();
            this.stickit(this.addAuthor,this.bindings);
            return this;
        },
        bindings: {"input.add-author-field": "falconkey"},
        events: {"click button.add-author-btn": "addAuthor",
                 "click update-author-button": "saveAuthors"
                },
        addAuthor: function (){
            $.ajax({url: "/conference-submission/users/"+this.addAuthor.get("falconkey")+"/check",
                    type: "GET", success: this.updateAuthorList});
        },
        updateAuthorList: function (data) {
            if(_.isEqual(data,{})){ // the email address didn't exist
                console.log("The falconkey does not exist");
		$("input.add-author-field").closest(".form-group").addClass("has-error");
		$("input.add-author-field").popover({content: "The falconkey does not exist"}).popover("show")
		
            } else {
                this.model.get("other_authors").add(new Author(data));
            }
        }
    });

    var AuthorRowView = Backbone.View.extend({
        tagName: "li",
        initialize: function (options){
            this.authors = options.authors;
            _.bindAll(this,"deleteAuthor");
        },
        render: function () {
            this.$el.html($("#add-author-row-template").html());
            this.stickit();
            return this;
        },
        events: {"click button": "deleteAuthor"},
        deleteAuthor: function(){
            this.authors.remove(this.model);
        },
        bindings: {".name": {observe: ['first_name', 'last_name'],
              onGet: function(values) {
                return values[0] + ' ' + values[1];
            }}}
    })

    return ProposalView;

});
define(['backbone', 'underscore','views/FeedbackView','apps/common','models/Author','models/AuthorList', 'stickit','bootstrap','backbone-validation'], 
    function(Backbone, _,FeedbackView,common,Author,AuthorList){
    /**
     *
     * This defines a ProposalView, which shows a single proposal
     */

    var ProposalView = Backbone.View.extend({
    	initialize: function (options) {
            _.bindAll(this,"render","updateAuthors","authorChange");
            //this.model.on("change:other_authors",this.render);
            this.model.get("other_authors").on({add: this.authorChange, remove: this.authorChange});
            this.facultyView = options.facultyView || false;
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
            return this;
    	},
        events: {"click button.submit-proposal-button": "submit",
                 "click button.add-author-button": "updateAuthors",
                 "click button.show-feedback-btn": "showFeedback",
                 "blur .sponsor-email": "checkSponsorEmail",
                 "hidden.bs.modal #additional-author-modal": "addAuthor"},
        bindings: { ".title": "title",
                    ".author-name": "author",
                    ".author-email": "email",
                    ".presentation-type": "type",
                    ".human-subjects": "use_human_subjects",
                    ".animal-subjects": "use_animal_subjects",
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
        authorChange: function(model){
            this.model.trigger("change:other_authors",this.model);
            console.log(this.model);
        },
        submit: function (){
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
            $.ajax({url: "/conference-submission/users/check",
                    type: "POST",
                    data: {email: this.model.get("sponsor_email")},
                    processData: true,
                    success: this.verifySponsorEmail});
        },
        verifySponsorEmail: function (data) {
            console.log(data);
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
        bindings: {"input#add-author-field": "email"},
        events: {"click button#add-author-btn": "addAuthor",
                 "click update-author-button": "saveAuthors"
                },
        addAuthor: function (){
            $.ajax({url: "/conference-submission/users/check",
                    type: "POST",
                    data: {email: this.addAuthor.get("email")},
                    processData: true,
                    success: this.updateAuthorList});
        },
        updateAuthorList: function (data) {
            if(_.isEqual(data,{})){ // the email address didn't exist
                // show an error
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
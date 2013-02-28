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
    		_.bindAll(this,"render","update","saved","savedStatement");
            this.parent = this.options.parent;
            this.facultyView = this.options.facultyView;
    		this.render();
            this.editMode = (this.options.editMode)?this.options.editMode:false;
            this.fieldsToSave = {};
    	},
    	render: function (){
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

                _(this.model.get("other_authors")).each(function(author){
                    console.log(author);
                    this.$(".add-author-row:last").before(_.template($("#author-row").html(),author));
                });
            }
            if(this.model && this.facultyView){
                this.$("#title").html(this.model.get("title"));
                this.$("#pres-type").html(this.model.get("type"));
                this.$("#other-equip").html(this.model.get("other_equipment"));
                this.$("#proposal-text").html(this.model.get("content"));
                this.$("#sponsor-statement").val(this.model.get("sponsor_statement"));
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
                this.parseAuthor();

                this.editMode = false;
                this.model.save(this.fieldsToSave,{success: this.saved, error: this.error});    
                this.fieldsToSave = {};
                this.render();
            } else {
                this.editMode = true;
                this.render();
                return;
            } 
        },
        parseAuthor: function (){
            var newAuthor = {name: $("#author-name").val(), email: $("#author-email").val()};
            if (_(this.fieldsToSave).has("author-name") && _(this.fieldsToSave).has("author-email")) {
                this.fieldsToSave = _(this.fieldsToSave).omit(["author-name","author-email"]);
            }
            if (_(this.fieldsToSave).has("other_authors")) { 
                this.fieldsToSave.other_authors.push(newAuthor);
            }
            else {
                this.fieldsToSave.other_authors=this.model.get("other_authors");
            }
            $($(".add-author-row #author-name")[0]).parent().html(newAuthor.name);
            $($(".add-author-row #author-email")[0]).parent().html(newAuthor.email);
            
            console.log(this.fieldsToSave);


        },
        addAuthor: function (){
            // parse and store any already entered author
            this.parseAuthor();

            this.$(".add-author-row:last").before(_.template($("#add-author-template").html()));
            this.$(".delete-author").on("click",function(evt) {$(evt.target).parent().parent().remove();});
            this.$(".add-author-row input").on("change",this.update);
        },
        saveStatement: function ()
        {
            this.model.set("sponsor_statement", this.$("#sponsor-statement").val());
            this.model.save({sponsor_statement: this.model.get("sponsor_statement")}, {success: this.savedStatement } )
        },
        
        saved: function(model, response, options) {
            this.parent.announce.addMessage("The proposal was updated.");
            console.log(model);
        },
        error: function(model, xhr, options){
            console.log("oops an error!")
            console.log(model);
            console.log(xhr);
            console.log(options);
        }, 
        savedStatement: function (model, response,options){
            this.parent.announce.addMessage("The sponsor statement was saved. ");
            $("li.active a").removeClass("review-needed");
            
        }


    });

    return ProposalView;

});
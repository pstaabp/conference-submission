define(['Backbone', 'underscore'], function(Backbone, _){
    /**
     *
     * This defines a User
     * 
     * @type {*}
     */

    var ProposalView = Backbone.View.extend({
    	template: _.template($("#proposal-view").html()),
    	initialize: function () {
    		_.bindAll(this,"render","update","saved");
            this.parent = this.options.parent;
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
            }
            if (!this.editMode){
                this.$("#submit-proposal-button").html("Edit Proposal");
                this.$("input").prop("disabled",true);
                this.$("select").prop("disabled",true);
                this.$("#proposal-text").prop("disabled",true);
            }
    	},
        events: {"click button#submit-proposal-button": "submit",
                 "change input": "update",
                 "change select": "update",
                 "change #proposal-text": "update"},
        update: function (evt){
            var targ = $(evt.target)
                ,field = targ.data("field")
                ,value = (targ.attr("type")==="checkbox")?targ.prop("checked"):targ.val()
                ,obj = {};

            obj[field] = value;
            _(this.fieldsToSave).extend(obj);
            console.log(this.fieldsToSave);
        },
        submit: function ()
        {
            if (this.editMode){
                this.editMode = false;
                //this.model.set(this.fieldsToSave);
                this.model.save(this.fieldsToSave,{success: this.saved, error: this.error});    
                this.fieldsToSave = {};
                this.render();
            } else {
                this.editMode = true;
                this.render();
                return;
            } 
            

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
        }


    });

    return ProposalView;

});
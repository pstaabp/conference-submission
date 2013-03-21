define(['Backbone', 'underscore'], function(Backbone, _){
    /**
     *
     * This defines a User
     * 
     * @type {*}
     */

    var PersonalInfoView = Backbone.View.extend({
        tagName: "td",
    	template: _.template($("#user-view").html()),
    	initialize: function () {
    		_.bindAll(this,"render","update","saved");
            this.user = this.options.user;
            this.parent = this.options.parent;
            console.log(this.options);
            this.editMode = (this.options.editMode)?this.options.editMode:false;
            this.fieldsToSave = {};
    		this.render();
    	},
    	render: function (){
    		this.$el.html(this.template);
            if(this.user.get("first_name")){this.$("#first-name").val(this.user.get("first_name"));}
            if(this.user.get("last_name")){this.$("#last-name").val(this.user.get("last_name"));}
            if((this.user.get("role")==="student")&&(this.user.get("major"))){
                this.$("#major").val(this.user.get("major"));
            }
            if (!this.editMode){
                this.$("#first-name").prop("disabled",true);
                this.$("#last-name").prop("disabled",true);
                this.$("#major").prop("disabled",true)
                this.$("#save-info").html("Edit Info");

            }
            if(this.user.get("role") !== "student "){
            $(".submit-proposal-row").remove();
        }

    	},
        events: {"click #save-info": "submit",
                 "change input": "update",
                 "change select": "update"},

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
                this.user.save(this.fieldsToSave,{success: this.saved, error: this.error});    
                this.fieldsToSave = {};
                this.render();
            } else {
                this.editMode = true;
                this.render();
                return;
            }
        },
        saved: function(collection, response, options) {
            this.parent.announce.addMessage("The information was updated.");
        }

    });

    return PersonalInfoView;

});
define(['backbone', 'underscore','apps/common'], function(Backbone, _, common){
    /**
     *
     * This defines a User
     * 
     * @type {*}
     */

    var PersonalInfoView = Backbone.View.extend({
    	initialize: function (options) {
            this.model = options.user;
            console.log(common);
            this.fieldsToSave = {};
    		this.render();
    	},
    	render: function (){
    		this.$el.html($("#user-view").html());
            
            if(! _(this.model.get("role")).contains("student")){
                $(".student-major").remove();
            }
            this.stickit();

    	},
        events: {"click #save-info": "submit",
                 "change input": "update",
                 "change select": "update"},
        bindings: {".first-name": "first_name",
                ".last-name": "last_name",
                ".email": "email",
                ".major": {observe: "major", selectOptions: {collection: function() {
                    return common.majors;
                }}}
            }
    });

    return PersonalInfoView;

});
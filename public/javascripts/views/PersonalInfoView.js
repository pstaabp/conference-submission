define(['backbone', 'underscore','apps/common','models/Proposal'], function(Backbone, _, common,Proposal){
    /**
     *
     * This defines a User
     * 
     * @type {*}
     */

    var PersonalInfoView = Backbone.View.extend({
    	initialize: function (options) {
            this.model = options.user;
            this.proposals = options.proposals;
    	    this.render();
	    this.model.on("change",function(_model){
		_model.save();
	    });
    	},
    	render: function (){
    		this.$el.html($("#user-view").html());
            
            if(! _(this.model.get("role")).contains("student")){
                $(".student-major").remove();
            }
            this.stickit();

    	},
        createProposal: function() {
	    // check to make sure that a major is selected. 
	    if(this.model.get("major")){
		this.proposals.add(new Proposal({author: this.model.get("first_name") + " " + this.model.get("last_name"), email: this.model.get("email")}));
	    } else {
		this.$(".major").closest(".form-group").addClass("has-error");
	    }
        },
        events: {"click #save-info": "submit",
                 "change input": "update",
                 "change select": "update",
                 "click button#submit-proposal": "createProposal"},
        bindings: {".first-name": "first_name",
                ".last-name": "last_name",
                ".email": "email",
                ".major": {observe: "major", selectOptions: {collection: function() {
                    return common.majors;
                }, defaultOption: {label: "Select Major...", value: null}}
			  }}
    });

    return PersonalInfoView;

});
define(['backbone','underscore','apps/settings'], function(Backbone,_,settings){
    /**
     *
     * This defines a User
     * 
     * @type {*}
     */

    var User = Backbone.Model.extend({
        defaults: {
            last_name: "",
            first_name: "",
            email: "",
            role: ["student"],
            major: "",
            grad_year: "",
            presented_before: false,
        },
        validation: {
            grad_year: function(value,attr,computedState){
		if(_(this.get("role")).contains("student")){
		    if(! /^201[4-9]$/.test(value)){
			return "Please enter a valid graduation date.";
		    }
		}
	    },
            major: function(value, attr, computedState) {
		if(_(this.get("role")).contains("student")){
		    if(value==="" || value == null){
			return "You must select a major.";
		    }
		}
	    }
        },
        url : function() {
            return '/' + settings.top_dir + 'users/' + this.get("_id");
        },
        idAttribute: "_id"
    });

    return User;
});

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
        },
        validation: {
            grad_year: function(value,attr,computedState){
		            if(_(this.get("role")).contains("student")){
		                if(! /^20[1-2][4-9]$/.test(value)){
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
            console.log(settings.top_dir + '/users/' + this.get("_id"));
            return settings.top_dir + '/users/' + this.get("_id");
        },
        idAttribute: "_id"
    });

    return User;
});

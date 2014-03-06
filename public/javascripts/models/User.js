define(['backbone'], function(Backbone){
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
            role: "student",
            major: "",
            grad_year: "",
            presented_before: false,
        },
        validation: {
                grad_year: { pattern: /^201\d$/, required: true}, 
                major: { required: true}
        },
        url : function() {
            return '/conference-submission/users/' + this.get("_id");
        },
        idAttribute: "_id"
    });

    return User;
});

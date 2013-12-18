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
            major: ""
        },
        url : function() {
            var base = '/conference-submission/users';
            if (this.isNew()) return base;
            return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
        },
        idAttribute: "_id"
    });

    return User;
});

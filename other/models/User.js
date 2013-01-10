define(['Backbone', 'underscore'], function(Backbone, _){
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
            user_id: "",
            email: "",
            type: "student"            
        },
    
        initialize:function () {
    
        }

    });

    return User;
});

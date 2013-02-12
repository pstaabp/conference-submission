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
            role: "student",
            major: ""            
        },
        idAttribute: "_id",
        initialize:function () {
            this.on("change",function(){
                console.log("being updated"); 
        });
        }

    });

    return User;
});

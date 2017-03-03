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
        url : function() {
            console.log(settings.top_dir + '/users/' + this.get("_id"));
            return settings.top_dir + '/users/' + this.get("_id");
        },
        idAttribute: "_id"
    });

    return User;
});

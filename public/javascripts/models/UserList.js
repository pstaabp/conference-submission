define(['backbone','models/User'], function(Backbone, User){
    /**
     *
     * This defines a User
     * 
     * @type {*}
     */

    var UserList = Backbone.Collection.extend({
        model: User,
        url: '/conference-submission/users'

    });

    return UserList;

});

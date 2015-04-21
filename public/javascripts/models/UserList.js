define(['backbone','models/User','apps/settings'], function(Backbone, User,settings){
    /**
     *
     * This defines a User
     * 
     * @type {*}
     */

    var UserList = Backbone.Collection.extend({
        model: User,
        url: '/' + settings.top_dir + '/users'

    });

    return UserList;

});

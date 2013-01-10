define(['Backbone', 'underscore','./User'], function(Backbone, _,User){
    /**
     *
     * This defines a User
     * 
     * @type {*}
     */

    var UserList = Backbone.Collection.extend({
        model: User,
        initialize:function () {
    
        }

    });

    return UserList;

});

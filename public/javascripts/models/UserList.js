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
            _.bindAll(this,"addUser");
            this.on("add",this.addUser);
        },
        url: '/users',
        addUser: function (user){

        }, /*
        parse: function (response){
            console.log(response);
            return response;
        } */


    });

    return UserList;

});

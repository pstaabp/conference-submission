define(['backbone'], function(Backbone){
    /**
     *
     * This defines an Author
     * 
     * @type {*}
     */

    var Author = Backbone.Model.extend({
        defaults: {
            name: "",
            email: "",
        },
        idAttribute: "_id",
    });

    return Author;
});
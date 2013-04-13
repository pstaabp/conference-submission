define(['Backbone', 'underscore'], function(Backbone, _){
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
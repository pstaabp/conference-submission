define(['backbone'], function(Backbone){
    /**
     *
     * This defines an Author
     * 
     * @type {*}
     */

    var Author = Backbone.Model.extend({
        defaults: {
            first_name: "",
            last_name: "",
            email: "",
        },
        idAttribute: "_id",
    });

    return Author;
});
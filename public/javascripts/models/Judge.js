define(['backbone', 'underscore'], function(Backbone, _){
    /**
     *
     * This defines a User
     * 
     * @type {*}
     */
    var Judge = Backbone.Model.extend({
        defaults: {
            name: "",
            email: "",
            type: "",
            presentation: [],
            sessions: []
        },
        idAttribute: "_id",
        initialize:function () {
    
        }

    });

    return Judge;
});
define(['backbone','models/Author'], function(Backbone,Author){
    /**
     *
     * This defines an AuthorList
     * 
     * @type {*}
     */

    var AuthorList = Backbone.Collection.extend({
        model: Author
    });

    return AuthorList;
});
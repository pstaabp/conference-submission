define(['backbone'], function(Backbone){
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
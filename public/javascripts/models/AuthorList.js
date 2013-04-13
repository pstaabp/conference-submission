define(['Backbone', 'underscore'], function(Backbone, _){
    /**
     *
     * This defines an Author
     * 
     * @type {*}
     */

    var AuthorList = Backbone.Collection.extend({
        model: Author
    });

    return AuthorList;
});
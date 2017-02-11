define(['backbone','models/Student'], function(Backbone,Student){
    /**
     *
     * This defines an AuthorList
     *
     * @type {*}
     */

    var AuthorList = Backbone.Collection.extend({
        model: Student
    });

    return AuthorList;
});

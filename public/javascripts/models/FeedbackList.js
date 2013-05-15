define(['Backbone', 'underscore','./Feedback'], function(Backbone, _,Feedback){
    /**
     *
     * This defines an FeedbackScoreList
     * 
     * @type {*}
     */

    var FeedbackList = Backbone.Collection.extend({
        model: Feedback
    });

    return FeedbackList;
});
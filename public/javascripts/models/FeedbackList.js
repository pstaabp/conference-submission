define(['backbone', 'models/Feedback'], function(Backbone, Feedback){
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
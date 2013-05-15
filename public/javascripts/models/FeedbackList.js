define(['Backbone', 'underscore','./Feedback'], function(Backbone, _,Feedback){
    /**
     *
     * This defines an FeedbackScoreList
     * 
     * @type {*}
     */

    var FeedbackList = Backbone.Collection.extend({
        model: Feedback,
        /*parse: function(response,options){
            console.log("in FeedbackList.parse");
            console.log(response);
            return response; 
        },
        initialize: function(models){
            console.log("in FeedbackList.initialize");
            console.log(models);
        }*/
    });

    return FeedbackList;
});
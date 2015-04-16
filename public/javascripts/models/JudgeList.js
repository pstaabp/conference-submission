define(['backbone', 'underscore','./Judge','apps/settings'], function(Backbone, _,Judge,settings){
    /**
     *
     * This defines a Judge
     * 
     * @type {*}
     */

    var JudgeList = Backbone.Collection.extend({
        model: Judge,
        initialize:function () {
    
        },
        url: '/' + settings.top_dir + 'judges',
        /*parse: function (response){
            console.log(response);
            return response;
        } */
    });

    return JudgeList;

});

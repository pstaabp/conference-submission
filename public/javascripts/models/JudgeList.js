define(['backbone', 'underscore','./Judge'], function(Backbone, _,Judge){
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
        url: '/conference-submission/judges',
        /*parse: function (response){
            console.log(response);
            return response;
        } */
    });

    return JudgeList;

});

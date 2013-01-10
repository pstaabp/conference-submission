define(['Backbone', 'underscore'], function(Backbone, _){
    /**
     *
     * This defines a User
     * 
     * @type {*}
     */

    var Proposal = Backbone.Model.extend({
        defaults: {
            proposer_id: "",
            sponsor_id:"",
            type: "",
            title: "",
            accepted: false,
            content: "",
            faculty_statement: ""            
        },
    
        initialize:function () {
    
        }

    });

    return Proposal;
});
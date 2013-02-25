define(['Backbone', 'underscore'], function(Backbone, _){
    /**
     *
     * This defines a User
     * 
     * @type {*}
     */

    var Proposal = Backbone.Model.extend({
        defaults: {
            other_authors: [],
            sponsor_email:"",
            sponsor_name:"",
            sponsor_dept:"",
            type: "",
            title: "",
            accepted: false,
            content: "",
            submit_date: new Date(),
            sponsor_statement: "",
            use_human_subjects: false,
            use_animal_subjects: false           
        },
        idAttribute: "_id",
        initialize:function () {
    
        }

    });

    return Proposal;
});
define(['Backbone', 'underscore'], function(Backbone, _){
    /**
     *
     * This defines a User
     * 
     * @type {*}
     */

    var Proposal = Backbone.Model.extend({
        defaults: {
            author: "",  // change this to main_author:  Author   then get rid of email field below. 
            email: "",
            session: "",
            other_authors: [],
            // A better way to do this is  other_authors: AuthorList which is a collection of Authors.  
            sponsor_email:"",
            sponsor_name:"",
            sponsor_dept:"",

            // perhaps also make the sponsor information its own model as well.  
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
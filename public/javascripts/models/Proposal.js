define(['Backbone', 'underscore','./FeedbackList'], function(Backbone, _,FeedbackList){
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
            use_animal_subjects: false,
            feedback: null           
        },
        idAttribute: "_id",
        parse: function(response,options){
            console.log("in Proposal.parse");
            console.log(response)
            response.feedback = new FeedbackList(response.feedback);
            //console.log(response);
            return response; 
        }


    });

    return Proposal;
});
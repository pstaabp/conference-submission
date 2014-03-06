define(['backbone', 'models/FeedbackList','models/AuthorList'], function(Backbone, FeedbackList,AuthorList){
    var Proposal = Backbone.Model.extend({
        defaults: {
            author: "",  // change this to main_author:  Author   then get rid of email field below. 
            email: "",
            session: "",
            other_authors: new AuthorList(),
            sponsor_email:"",
            sponsor_name:"",
            sponsor_dept:"",
            // perhaps also make the sponsor information its own model as well.  
            type: "",
            title: "",
            accepted: false,
            content: "",
            other_equipment: "",
            submit_date: new Date(),
            sponsor_statement: "",
            use_human_subjects: false,
            use_animal_subjects: false,
            feedback: new FeedbackList()           
        },
        validation: {
            sponsor_email: {required: true},
            email: {required: true},
            content: {required: true},
            title: {required: true},
            type: {required: true}
        },
        idAttribute: "_id",
        parse: function(response,options){
            response.feedback = new FeedbackList(response.feedback);
            response.other_authors = new AuthorList(response.other_authors);
            return response; 
        }
    });

    return Proposal;
});
define(['backbone', 'models/FeedbackList','models/AuthorList','apps/settings'], function(Backbone, FeedbackList,AuthorList,settings){
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
        //url: function(){
        //    return '/' + settings.top_dir + '/proposals/' + this._id;
        //},
        initialize: function (opts) {
            var feedback = (opts && opts.feedback) ? opts.feedback : [];
            this.attributes.feedback = new FeedbackList(feedback);
            var authors = (opts && opts.other_authors) ? opts.other_authors : [];
            this.attributes.other_authors = new FeedbackList(authors);
        },
        parse: function(response,options){
            this.set("feedback",new FeedbackList(response.feedback));
            this.set("other_authors",new AuthorList(response.other_authors));
            return _.omit(response,"feedback","other_authors"); 
        }
    });

    return Proposal;
});

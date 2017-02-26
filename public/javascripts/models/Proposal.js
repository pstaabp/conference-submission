define(['backbone', 'models/FeedbackList','models/UserList','apps/settings','moment'],
  function(Backbone, FeedbackList,UserList,settings,moment){
    var Proposal = Backbone.Model.extend({
        defaults: {
            author_id: "",  // the student_id of the author
            session: "",
            other_authors: new UserList(),
            sponsor_id:"", // the _id of the sponsor.
            type: "",
            title: "",
            accepted: false,
            content: "",
            other_equipment: "",
            submit_date: moment().unix(),
            sponsor_statement: "",
            use_human_subjects: false,
            use_animal_subjects: false,
            feedback: new FeedbackList()
        },
        validation: {
            content: {required: true},
            title: {required: true},
            type: {required: true}
        },
        idAttribute: "_id",
        initialize: function (opts) {
            var feedback = (opts && opts.feedback) ? opts.feedback : [];
            this.attributes.feedback = new FeedbackList(feedback);
            var authors = (opts && opts.other_authors) ? opts.other_authors : [];
            this.attributes.other_authors = new FeedbackList(authors);
        },
        parse: function(response,options){
            this.set("feedback",new FeedbackList(response.feedback));
            this.set("other_authors",new UserList(response.other_authors));
            return _(response).omit(["feedback","other_authors"]);
        },
        url: function(){
          var main = settings.top_dir + '/students/' + this.get("author_id") + '/proposals';
          return (this.get("_id"))?main+"/"+this.get("_id"):main;
        }
    });

    return Proposal;
});

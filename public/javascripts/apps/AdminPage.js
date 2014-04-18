// make sure that require-config.js is loaded before this file. 
define(['module','jquery','backbone', 'underscore','apps/common',
    'models/UserList','models/User','models/ProposalList',
    'models/Proposal',"models/Judge","models/JudgeList","apps/UsersView",  
    'apps/ProposalsView', 'apps/PresentationsView', 'apps/SponsorsView',
    'apps/JudgesView', 'apps/JudgeScheduleView', 'apps/EmailView', 'apps/AllFeedbackView',
    'views/WebPage','bootstrap'],
function(module,$, Backbone, _,common, UserList,User,ProposalList,Proposal,Judge,JudgeList,UsersView, ProposalsView, PresentationsView,
            SponsorsView, JudgesView, JudgeScheduleView, EmailView, AllFeedbackView,WebPage){

// define(['module','jquery','backbone','views/WebPage','models/ProposalList','models/UserList','models/JudgeList','apps/UsersView'],
// function(module,$,Backbone,WebPage,ProposalList,UserList,JudgeList,UsersView){
    var AdminPage = WebPage.extend({
        initialize: function () {
            this.constructor.__super__.initialize.apply(this, {el: this.el});

            _.bindAll(this, 'render','updateUser','syncUser');  // include all functions that need the this object
            var self = this;
            this.proposals = (module.config())? new ProposalList(module.config().proposals,{parse: true}) : new ProposalList();
            this.users = (module.config())? new UserList(module.config().users) : new UserList();
            this.judges = (module.config()) ? new JudgeList(module.config().judges) : new JudgeList();
            this.proposals.on("add",this.render);

            this.proposals.on("sync",function(_prop){
                self.messagePane.addMessage({short:"The proposal for " + _prop.get("author") + 
					     " was saved.", type: "success"});
            });

           this.views = {
               usersView : new UsersView({users: this.users, rowTemplate: "#user-row-template", el: $("#users")}),
               proposalsView : new ProposalsView({users: this.users,proposals: this.proposals, 
                                   judges: this.judges, el: $("#proposals")}),
               presentationsView: new PresentationsView({parent: this, el: $("#presentations")}),
                judgesView : new JudgesView({parent: this, el: $("#judges")}),
                judgeScheduleView : new JudgeScheduleView({proposals: this.proposals, judges: this.judges, el: $("#judge-schedule")}),
                emailView : new EmailView({users: this.users, proposals: this.proposals, judges: this.judges, el: $("#emails")}),
                feedbackView: new AllFeedbackView({proposals: this.proposals, judges: this.judges, el: $("#feedback")}),
                sponsorsView: new SponsorsView({users: this.users, el: $("#sponsors-view")})
            }

            this.users.on({"change": this.updateUser,"sync": this.syncUser});

            this.render();
        },
        events: {"shown.bs.tab #admin-tabs a[data-toggle='tab']": "changeView"},
        render: function () {
            this.constructor.__super__.render.apply(this);  // Call  WebPage.render(); 

            var userNames = _(this.users.sortBy(function(user) { return user.get("last_name");}))
                        .map(function(user) { return {id: user.get("_id"), name: user.get("first_name") + " " + user.get("last_name")}});

            $("#act-as-user").removeAttr("style").html(_($("#act-as-user-template").html()).template({users: userNames}));

            this.views.usersView.render();
        },
        actAsUser: function(evt){
            console.log($(evt.target).data("id"));
        },
        changeView: function(evt){
            var viewName =$(evt.target).data("view");
            this.views[viewName].render();
            if(viewName==="postersView"){
                this.setSortable();
            }
        },
        updateUser: function(_user){
            _user.changingAttributes=_.pick(_user._previousAttributes,_.keys(_user.changed));
            _user.save();
        },
        syncUser: function(_user){
            var self = this;
            _(_.keys(_user.changingAttributes||{})).each(function(key){
                self.messagePane.addMessage({type: "success", 
                    short: "User Saved",
                    text: "Property " + key + " for " + _user.get("first_name") + " " + _user.get("last_name") + " has "
                        + "changed from " + _user.changingAttributes[key] + " to " + _user.get(key) + "."});
            });  
        }
    });


    new AdminPage({el: $("#container")});
});
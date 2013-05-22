//require config
require.config({
    paths: {
        "Backbone":             "../vendor/backbone-0.9.9",
        "backbone-validation":  "../vendor/backbone-validation",
        "underscore":           "../vendor/underscore",
        "jquery":               "../vendor/jquery",
        "jquery-truncate":      "../vendor/jquery.truncate.min",
        "bootstrap":            "../vendor/bootstrap/js/bootstrap",
        "XDate":                "../vendor/xdate",
        "jquery-ui-effect":     "../vendor/jquery-ui/ui/jquery.ui.effect",
        "jquery-ui-blind":      "../vendor/jquery-ui/ui/jquery.ui.effect-blind",
        "stickit":              "../vendor/backbone-stickit/backbone.stickit"

    },
    urlArgs: "bust=" +  (new Date()).getTime(),
    waitSeconds: 15,
    shim: {
        'underscore': { exports: '_' },
        'Backbone': { deps: ['underscore', 'jquery'], exports: 'Backbone'},
        'bootstrap':['jquery'],
        'backbone-validation': ['Backbone'],
        'jquery-ui-effect': ['jquery'],
        'jquery-ui-blind': ['jquery-ui-effect'],
        'jquery-truncate': ['jquery'],
        'XDate':{ exports: 'XDate'},
        'stickit': ['Backbone','jquery']
    }
});

require(['Backbone', 'underscore', './globals',
    '../models/UserList','../models/User','../models/ProposalList',
    '../models/Proposal',"../models/Judge","../models/JudgeList","./UsersView",  
    './ProposalsView', './PresentationsView',
    './JudgesView', './JudgeScheduleView', './EmailView', './AllFeedbackView',
    '../views/EditableCell', '../views/WebPage',
    './common','bootstrap',"backbone-validation"],
function(Backbone, _, globals, UserList,User,ProposalList,Proposal,Judge,JudgeList,UsersView, ProposalsView, PresentationsView,
            JudgesView, JudgeScheduleView, EmailView, AllFeedbackView, EditableCell,WebPage,common){

    var AdminPage = WebPage.extend({
        initialize: function () {
            this.constructor.__super__.initialize.apply(this, {el: this.el});

            _.bindAll(this, 'render');  // include all functions that need the this object
            var self = this;
            
            this.proposals = (globals.proposals)? new ProposalList(globals.proposals,{parse: true}) : new ProposalList();
            this.users = (globals.users)? new UserList(globals.users) : new UserList();
            this.judges = (globals.judges) ? new JudgeList(globals.judges) : new JudgeList();
            
            //this.users.fetch({success: this.usersFetched});
            this.proposals.on("add",this.render);

            this.proposals.on("change",function(theChange){
                var p = (_(theChange.changed).pairs())[0];
                self.announce.addMessage("The " + p[0] + " changed to " + p[1]);
            });

           this.views = {
                usersView : new UsersView({parent: this, rowTemplate: "#user-row-template", el: $("#users")}),
                proposalsView : new ProposalsView({parent: this, proposals: this.proposals, 
                                    judges: this.judges, el: $("#proposals")}),
                presentationsView: new PresentationsView({parent: this, el: $("#presentations")}),
                judgesView : new JudgesView({parent: this, el: $("#judges")}),
                judgeScheduleView : new JudgeScheduleView({parent: this, el: $("#judge-schedule")}),
                emailView : new EmailView({users: this.users, proposals: this.proposals, judges: this.judges, el: $("#emails")}),
                feedbackView: new AllFeedbackView({proposals: this.proposals, el: $("#feedback")})
            }


            this.render();
 

            
            $("#logout").on("click",common.logout);   

        },
        events: {"shown #admin-tabs a[data-toggle='tab']": "changeView"},
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
            
    });


    new AdminPage({el: $("#container")});
});
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
        "jquery-ui":            "../vendor/jquery-ui-1.10.1.custom/js/jquery-ui-1.10.1.custom.min",
        "stickit":              "../vendor/backbone-stickit/backbone.stickit"

    },
    urlArgs: "bust=" +  (new Date()).getTime(),
    waitSeconds: 15,
    shim: {
        'underscore': { exports: '_' },
        'Backbone': { deps: ['underscore', 'jquery'], exports: 'Backbone'},
        'bootstrap':['jquery'],
        'backbone-validation': ['Backbone'],
        'jquery-ui': ['jquery'],
        'jquery-truncate': ['jquery'],
        'XDate':{ exports: 'XDate'},
        'stickit': ['Backbone','jquery']
    }
});

require(['Backbone', 'underscore',
    '../models/UserList','../models/User','../models/ProposalList',
    '../models/Proposal',"../models/Judge","../models/JudgeList","./UsersView",  
    './PostersView', './ProposalsView', './JudgesView', './JudgeScheduleView', './EmailView',
    '../views/EditableCell', '../views/WebPage',
    './common','bootstrap','jquery-ui','jquery-truncate','stickit'],
function(Backbone, _, UserList,User,ProposalList,Proposal,Judge,JudgeList,UsersView, PostersView, ProposalsView,
            JudgesView, JudgeScheduleView, EmailView, EditableCell,WebPage,common){

    var AdminPage = WebPage.extend({
        initialize: function () {
            this.constructor.__super__.initialize.apply(this, {el: this.el});

            _.bindAll(this, 'render','usersFetched','proposalsFetched','getProposals',
                            'getOrals','getPosters', 'actAsUser','get2DArt','get3DArt','getVideos');  // include all functions that need the this object
            var self = this;
            
            this.proposals = new ProposalList();
            this.users = new UserList();
            this.judges = new JudgeList();
            
            this.users.fetch({success: this.usersFetched});
            this.proposals.on("add",this.render);

            this.proposals.on("change",function(theChange){
                var p = (_(theChange.changed).pairs())[0];
                self.announce.addMessage("The " + p[0] + " changed to " + p[1]);
            });


            
            $("#logout").on("click",common.logout);   

        },
        events: {"shown a[data-toggle='tab']": "changeView"},
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
        setSortable: function (){
            var self = this; 
            $("#posters .poster-table").sortable({ 
                axis: "y",
                items: "tr.poster-row",
                // handle: "tr.poster-row button",
                update: function( event, ui ) {
                  console.log("I was sorted!!");
                  self.$("#posters .poster-row").each(function(i,prop){
                    var cid = $(prop).attr("id");
                    var updateProp = self.proposals.get(cid);
                    var sess = "P" + ( (i<9)? "0"+(i+1): ""+(i+1));
                    console.log(cid);
                    if (sess !== updateProp.get("session")){

                        updateProp.set("session",sess);
                        updateProp.save();

                        $(prop).find(".session .srv-value").text(sess);
                    }
              });
        }});
        },
        usersFetched: function(collection, response, options) {
            console.log("Users Fetched");
            this.proposals.fetch({success: this.proposalsFetched});

        },
        judgesFetched: function(collection, response, options) {
            console.log("Judges Fetched");
        },
        proposalsFetched: function(collection, response, options) {          
            
            console.log("proposalsFetched");

            this.judges.fetch({success: this.judgesFetched});
            

            this.views = {
                usersView : new UsersView({parent: this, type: "users", headerTemplate: "#users-template"
                                    , rowTemplate: "#user-row-template", el: $("#users")}),
                studentsView : new UsersView({parent: this, type: "students", el: $("#students"),
                                    headerTemplate: "#students-template", rowTemplate: "#student-row-template"}),
                sponsorsView : new UsersView({parent: this, type: "sponsors", el: $("#sponsors"),
                                    headerTemplate: "#sponsors-template", rowTemplate: "#sponsor-row-template"}),
                proposalsView : new ProposalsView({parent: this, type: "allProposals", el: $("#proposals")}),
                oralsView : new ProposalsView({parent: this, type: "orals", el: $("#oral-presentations")}),
                postersView : new PostersView({parent: this, type: "posters", el: $("#posters")}),
                scheduleView : new OralPresentationScheduleView({parent: this, el: $("#schedule")}),
                art2DView : new ProposalsView({parent: this, type: "2dart", el: $("#art-2d")}),
                art3DView : new ProposalsView({parent: this, type: "3dart", el: $("#art-3d")}),
                videosView : new ProposalsView({parent: this, type: "videos", el: $("#video")}),
                judgesView : new JudgesView({parent: this, el: $("#judges")}),
                judgeScheduleView : new JudgeScheduleView({parent: this, el: $("#judge-schedule")}),
                emailView : new EmailView({parent: this, el: $("#emails")})
            }


            this.render();
        },
        // This function parses the proposal table and makes each item editable
        getProposals: function () {
            return this.proposals.models;
        },
        getPosters: function() {
            return this.proposals.filter(function(prop){return prop.get("type")==="Poster Presentation"});
        },
        getOrals: function () {
            return this.proposals.filter(function(prop){return prop.get("type")==="Oral Presentation"});
        }, 
        get2DArt: function(){
            return this.proposals.filter(function(prop){return prop.get("type")==="2D Art"}); 
        },
        get3DArt: function(){
            return this.proposals.filter(function(prop){return prop.get("type")==="2D Art"}); 
        },
        getVideos: function(){
            return this.proposals.filter(function(prop){return prop.get("type")==="Video"}); 
        }

    });

    


    var OralPresentationScheduleView = Backbone.View.extend({
        rowTemplate: _.template($("#proposal-row-template").html()),
        initialize: function(){
            _.bindAll(this,"render","reorder");
            this.parent = this.options.parent;

        },
        render: function (){
            var sessionNames = "ABCDEFGHIJKL";

            this.$el.html(_.template($("#schedule-template").html(),{numSessions: 12 }));
            
            var re = /OP-(\d+)-(\d+)/;

            _(this.parent.getOrals()).each(function(prop){
                var matches = prop.get("session").match(re);
                if(matches){
                    this.$("#col" + matches[1]).append(_.template($("#oral-presentation-template").html(),_.extend(prop.attributes, {cid: prop.cid})));
                } else {
                    $("#extra-ops").append(_.template($("#oral-presentation-template").html(),_.extend(prop.attributes, {cid: prop.cid})));
                }


            });

            $(".oral-present-col").sortable({ 
                    connectWith: ".oral-present-col", 
                    placeholder: "ui-state-highlight",
                    stop: this.reorder});

            this.$(".op-title").truncate();

        },
        reorder: function (){
            var self = this; 
            this.$("li").each(function(i,item){
                var cid = $(item).attr("id")
                var proposal = self.parent.proposals.find(function(prop) { return prop.cid===cid;})
                var list = parseInt($(item).parent().attr("id").split("col")[1]); 
                proposal.set("session","OP-"+list + "-"+$(item).index());
                proposal.save();
            })
        }
    });

    new AdminPage({el: $("#container")});
});
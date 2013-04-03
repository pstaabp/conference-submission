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
        "jquery-ui":            "../vendor/jquery-ui-1.10.1.custom/js/jquery-ui-1.10.1.custom.min"

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
        'XDate':{ exports: 'XDate'}
    }
});

require(['Backbone', 'underscore',
    '../models/UserList','../models/User','../models/ProposalList',
    '../models/Proposal',"../models/Judge","../models/JudgeList",'../views/EditableCell', '../views/WebPage',
    './common','bootstrap','jquery-ui','jquery-truncate'],
function(Backbone, _, UserList,User,ProposalList,Proposal,Judge,JudgeList,EditableCell,WebPage,common){

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
            console.log(self.$("#posters .proposal-row"));
            $("#poster-table-header").sortable({ items: "tr.proposal-row",
                update: function( event, ui ) {
                  console.log("I was sorted!!");
                  self.$("#posters .proposal-row").each(function(i,prop){
                    var cid = $(prop).attr("id");
                    var updateProp = self.proposals.get(cid);
                    var sess = "P" + ( (i<9)? "0"+(i+1): ""+i);
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
                postersView : new ProposalsView({parent: this, type: "posters", el: $("#posters")}),
                scheduleView : new OralPresentationScheduleView({parent: this, el: $("#schedule")}),
                art2DView : new ProposalsView({parent: this, type: "2dart", el: $("#art-2d")}),
                art3DView : new ProposalsView({parent: this, type: "3dart", el: $("#art-3d")}),
                videosView : new ProposalsView({parent: this, type: "videos", el: $("#video")}),
                emailsView : new EmailsView({parent: this, el: $("#emails")})
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

    var UsersView = Backbone.View.extend({
        initialize: function(){
            _.bindAll(this, "render");
            this.parent = this.options.parent;
            this.type= this.options.type;
            this.headerTemplate = this.options.headerTemplate;
            this.rowTemplate = this.options.rowTemplate;
            this.parent.users.on("remove",this.render);
        },
        render: function(){
            var self = this
              , users;
            switch(this.type){
                case "users": 
                    users = this.parent.users.models;
                    break;
                case "students":
                    users = this.parent.users.filter(function(user) {return user.get("role")==="student"});
                    
                    break;
                case "sponsors":
                    users = this.parent.users.filter(function(user){return user.get("role")==="faculty"});
                    break;
            }

            this.$el.html(_.template($(this.headerTemplate).html(),{numUsers: users.length}));
            var userTable = this.$(".user-table tbody");
            _(users).each(function(_user){
                var props;
                switch(self.type){
                    case "users":
                        props = []
                        break;
                    case "students":
                        props = self.parent.proposals.filter(function(proposal){ return proposal.get("email")===_user.get("email"); });
                        break;
                    case "sponsors":
                        props = self.parent.proposals.filter(function(proposal){ return proposal.get("sponsor_email")===_user.get("email"); });
                        break;
                    }
                userTable.append( (new UserRowView({model: _user, template: self.rowTemplate, proposals: props})).render().el);
            });

            this.$("a.showProposal").truncate()
        },
        events: {"click a.showProposal": "showProposal"},
        showProposal: function (evt){
            var proposal = this.parent.proposals.get($(evt.target).data("id"));  
            
            $(".proposal-modal").html(_.template($("#proposal-view-modal").html(),proposal.attributes));
            $(".proposal-modal .modal").modal(); 
            $(".proposal-modal .modal").width($(window).width()*0.75);
            $(".proposal-modal .modal").css("margin-left", -1*$(".proposal-modal .modal").width()/2 + "px");

        }

    });

    var UserRowView = Backbone.View.extend({
        tagName: "tr",
        initialize: function() {
            _.bindAll(this, "render");
            this.template = this.options.template;
            this.proposals = this.options.proposals;
        },
        render: function (){
            var templateVars = {proposals: this.proposals};
            _.extend(templateVars,this.model.attributes);
            this.$el.html(_.template($(this.template).html(),templateVars));
            return this;
        },
        events: {"click .delete-user": "deleteUser"},
        deleteUser: function (){
            var del = confirm("Do you wish to delete the user: " + this.model.get("first_name") + " " 
                                    + this.model.get("last_name") +"?");
            if (del){
                this.model.destroy();
            }
        }

    });

    var ProposalsView = Backbone.View.extend({
        initialize: function(){
            _.bindAll(this, "render");
            this.template = $("#proposals-template").html();
            this.parent = this.options.parent;
            this.type = this.options.type;
            this.getProposals = {
                "allProposals": this.parent.getProposals, "orals": this.parent.getOrals, 
                "posters": this.parent.getPosters, "2dart": this.parent.get2DArt, "3dart": this.parent.get3DArt,
                "videos": this.parent.getVideos
            };

            this.headers = {allProposals: "Proposals", orals: "Oral Presentations", posters: "Poster Presentations",
                            "2dart": "Two-Dimensional Art", "3dart": "Three-Dimensional Art", videos: "Videos"};

            this.parent.proposals.on("remove",this.render);
        },
        render: function(){
            var self = this;
            var proposals = this.getProposals[this.type].apply();
            this.$el.html(_.template(this.template,{propHeader: this.headers[this.type], number: proposals.length}));
            _(proposals).each(function(proposal){
                self.$(".proposal-table > tbody").append((new ProposalRowView({model: proposal})).render().el);
            });
        }
    });


    var ProposalRowView = Backbone.View.extend({
        tagName: "tr",
        className: "proposal-row",
        initialize: function(){
            _.bindAll(this,"render","deleteProposal","changeAcceptedStatus");

        },
        render: function() {
            var self = this;
            if(!this.model) { return this; }

            var subDate = (new XDate(this.model.get("submit_date"))).toLocaleDateString();
            var subTime = (new XDate(this.model.get("submit_date"))).toLocaleTimeString();

            this.$el.html(_.template($("#proposal-row-template").html(),_.extend(this.model.attributes,{date: subDate, time: subTime})));
            this.$el.attr("id",this.model.cid);
            this.$(".accepted-checkbox").prop("checked",this.model.get("accepted"));
            if(this.model.get("accepted")){this.$("table").removeClass("not-accepted");}
            _(common.proposalParams).each(function(prop){
                self.$(prop.class).html((new EditableCell({model: self.model, property: prop.field})).render().el);    
            })
            return this;
        },
        events: {"click .delete-proposal": "deleteProposal",
                 "dblclick .proposal-content": "editContent",
                 "change .edit-content": "saveContent",
                 "focusout .edit-content": "closeContent",
                 "change input[type='checkbox']": "changeAcceptedStatus"},

        deleteProposal: function(){
            var del = confirm("Do you wish to delete the proposal " + this.model.get("title") +"?");
            if(del){
                this.model.destroy();
            }
        },
        editContent: function(){
            var self = this;
            var content = this.$(".proposal-content").text();
            this.$(".proposal-content").html("<textarea rows='10' class='edit-content'>" + content + "</textarea>");
            this.$(".edit-content").focus();
            this.delegateEvents();
        },
        saveContent: function(){
            var newContent = this.$(".edit-content").val();
            this.model.set({content: newContent});
            this.model.save();
        
        },
        closeContent: function(){
            var content = this.$(".edit-content").val();
            this.$(".proposal-content").html(content);
        },

        changeAcceptedStatus: function(evt){
            this.model.set({accepted: $(evt.target).prop("checked")});
            this.model.save();
            if($(evt.target).prop("checked")){
                this.$("table").removeClass("not-accepted");
            } else {
                this.$("table").addClass("not-accepted");
            }
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
                                receive: this.reorder});

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

    var EmailsView = Backbone.View.extend({
        initialize: function () {
            _.bindAll(this,"render");
            this.parent = this.options.parent;
        },
        render: function() {
            var _allUsers = this.parent.users.pluck("email");
            var _otherAuthors = _.chain(this.parent.getProposals()).pluck("attributes").pluck("other_authors")
                                    .flatten().pluck("email").value(); 
            var _allParticipants = _.unique(_allUsers,_otherAuthors).join(", ");
            var _oralPresenters = _.chain(this.parent.getOrals()).pluck("attributes").pluck("email").unique().value();
            var _oralPresentersOther = _.chain(this.parent.getOrals()).pluck("attributes").pluck("other_authors")
                                            .flatten().pluck("email").union(_oralPresenters).value().join(", ");
            var _posterPresenters = _.chain(this.parent.getPosters()).pluck("attributes").pluck("email").unique().value().join(", ");
            var _posterPresentersOther = _.chain(this.parent.getOrals()).pluck("attributes").pluck("other_authors")
                                            .flatten().pluck("email").union(_posterPresenters).value();
            var _missingNames = _(this.parent.users.filter(function(user) { return user.get("first_name")==="";}))
                                    .chain().pluck("attributes").pluck("email").unique().value().join(", ");
            var _sponsors = _.chain(this.parent.getProposals()).pluck("attributes").pluck("sponsor_email").unique().value().join(", ");

            var _missing_statments = _.chain(this.parent.getProposals()).filter(function(proposal){
                                            return proposal.get("sponsor_statement")==="";
                                        }).pluck("attributes").pluck("sponsor_email").unique().value().join(", ");
            var _judges = _(this.parent.judges.pluck("email")).unique().join(", ");


            this.$el.html(_.template($("#emails-template").html(),{allParticipants: _allParticipants,
                    oralPresenters: _oralPresentersOther, posterPresenters: _posterPresentersOther,
                    missingNames: _missingNames, sponsors: _sponsors, missing_statements: _missing_statments,
                    judges: _judges}));

        }
    })

    new AdminPage({el: $("#container")});
});
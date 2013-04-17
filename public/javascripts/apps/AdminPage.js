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
    '../models/Proposal',"../models/Judge","../models/JudgeList",'../views/EditableCell', '../views/WebPage',
    './common','bootstrap','jquery-ui','jquery-truncate','stickit'],
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

    var PostersView = Backbone.View.extend({
        initialize: function(){
            _.bindAll(this, "render");
            this.rowTemplate =  _.template($("#poster-row-template").html());
            
        },
        render: function (){
            var self = this;
            this.proposals = this.options.parent.getPosters();
            this.$el.html($("#poster-table-template").html());
            var posterTable = this.$(".poster-table tbody");
            _(this.proposals).each(function(proposal){
                posterTable.append((new PosterRowView({model: proposal, parent: self})).render().el);
            })
        }
    });

    var PosterRowView = Backbone.View.extend({
        tagName: "tr",
        className: "poster-row",
        initialize: function (){
            _.bindAll(this, "render","showProposal");
            this.parent=this.options.parent;
            this.model.on("change:session",this.render);
        },
        render: function(){
            this.$el.html(this.parent.rowTemplate(this.model));
            this.$el.attr("id",this.model.cid);
            return this;
        },
        events: {"click a.showProposal": "showProposal"},
        showProposal: function (evt){
            $(".proposal-modal").html(_.template($("#proposal-view-modal").html(),this.model.attributes));
            $(".proposal-modal .modal").modal(); 
            $(".proposal-modal .modal").width($(window).width()*0.75);
            $(".proposal-modal .modal").css("margin-left", -1*$(".proposal-modal .modal").width()/2 + "px");

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

    var JudgesView = Backbone.View.extend({
        initialize: function () {
            _.bindAll(this,"render");
            this.parent = this.options.parent;
            this.rowTemplate = _.template($("#judges-row-template").html());
            this.parent.judges.on("remove", this.render);
        },
        render: function() {
            var self = this; 
            this.$el.html($("#judges-table-template").html());
            var judgesTable = this.$(".judges-table tbody");
            this.parent.judges.each(function(judge){
                judgesTable.append((new JudgesRowView({model: judge, rowTemplate: self.rowTemplate})).render().el);
            })
        }
    });

    var JudgesRowView = Backbone.View.extend({
        tagName: "tr",
        initialize: function () {
            _.bindAll(this,"render","save","deleteJudge");
            this.rowTemplate = this.options.rowTemplate;
            this.model.on("change",function(model) {console.log(model)});

        },
        render: function() {
            this.$el.html(this.rowTemplate());
            this.$(".name").on("change",function(evt){
                console.log(evt);
            })
            this.stickit();
            return this;
        },
        events: {"click .delete-judge": "deleteJudge",
                "blur td.editable": "save"},
        bindings: {
            ".name": "name",
            ".email": "email", 
            ".presentation": { observe: "presentation",
                selectOptions: {
                    collection: [{name: "Biology", value: "Biology"}, 
                                {name:"Business Administration", value: "Business_Administration"},
                                {name: "Communications Media", value: "Communications_Media"},
                                {name: "Computer Information Systems", value: "Computer_Information_Systems"},
                                {name: "Computer Science", value: "Computer_Science"},
                                {name: "Criminal Justice", value: "Criminal_Justice"},
                                {name: "Early Childhood Education", value: "Early_Childhood_Education"},
                                {name: "Earth Systems Science", value: "Earth_Systems_Science"},
                                {name: "Economics", value: "Economics"},
                                {name: "Elementary Education", value: "Elementary_Education"},
                                {name: "English Studies", value: "English_Studies"},
                                {name: "Exercise and Sports Science", value: "Exercise_and_Sports_Science"},
                                {name: "Game Design", value: "Game_Design"},
                                {name: "Geography", value: "Geography"},
                                {name: "History", value: "History"},
                                {name: "Human Services", value: "Human_Services"},
                                {name: "Industrial Technology", value: "Industrial_Technology"},
                                {name: "Mathematics", value: "Mathematics"},
                                {name: "Middle School Education", value: "Middle_School_Education"},
                                {name: "Nursing", value: "Nursing"},
                                {name: "Occupational/Vocational Education", value: "Occupational_Vocational_Education"},
                                {name: "Political Science", value: "Political_Science"},
                                {name: "Psychological Science", value: "Psychological_Science"},
                                {name: "Sociology", value: "Sociology"},
                                {name: "Special Education", value: "Special_Education"},
                                {name: "Technology Education",value: "Technology_Education"}],
                    labelPath: "name",
                    valuePath: "value"
                }
            },
            ".type": {observe: "type",
                selectOptions: {
                    collection: ["oral","poster","either"]
                }
            }
        },
        deleteJudge: function() { 
            var del = confirm("Do you want to delete the judge " + this.model.get("name") + "?");
            if(del){
               this.model.destroy();
           }
       },
       save: function (){ 
            console.log("saving");
            console.log(this.model.attributes);
            this.model.save();
        }
    });

    var JudgeScheduleView = Backbone.View.extend({
        initialize: function(){
            _.bindAll(this,"render","showPosters","showOrals");
            this.parent = this.options.parent;
        },
        render: function () {
            this.$(".posters,.orals").css("display","none");
            var viewType =  $("input[name='jsview']:checked").val();
            this.$("."+viewType).css("display","block");

            if(viewType==="orals") {this.showOrals();}
            else if (viewType==="posters"){this.showPosters();}
        },
        events: {"change input[name='jsview']": "render",
                "click .remove-judge": "removeJudgeFromSession"},
        removeJudgeFromSession: function(evt){
            
            var judgeID = $(evt.target).data("judgeid");
            var judge= this.parent.judges.get(judgeID);
            var sessions = judge.get("session");
            var sessionName = $(evt.target).data("session");
            judge.set({session: _(sessions).without(sessionName)});

            judge.save();
            this.render();
        },
        showPosters: function () {
            var self = this;
            // Need to empty all of the ul's in the table. 

            this.$("ul").html("");

            var posterTemplate = _.template($("#judges-schedule-poster-row").html());
            var judgeTemplate = _.template($("#judges-schedule-row-template").html());

            var judgeListCell = this.$("#judge-list-poster"); 
            var judges = this.parent.judges.filter(function(judge){ return (judge.get("type")==="poster") || (judge.get("type")==="either"); });

            var sessionNames = "ABCDEFGHIJKL";

            var posters = _(this.parent.getPosters()).sortBy(function(poster){ return poster.get("session");});

            for(var i=0; i<posters.length; i+=4){
                var rowString = "<tr>";
                for(var j=0; j<4;j++){
                    if(i+j>=posters.length) { break;}
                    rowString += posterTemplate(posters[i+j].attributes);
                }
                rowString += "</tr>";
                self.$("div.posters table tbody").append(rowString);
            }

            // Add the judges to each session

            _(posters).each(function(poster,i){
                var _sessionName = (i)<9?"P0"+(i+1):"P"+(i+1);
                var sessionJudges = _(judges).filter(function(judge) { return _(judge.get("session")).contains(_sessionName)});
               
                _(sessionJudges).each(function(judge) {
                    var obj = {};
                    _.extend(obj,judge.attributes,{cid: judge.cid, removable: true, sessionName: _sessionName});
                    $(".poster-judge[data-session='" + _sessionName + "'] ul").append(judgeTemplate(obj));
                });
            });


            this.$("#judge-list-poster").parent().attr("rowspan",this.parent.getPosters().length+1);
            _(judges).each(function(judge){  
                var obj = {};
                _.extend(obj,judge.attributes,{cid: judge.cid,removable: false});
                judgeListCell.append(judgeTemplate(obj));
            });


            this.$(".judge-popover").popover().draggable({revert: true});
            this.$(".poster-judge").droppable({
                hoverClass: "ui-session-highlight",
                scroll: true,
                helper: "clone",
                drop: function( event, ui ) {  
                    console.log("dropped"); 
                    $(ui.draggable).removeClass("no-sessions"); 
                    
                    var _sessionName = $(event.target).data("session");
                    var judge = self.parent.judges.get($(ui.draggable).data("judgeid"));
                    var _sessions = judge.get("session");
                    _sessions.push(_sessionName);

                    judge.set({session: _sessions});
                    judge.save();

                    var obj = {};
                    _.extend(obj,judge.attributes,{cid: judge.cid,removable: true, sessionName: _sessionName});
                    $(event.target).children("ul").append(judgeTemplate(obj));
                }
            });


        },
        showOrals: function (){
            var self = this;

            // Need to empty all of the ul's in the table. 

            this.$("ul").html("");

            var template = _.template($("#judges-schedule-row-template").html());
            var judgeListCell = this.$("#judge-list-oral"); 
            var judges = this.parent.judges.filter(function(judge){ return (judge.get("type")==="oral") || (judge.get("type")==="either"); });

            var sessionNames = "ABCDEFGHIJKL";

            _(judges).each(function(judge){  
                var obj = {};
                _.extend(obj,judge.attributes,{cid: judge.cid,removable: false});
                judgeListCell.append(template(obj));
                for(var i =0; i<sessionNames.length;i++){
                    if (_(judge.get("session")).contains(sessionNames[i])) {
                        obj["removable"]=true;
                        obj["sessionName"] = sessionNames[i];
                        self.$("#"+sessionNames[i]+ " ul").append(template(obj));
                    }
                }
            });





            this.$(".judge-popover").popover().draggable({revert: true});
            this.$(".session").droppable({
                hoverClass: "ui-session-highlight",
                drop: function( event, ui ) {  
                    console.log("dropped"); 
                    var _sessionName = $(ui.draggable).data("session"); 
                    var judge = self.parent.judges.get($(ui.draggable).data("judgeid"));
                    var _sessions = judge.get("session");
                    _sessions.push($(event.target).attr("id"));
                    judge.set({session: _sessions});
                    judge.save();
                    var obj = {};
                    _.extend(obj,judge.attributes,{cid: judge.cid, removable: true, sessionName: _sessionName});
                    $(event.target).children("ul").append(template(obj));
                    $(ui.draggable).removeClass("no-sessions");   

                }
            });
        }
    })

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
            var _posterPresentersOther = _.chain(this.parent.getPosters()).pluck("attributes").pluck("other_authors")
                                            .flatten().pluck("email").union(_posterPresenters).value();

            var _oralSponsors = _.chain(this.parent.getOrals()).pluck("attributes").pluck("sponsor_email").unique().value().join(", ");
            var _posterSponsors = _.chain(this.parent.getPosters()).pluck("attributes").pluck("sponsor_email").unique().value().join(", ");

            var _missingNames = _(this.parent.users.filter(function(user) { return user.get("first_name")==="";}))
                                    .chain().pluck("attributes").pluck("email").unique().value().join(", ");
            var _sponsors = _.chain(this.parent.getProposals()).pluck("attributes").pluck("sponsor_email").unique().value().join(", ");

            var _missing_statments = _.chain(this.parent.getProposals()).filter(function(proposal){
                                            return proposal.get("sponsor_statement")==="";
                                        }).pluck("attributes").pluck("sponsor_email").unique().value().join(", ");

            var _acceptedPosters = _.chain(this.parent.getPosters()).filter(function(proposal) { 
                    return proposal.get("accepted")===true;}).pluck("attributes").pluck("email").value();


            var _acceptedPostersOther = _.chain(this.parent.getPosters()).filter(function(p){ 
                    return p.get("accepted")===true;}).pluck("attributes").pluck("other_authors")
                            .flatten().pluck("email").union(_acceptedPosters).value().join(", ");

            var _acceptedOrals = _.chain(this.parent.getOrals()).filter(function(proposal) { 
                    return proposal.get("accepted")===true;}).pluck("attributes").pluck("email").value();


            var _acceptedOralsOther = _.chain(this.parent.getOrals()).filter(function(p){ 
                    return p.get("accepted")===true;}).pluck("attributes").pluck("other_authors")
                            .flatten().pluck("email").union(_acceptedOrals).value().join(", ");


            var _judges = _(this.parent.judges.pluck("email")).unique().join(", ");


            this.$el.html(_.template($("#emails-template").html(),{allParticipants: _allParticipants,
                    oralPresenters: _oralPresentersOther, posterPresenters: _posterPresentersOther,
                    missingNames: _missingNames, sponsors: _sponsors, missing_statements: _missing_statments,
                    acceptedPosters: _acceptedPostersOther, acceptedOrals: _acceptedOralsOther, judges: _judges,
                    oralSponsors: _oralSponsors, posterSponsors: _posterSponsors}));

        }
    })

    new AdminPage({el: $("#container")});
});
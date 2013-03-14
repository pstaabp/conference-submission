//require config
require.config({
    paths: {
        "Backbone":             "../vendor/backbone-0.9.9",
        "backbone-validation":  "../vendor/backbone-validation",
        "underscore":           "../vendor/underscore",
        "jquery":               "../vendor/jquery",
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
        'XDate':{ exports: 'XDate'}
    }
});

require(['Backbone', 'underscore',
    '../models/UserList','../models/User','../models/ProposalList',
    '../models/Proposal','../views/EditableCell', '../views/WebPage',
    './common','bootstrap','jquery-ui'],
function(Backbone, _, UserList,User,ProposalList,Proposal,EditableCell,WebPage,common){

    var AdminPage = WebPage.extend({
        initialize: function () {
            this.constructor.__super__.initialize.apply(this, {el: this.el});

            _.bindAll(this, 'render','usersFetched','proposalsFetched','getProposals',
                            'getOrals','getPosters');  // include all functions that need the this object
            var self = this;
            
            this.proposals = new ProposalList();
            this.users = new UserList();
            
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

            this.views.usersView.render();


            /*

            var proposalTable = $("#proposal-table");
            this.proposals.each(function(proposal){
                proposalTable.append((new ProposalView({model: proposal, proposalParams: self.proposalParams})).render().el);
            });
            
            this.oralPresentTable.render();
            



            var posterTable = this.$("#poster-table");
            var posters = this.proposals.filter(function(prop){return prop.get("type")==="Poster Presentation"});
            _(posters).each(function(prop){
                posterTable.append(_.template($("#proposal-row-template").html(),prop.attributes));
                self.$(".session:last").html((new EditableCell({model: prop, property: "session"})).render().el);
                self.$("li.proposal:last").attr("id",prop.cid);
            });

            var oralTable = this.$("#oral-table");
            var orals = this.proposals.filter(function(prop){return prop.get("type")==="Oral Presentation"});
            _(orals).each(function(prop,i){
                oralTable.append(_.template($("#proposal-row-template").html(),prop.attributes));

            });



            

           $('#admin-tabs a').click(function (evt) {
                evt.preventDefault();
                $(this).tab('show');
            }); */

          
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
        proposalsFetched: function(collection, response, options) {          
            
            console.log("proposalsFetched");
            

            this.views = {
                usersView : new UsersView({collection: this.users, el: $("#users")}),
                proposalsView : new ProposalsView({parent: this, type: "allProposals", el: $("#proposals"), template: "#proposals-template"}),
                oralsView : new ProposalsView({parent: this, type: "orals", el: $("#oral-presentations"), template: "#orals-template"}),
                postersView : new ProposalsView({parent: this, type: "posters", el: $("#posters"), template: "#posters-template"}),
                scheduleView : new OralPresentationScheduleView({parent: this, el: $("#schedule")}),
                art2DView : new ProposalsView({parent: this, type: "2dart", el: $("#art-2d"), template: "#art2d-template"}),
                art3DView : new ProposalsView({parent: this, type: "3dart", el: $("#art-3d"), template: "#art3d-template"}),
                videosView : new ProposalsView({parent: this, type: "videos", el: $("#video"), template: "#videos-template"})
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
        }
    });

    var UsersView = Backbone.View.extend({
        initialize: function(){
            _.bindAll(this, "render");
        },
        render: function(){
            this.$el.html(_.template($("#users-template").html()));
            var userTable = this.$("#user-table tbody");
            this.collection.each(function(_user){
                userTable.append(_.template($("#user-row-template").html(),_user.attributes));
            });
        }
    });

    var ProposalsView = Backbone.View.extend({
        initialize: function(){
            _.bindAll(this, "render");
            this.template = this.options.template;
            this.parent = this.options.parent;
            this.type = this.options.type;
            this.getProposals = {"allProposals": this.parent.getProposals, "orals": this.parent.getOrals, 
                "posters": this.parent.getPosters};
        },
        render: function(){
            var self = this;
            this.$el.html(_.template($(this.template).html()));
            _(this.getProposals[this.type].apply()).each(function(proposal){
                self.$(".proposal-table > tbody").append((new ProposalView({model: proposal})).render().el);
            });
        }
    });

    var ProposalView = Backbone.View.extend({
        tagName: "tr",
        className: "proposal-row",
        initialize: function(){
            _.bindAll(this,"render");

        },
        render: function() {
            var self = this;
            if(!this.model) { return this; }

            var subDate = (new XDate(this.model.get("submit_date"))).toLocaleDateString();
            var subTime = (new XDate(this.model.get("submit_date"))).toLocaleTimeString();

            this.$el.html(_.template($("#proposal-row-template").html(),_.extend(this.model.attributes,{date: subDate, time: subTime})));
            this.$el.attr("id",this.model.cid);
            _(common.proposalParams).each(function(prop){
                self.$(prop.class).html((new EditableCell({model: self.model, property: prop.field})).render().el);    
            })
            return this;
        },

    });

    var OralPresentationScheduleView = Backbone.View.extend({
        rowTemplate: _.template($("#proposal-row-template").html()),
        initialize: function(){
            _.bindAll(this,"render","reorder");
            this.parent = this.options.parent;

        },
        render: function (){
            this.$el.html(_.template($("#schedule-template").html()));
            var sessionNames = "ABCDEFGHIJKL"
            
            var numCols = 6
              , i =0; 
            var tableBody = this.$("#oral-present-table tbody tr");
            var tableHead = this.$("#oral-present-table thead tr");
            for(i=0;i< numCols; i++){
                tableBody.append("<td><ul class='oral-present-col' id='col" + i + "'></ul></td>");
                tableHead.append("<th>Session " + sessionNames.charAt(i) + "</td>");
            }

           // var sortedProposals = _(this.proposals).sort(function(prop){ return prop.get("session")});
            var re = /OP-(\d)-(\d)/;

            _(this.parent.getOrals()).each(function(prop){
                var matches = prop.get("session").match(re);
                console.log(matches);
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


        },
        reorder: function (){
            var self = this; 
            this.$("li").each(function(i,item){
                var cid = $(item).attr("id")
                var proposal = _(self.proposals).find(function(prop) { return prop.cid===cid;})
                var list = parseInt($(item).parent().attr("id").split("col")[1]); 
                proposal.set("session","OP-"+list + "-"+$(item).index());
                proposal.save();
            })
        }
    });

    new AdminPage({el: $("#container")});
});
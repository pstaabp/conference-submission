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

            _.bindAll(this, 'render','usersFetched','proposalsFetched');  // include all functions that need the this object
            var self = this;
            
            this.proposals = new ProposalList();
            this.users = new UserList();
            
            this.users.fetch({success: this.usersFetched});
            this.proposals.on("add",this.render);

            this.proposals.on("change",function(theChange){
                var p = (_(theChange.changed).pairs())[0];
                self.announce.addMessage("The " + p[0] + " changed to " + p[1]);
            });


            this.proposalParams = [{class: ".session", field: "session"},{class:".title",field: "title"},
                {class: ".sponsor-name", field: "sponsor_name"}, {class: ".sponsor-email", field: "sponsor_email"},
                {class: ".sponsor-dept", field: "sponsor_dept"}, {class: ".type", field: "type"}];

            $("#logout").on("click",common.logout);   

        },
        render: function () {
            this.constructor.__super__.render.apply(this);  // Call  WebPage.render(); 

            var self = this;

            var userTable = this.$("#user-table tbody");
            this.users.each(function(_user){
                userTable.append(_.template($("#user-row-template").html(),_user.attributes));
            });

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



            posterTable.sortable({update: function( event, ui ) {
              console.log("I was sorted!!");
              self.$("#poster-table .proposal").each(function(i,prop){
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

            $('#admin-tabs a').click(function (evt) {
                evt.preventDefault();
                $(this).tab('show');
            });

          
        },
        usersFetched: function(collection, response, options) {
            console.log("Users Fetched");
            this.proposals.fetch({success: this.proposalsFetched});

        },
        proposalsFetched: function(collection, response, options) {          
            
            console.log("proposalsFetched");
            
            var oralPresentations = this.proposals.filter(function(prop){return prop.get("type")==="Oral Presentation"});
            this.oralPresentTable = new OralPresentationScheduleView({el: $("#schedule"), proposals: oralPresentations});

            this.render();
        },
        // This function parses the proposal table and makes each item editable
        setEditable: function () {

        }
    });

    var ProposalView = Backbone.View.extend({
        initialize: function(){
            _.bindAll(this,"render");

        },
        render: function() {
            var self = this;
            this.$el.html(_.template($("#proposal-row-template").html(),this.model.attributes));
            _(this.options.proposalParams).each(function(prop){
                self.$(prop.class).html((new EditableCell({model: self.model, property: prop.field})).render().el);    
            })
            return this;
        },

    });

    var OralPresentationScheduleView = Backbone.View.extend({
        rowTemplate: _.template($("#proposal-row-template").html()),
        initialize: function(){
            _.bindAll(this,"render","reorder");
            this.proposals = this.options.proposals;
            console.log(this.proposals); 

        },
        render: function (){

            var sessionNames = "ABCDEFGHIJKL"
            
            var numCols = 6
              , i =0; 
            var tableBody = this.$("#oral-present-table tbody tr");
            var tableHead = this.$("#oral-present-table thead tr");
            for(i=0;i< numCols; i++){
                tableBody.append("<td><ul class='oral-present-col' id='col" + i + "'></ul></td>");
                tableHead.append("<th>Session " + sessionNames.charAt(i) + "</td>");
            }

            var sortedProposals = _(this.proposals).sort(function(prop){ return prop.get("session")});
            var re = /OP-(\d)-(\d)/;

            _(this.proposals).each(function(prop){
                var matches = prop.get("session").match(re);
                console.log(matches);
                this.$("#col" + matches[1]).append(_.template($("#oral-presentation-template").html(),_.extend(prop.attributes, {cid: prop.cid})));
                self.$("#oral-present-table .oral-present:last").attr("data-id",prop.cid);
            });

            //$("#col0, #col1, #col2").sortable({items: "li", connectWith: ".oral-present-col"});

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
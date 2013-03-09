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
        'jquery-ui': ['jquery']
    }
});

require(['Backbone', 'underscore',
    '../models/UserList','../models/User','../models/ProposalList',
    '../models/Proposal','../views/EditableCell',
    './common','bootstrap','jquery-ui'],
function(Backbone, _, UserList,User,ProposalList,Proposal,EditableCell,common){

    var AdminPage = Backbone.View.extend({
        initialize: function () {
            _.bindAll(this, 'render','usersFetched','proposalsFetched');  // include all functions that need the this object
            var self = this;
            
            this.proposals = new ProposalList();
            this.users = new UserList();
            
            this.users.fetch({success: this.usersFetched});
            this.proposals.on("add",this.render);


            //this.render();

            $("#logout").on("click",common.logout);   

        },
        render: function ()
        {
            var self = this;

            var userTable = this.$("#user-table tbody");
            this.users.each(function(_user){
                userTable.append(_.template($("#user-row-template").html(),_user.attributes));
            });

            var proposalTable = this.$("#proposal-table");
            this.proposals.each(function(prop){
                proposalTable.append(_.template($("#proposal-row-template").html(),prop.attributes));
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
        }
    });

    var OralPresentationScheduleView = Backbone.View.extend({
        rowTemplate: _.template($("#proposal-row-template").html()),
        initialize: function(){
            this.proposals = this.options.proposals; 

        },
        render: function (){
            
            var numCols = 3
              , i =0; 
            var tableBody = this.$("#oral-present-table tbody tr");
            var tableHead = this.$("#oral-present-table thead tr");
            for(i=0;i< numCols; i++){
                tableBody.append("<td><ul class='oral-present-col' id='col" + i + "'></ul></td>");
                tableHead.append("<th>Column " + i + "</td>");
            }


            _(this.proposals).each(function(prop,i){
                this.$("#col0").append(_.template($("#oral-presentation-template").html(),prop.attributes));
                this.$("#col1").append(_.template($("#oral-presentation-template").html(),prop.attributes));
                self.$("#oral-present-table .oral-present:last").attr("data-id",prop.cid);
            });

            $("#col0, #col1, #col2").sortable({update: function(evt,ui){
                console.log("reordering!");
                self.$("#oral-present-table .oral-present").each(function(i,prop){
                    console.log(prop);
                
                }
                )}
                , connectWith: ".oral-present-col"}).disableSelection();

        }
    });

    new AdminPage({el: $("#container")});
});
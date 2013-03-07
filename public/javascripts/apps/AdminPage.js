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
            this.render();
            this.users.fetch({success: this.usersFetched});
            
            this.proposals.on("add",this.render);
            $("#logout").on("click",common.logout);   

        },
        render: function ()
        {
            var self = this;

            var userTable = this.$("#user-table tbody");
            this.users.each(function(_user){
                userTable.append(_.template($("#user-row-template").html(),_user.attributes));
            });

            var proposalTable = this.$("#proposal-table tbody");
            this.proposals.each(function(prop){
                proposalTable.append(_.template($("#proposal-row-template").html(),prop.attributes));
            });

            var oralTable = this.$("#oral-table tbody");
            var orals = this.proposals.filter(function(prop){return prop.get("type")==="Oral Presentation"});
            _(orals).each(function(prop){
                oralTable.append(_.template($("#proposal-row-template").html(),prop.attributes));
                self.$(".session:last").html((new EditableCell({model: prop, property: "session"})).render().el);
            });

            var posterTable = this.$("#poster-table");
            var posters = this.proposals.filter(function(prop){return prop.get("type")==="Poster Presentation"});
            _(posters).each(function(prop){
                posterTable.append(_.template($("#proposal-row-template").html(),prop.attributes));
                self.$(".session:last").html((new EditableCell({model: prop, property: "session"})).render().el);
                self.$("li.proposal:last").attr("id",prop.cid);
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
            console.log(collection);
            this.render();
        }
    });

    new AdminPage({el: $("#container")});
});
//require config
require.config({
    paths: {
        "Backbone":             "../vendor/backbone-0.9.9",
        "backbone-validation":  "../vendor/backbone-validation",
        "underscore":           "../vendor/underscore",
        "jquery":               "../vendor/jquery",
        "bootstrap":            "../vendor/bootstrap/js/bootstrap",
        "XDate":                "../vendor/xdate",
    },
    urlArgs: "bust=" +  (new Date()).getTime(),
    waitSeconds: 15,
    shim: {
        'underscore': { exports: '_' },
        'Backbone': { deps: ['underscore', 'jquery'], exports: 'Backbone'},
        'bootstrap':['jquery'],
        'backbone-validation': ['Backbone'],
    }
});

require(['Backbone', 'underscore',
    '../models/UserList','../models/User','../models/ProposalList',
    '../models/Proposal',
    './common','bootstrap'],
function(Backbone, _, UserList,User,ProposalList,Proposal,common){

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
            var userTable = $("#user-table");
            this.users.each(function(_user){
                userTable.append(_.template($("#user-row-template").html(),_user.attributes));
            });

            var proposalTable = $("#proposal-table");
            this.proposals.each(function(prop){
                proposalTable.append(_.template($("#proposal-row-template").html(),prop.attributes));
            });

            var oralTable = $("#oral-table");
            var orals = this.proposals.filter(function(prop){return prop.get("type")==="Oral Presentation"});
            _(orals).each(function(prop){
                oralTable.append(_.template($("#proposal-row-template").html(),prop.attributes));
            });

            var posterTable = $("#poster-table");
            var posters = this.proposals.filter(function(prop){return prop.get("type")==="Poster Presentation"});
            _(posters).each(function(prop){
                posterTable.append(_.template($("#proposal-row-template").html(),prop.attributes));
            });

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
            this.render();
        }
    });

    new AdminPage({el: $("#container")});
});
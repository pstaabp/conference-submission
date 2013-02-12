//require config
require.config({
    paths: {
        "Backbone":             "../vendor/backbone-0.9.9",
        "backbone-validation":  "../vendor/backbone-validation",
        "underscore":           "../vendor/underscore",
        "jquery":               "../vendor/jquery",
        "bootstrap":            "../vendor/bootstrap/js/bootstrap",
        "XDate":                "../vendor/xdate",
        "config":               "./config"
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
    'bootstrap'],
function(Backbone, _, UserList, User, ProposalList){
    var FacultyView = Backbone.View.extend({
        initialize: function () {
            _.bindAll(this, 'render',"login","saveInfo");  // include all functions that need the this object
            var self = this;
            this.users = new UserList();
            this.users.fetch({success: this.fetchSuccess});
            this.proposals = new ProposalList();
            this.render();

            $('#submit-main-tabs a').click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            }); 

        },
        render: function () {
            //this.$el.html(_.template($("#faculty-main").html()));
        },
        events: {"click #login-button": "login",
                 "click #save-info": "saveInfo"},
        login: function ()
        {
            var user = new User({user_id: $("#falconkey").val()});
            var valid = user.authenticate($("#password").val());
        },

        fetchSuccess: function(collection, response, options) {
            console.log(collection);
            console.log(response);
            console.log(options);
        }
    });

    new FacultyView({el: $("#container")});
});
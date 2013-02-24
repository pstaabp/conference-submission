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
        'XDate':{ exports: 'XDate'}
    }
});

require(['Backbone', 'underscore',
    '../models/UserList','../models/User','../models/ProposalList',"../views/WebPage",
    'bootstrap'],
function(Backbone, _, UserList, User, ProposalList,WebPage){
    var FacultyView = WebPage.extend({
        initialize: function () {
            this.constructor.__super__.initialize.apply(this, {el: this.el});
            _.bindAll(this, 'render');  // include all functions that need the this object
            var self = this;
            //this.users = new UserList();
            //this.users.fetch({success: this.fetchSuccess});
            this.proposals = new ProposalList();
            this.render();

            $('#submit-main-tabs a').click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            }); 

        },
        render: function () {
            this.$el.html("");
            this.constructor.__super__.render.apply(this);  // Call  WebPage.render(); 
            var self = this;
            this.$el.append(_.template($("#faculty-tabs-template").html()));

            
            if (this.user) {
                new PersonalInfoView({el: $("#personal"), user: this.user, editMode: false, parent: self});
            }

        },
        //events: {"click #login-button": "login"},
        
        fetchSuccess: function(collection, response, options) {
            console.log(collection);
            console.log(response);
            console.log(options);
        }
    });

    new FacultyView({el: $("#container")});
});
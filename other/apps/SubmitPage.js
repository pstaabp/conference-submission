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
    '../models/UserList','../models/ProposalList',
    '../views/PersonalInfoView',
    '../views/ProposalView',
    'bootstrap'],
function(Backbone, _, UserList, ProposalList,PersonalInfoView,ProposalView){

    var SubmitPage = Backbone.View.extend({
        initialize: function () {
            _.bindAll(this, 'render');  // include all functions that need the this object
            var self = this;

            this.users = new UserList();
            this.proposals = new ProposalList();
            this.render();
        },
        render: function () {
            
            this.$el.html(_.template($("#submit-main").html()));

            //this.personalInfoView = new PersonalInfoView({el: $("#personal")});
            //this.proposalView = new ProposalView({el: $("#proposal")});

           /* $('#submit-main-tabs a').click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            }); */
        },
        events: {"click button#login-button": "checkLogin"},
        checkLogin: function (evt) {
            evt.preventDefault();
            this.$("button#login-button").prop("disable",true);
            var params = { user_id: $("#falconkey").val(), password: $("#password").val()};
            console.log(params);

        }
            

    });


    new SubmitPage({el: $("#container")});
})
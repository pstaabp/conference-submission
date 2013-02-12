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
    '../models/UserList','../models/User',
    'bootstrap'],
function(Backbone, _, UserList, User){

    var NewUserPage = Backbone.View.extend({ 
        initialize: function () {
            _.bindAll(this, 'render','fetchSuccess');  // include all functions that need the this object
            var self = this;

            this.users = new UserList();
            this.users.fetch({success: this.fetchSuccess});
        },
        render: function(){
            this.$el.html(_.template($("#new-user-view").html()));
        },
        events: {"click #submit": "submit"},
        fetchSuccess: function(collection, response, options) {
            this.render();
        },
        submit: function(){
            var email = $("input[name='email']").val();
            var pass = $("input[name='password']").val();
            var verify = $("input[name='verify']").val();

            var emailRe = /(\w+)\@(student\.)?fitchburgstate\.edu$/;
            var emailParts = emailRe.exec(email);


            var user = this.users.find(function(_user){ return _user.get("user_id")===email});
            if(user){
                alert("The user with username: " + userId + " already exists.  Please login or create a new userId");
                return false;
            } else if (pass!==verify){
                alert("The two passwords must match.");
                return false;
            } else if (pass.length<6){
                alert("Please enter a password at least 6 characters in length");
                return false;
            } else if (emailParts==null){
                alert("You need to use a fitchburgstate.edu email address.");
                return false;
            }
            $("input[name='type']").val((emailParts[2])?"student":"faculty");

        }
    });
    
    new NewUserPage({el: $("#container")});
});

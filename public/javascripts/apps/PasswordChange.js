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
        'XDate':{ exports: 'XDate'},
    }
});

require(['Backbone', 'underscore','../models/UserList','../models/User',
    '../views/WebPage','./common','bootstrap'],
function(Backbone, _,UserList, User, WebPage, common){ 

    var PasswordChangePage = WebPage.extend({ 
        initialize: function () {
            this.constructor.__super__.initialize.apply(this, {el: this.el});
            _.bindAll(this, 'render','savePassword');  // include all functions that need the this object
            var self = this;
            this.render();
        },
        render: function(){
            this.constructor.__super__.render.apply(this);  // Call  WebPage.render(); 
            $("#logout").on("click",common.logout); 
        },
        events: {"click #save-password": "savePassword"},
        savePassword: function(){
            var self = this;
            $("#save-password").prop("disabled",true);
            var _email = $("input[name='email']").val();
            var tmpPass = $("input[name='tmp-pass']").val();
            var pass = $("input[name='password']").val();
            var verify = $("input[name='verify']").val();


            if (pass!==verify){
                alert("The two passwords must match.");
                return false;
            } else if (pass.length<6){
                alert("Please enter a password at least 6 characters in length");
                return false;
            } 

            $.post("/conference-submission/users/password", {email: _email, temp_pass: tmpPass, password: pass}, function (data){
                
                console.log(data);

                /*if (data.user_exists){
                    console.log("oops!");
                    self.errorPane.addMessage("The email " + _email + " has already been used.  Click 'forget my password' if you need to.");
                    $("#submit").prop("disabled",false);
                } else {
                    $("input[name='email']").val(_email);
                    $("input[name='password']").val(pass);

                    self.announce.addMessage("You have successfully created a new account.  You will be redirected to login with " +
                        "this account information in 5 seconds.");
                    window.setTimeout(function () {document.getElementById("newUser").submit();}, 5000); 
                    
                } */
            });
        }
    });
    
    new PasswordChangePage({el: $("#container")});
});

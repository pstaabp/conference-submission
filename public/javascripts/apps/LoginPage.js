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

require(['Backbone', 'underscore','../views/WebPage','./common'],
function(Backbone, _,WebPage, common){

    var LoginPage = WebPage.extend({
        initialize: function () {
            this.constructor.__super__.initialize.apply(this, {el: this.el});
            _.bindAll(this,"render","resetPassword");
            this.render();
            $("#logout").on("click",common.logout);
            $("#reset-password").on("click",this.resetPassword);
        },
        render: function () {
            this.constructor.__super__.render.apply(this);  // Call  WebPage.render(); 

        },
        resetPassword: function () {
            var self = this;
            $("#reset-password").prop("disabled",true);
            var _email = $("#email_reset").val();
            var params = {email: _email};
            $.post("/conference-submission/sessions/reset",params,function(data){
                console.log(data);
                if (data.user_found){
                    $("#email").val(_email);
                    document.getElementById("reset-form").submit();
                } else {
                    self.errorPane.addMessage(data.message);
                    $("#reset-password").prop("disabled",false);
                }
            })
        }

    });

    new LoginPage({el: $("#container")});
});
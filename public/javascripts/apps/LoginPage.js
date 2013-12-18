define(['backbone', 'underscore','../views/WebPage','./common'],
function(Backbone, _,WebPage, common){

    var LoginPage = WebPage.extend({
        initialize: function () {
            this.constructor.__super__.initialize.apply(this, {el: this.el});
            _.bindAll(this,"render","resetPassword");
            this.render();
            $("#logout").on("click",common.logout);
            $("#reset-password").on("click",this.resetPassword);
            if (common.getParameterByName("password-correct")==="false")
            {
                this.errorPane.addMessage("Your password is incorrect.  Please try again or click 'I forgot my login info.' below.");
            }
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
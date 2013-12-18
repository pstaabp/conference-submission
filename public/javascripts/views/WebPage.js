define(['backbone','views/MessageListView', 'jquery-truncate'], 
function(Backbone,MessageListView){
var WebPage = Backbone.View.extend({

    initialize: function (options) {
    	_.bindAll(this,"render","toggleMessageWindow","closeLogin");
    },
    render: function () {
    	var self = this; 

        this.$el.prepend((this.messagePane = new MessageListView()).render().el);
        //this.loginPane = new LoginView();
        this.$el.prepend((this.helpPane = new HelpView()).render().el);
        
        $("button#help-link").click(function () {
                self.helpPane.open();});

        $("button#msg-toggle").on("click",this.toggleMessageWindow);

                // this is just for testing

        $(".navbar-right>li:nth-child(1)").on("click", function () {
            console.log("testing the login");
            self.loginPane.render().open();
        })

        $("#logout").on("click",this.logout);   


    },
    toggleMessageWindow: function() {
        this.messagePane.toggle();
    },
    closeLogin: function () {
        this.loginPane.close();
    },
    requestLogin: function (opts){
        this.loginPane.loginOptions = opts;
        this.loginPane.render().open();

    },
    setLoginTemplate: function(opts){
        this.loginPane.set(opts);
    },
    logout: function (evt) {
            evt.preventDefault();
            if (confirm('Are you sure you want to log out?')) {
              var element = $(this),
                  form = $('<form></form>');
              form.attr({method: 'POST',action: '/conference-submission/logout'})
                  .hide()
                  .append('<input type="hidden" />')
                  .find('input')
                  .attr({'name': '_method','value': 'post'})
                  .end()
                  .appendTo('body')
                  .submit();
            }
            return false;
        },


});

/*var LoginView = ModalView.extend({
    initialize: function (options) {
        _.bindAll(this,"login");
        var tempOptions = _.extend(options || {} , {template: $("#login-template").html(), 
                        templateOptions: {message: config.msgTemplate({type: "relogin"})},
                        buttons: {text: "Login", click: this.login}});
        this.constructor.__super__.initialize.apply(this,[tempOptions]);
    },
    render: function () {
        this.constructor.__super__.render.apply(this); 
        return this;
    },
    login: function (options) {
        console.log("logging in");
        var loginData = {user: this.$(".login-name").val(), password: this.$(".login-password").val()};
        $.ajax({url: config.urlPrefix + "courses/" + config.courseSettings.course_id + "/login",
                data: loginData,
                type: "POST",
                success: this.loginOptions.success});
    }

}); */

var HelpView = Backbone.View.extend({
    className: "ww-help hidden alert alert-info",
    render: function (){
        this.$el.html($("#help-template").html());
        this.$(".help-text").html($("#help-text").html());
        return this;
    },
    open: function(){
        this.$el.removeClass("hidden");
    },
    close: function() {
        this.$el.addClass("hidden");
    },
    events: {"click .close-help-button": "close"}
});


return WebPage;
});
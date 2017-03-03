define(['backbone','views/MessageListView','apps/settings', 'jquery-truncate','jquery-ui'],
function(Backbone,MessageListView,settings){
var WebPage = Backbone.View.extend({

    initialize: function (options) {
    	_.bindAll(this,"render","toggleMessageWindow","closeLogin");
    },
    render: function () {
    	var self = this;
        $("#message-pane").html((this.messagePane = new MessageListView()).render().el);
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

        $(".change-role").on("click",function(evt){
          location.href=settings.template_dir+"/"+$(evt.target).html();
        });


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
              form.attr({method: 'POST',action: '/' + settings.top_dir + '/logout'})
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

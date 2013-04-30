define(['Backbone'], function(Backbone){
    var UsersView = Backbone.View.extend({
        initialize: function(){
            _.bindAll(this, "render");
            this.parent = this.options.parent;
            this.rowTemplate = _.template($("#user-row-template").html());
            this.parent.users.on("remove",this.render);
        },
        render: function(){
            var self = this
              , users;
            switch($("input[type='radio'][name='usersview']:checked").val()){
                case "all": 
                    users = this.parent.users.models;
                    break;
                case "students":
                    users = this.parent.users.filter(function(user) {return user.get("role")==="student"});
                    break;
                case "sponsors":
                    users = this.parent.users.filter(function(user){return user.get("role")==="faculty"});
                    break;
            }
            var userTable = this.$(".user-table tbody");
            userTable.html("");
            _(users).each(function(_user){
                var props;
                switch(self.type){
                    case "users":
                        props = []
                        break;
                    case "students":
                        props = self.parent.proposals.filter(function(proposal){ return proposal.get("email")===_user.get("email"); });
                        break;
                    case "sponsors":
                        props = self.parent.proposals.filter(function(proposal){ return proposal.get("sponsor_email")===_user.get("email"); });
                        break;
                    }
                userTable.append( (new UserRowView({model: _user, template: self.rowTemplate})).render().el);
            });

            this.$("a.showProposal").truncate()
        },
        events: {"click a.showProposal": "showProposal",
            "change input[name='usersview']": "render"},
        showProposal: function (evt){
            var proposal = this.parent.proposals.get($(evt.target).data("id"));  
            
            $(".proposal-modal").html(_.template($("#proposal-view-modal").html(),proposal.attributes));
            $(".proposal-modal .modal").modal(); 
            $(".proposal-modal .modal").width($(window).width()*0.75);
            $(".proposal-modal .modal").css("margin-left", -1*$(".proposal-modal .modal").width()/2 + "px");

        }

    });

    var UserRowView = Backbone.View.extend({
        tagName: "tr",
        initialize: function() {
            _.bindAll(this, "render");
            this.template = this.options.template;
        },
        render: function (){
            this.$el.html(this.template());
            this.stickit();
            return this;
        },
        events: {"click .delete-user": "deleteUser"},
        bindings: {".first-name": "first_name",
                    ".last-name": "last_name",
                    ".role": "role",
                    ".email": "email"},
        deleteUser: function (){
            var del = confirm("Do you wish to delete the user: " + this.model.get("first_name") + " " 
                                    + this.model.get("last_name") +"?");
            if (del){
                this.model.destroy();
            }
        }

    });

    return UsersView;
});
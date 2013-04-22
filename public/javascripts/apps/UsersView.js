define(['Backbone'], function(Backbone){
    var UsersView = Backbone.View.extend({
        initialize: function(){
            _.bindAll(this, "render");
            this.parent = this.options.parent;
            this.type= this.options.type;
            this.headerTemplate = this.options.headerTemplate;
            this.rowTemplate = this.options.rowTemplate;
            this.parent.users.on("remove",this.render);
        },
        render: function(){
            var self = this
              , users;
            switch(this.type){
                case "users": 
                    users = this.parent.users.models;
                    break;
                case "students":
                    users = this.parent.users.filter(function(user) {return user.get("role")==="student"});
                    
                    break;
                case "sponsors":
                    users = this.parent.users.filter(function(user){return user.get("role")==="faculty"});
                    break;
            }

            this.$el.html(_.template($(this.headerTemplate).html(),{numUsers: users.length}));
            var userTable = this.$(".user-table tbody");
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
                userTable.append( (new UserRowView({model: _user, template: self.rowTemplate, proposals: props})).render().el);
            });

            this.$("a.showProposal").truncate()
        },
        events: {"click a.showProposal": "showProposal"},
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
            this.proposals = this.options.proposals;
        },
        render: function (){
            var templateVars = {proposals: this.proposals};
            _.extend(templateVars,this.model.attributes);
            this.$el.html(_.template($(this.template).html(),templateVars));
            return this;
        },
        events: {"click .delete-user": "deleteUser"},
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
define(['Backbone','views/CollectionTableView','models/UserList'], function(Backbone,CollectionTableView,UserList){
    var UsersView = Backbone.View.extend({
        initialize: function(options){
            _.bindAll(this, "render");
            this.parent = options.parent;
            this.rowTemplate = _.template($("#user-row-template").html());
            this.parent.users.on("remove",this.render);
            this.tableSetup();
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
/*            var userTable = this.$(".user-table tbody");
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
            }); */

            this.userTable = new CollectionTableView({columnInfo: this.cols, collection: new UserList(users), 
                                paginator: {page_size: 10, button_class: "btn btn-default", row_class: "btn-group"}});
            this.userTable.render().$el.addClass("table table-bordered table-condensed");
            this.$('.users-table').html(this.userTable.el);

            // set up some styling
            this.userTable.$(".paginator-row td").css("text-align","center");
            this.userTable.$(".paginator-page").addClass("btn btn-default");

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

        },
        tableSetup: function () {
            var self = this;
            this.cols = [{name: "Delete", key: "delete", classname: "delete-set", 
                stickit_options: {update: function($el, val, model, options) {
                    $el.html($("#delete-button-template").html());
                    $el.children(".btn").on("click",function() {self.deleteUser(model);});
                }}},
            {name: "First Name", key: "first_name", classname: "first-name", editable: false, datatype: "string"},
            {name: "Last Name", key: "last_name", classname: "last-name", editable: false, datatype: "string"},
            {name: "Role", key: "role", classname: "role",stickit_options: {selectOptions: {
                collection: [{value:"student", label: "Student"},{value: "faculty", label: "Faculty"},{value: "admin", label: "admin"}]}}},
            {name: "Email", key: "email", classname: "email", editable: false, datatype: "string"}
            ];

        },
        deleteUser: function (model){
            var del = confirm("Do you wish to delete the user: " + this.model.get("first_name") + " " 
                                    + this.model.get("last_name") +"?");
            if (del){
                this.model.destroy();
            }
        }

    });

    return UsersView;
});
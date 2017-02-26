define(['backbone','views/CollectionTableView','models/UserList'], function(Backbone,CollectionTableView,UserList){
    var UsersView = Backbone.View.extend({
        initialize: function(options){
            _.bindAll(this, "render");
            this.users = options.users;
            this.proposals = options.proposals;
            this.rowTemplate = _.template($("#user-row-template").html());
            this.users.on("remove",this.render);
            this.tableSetup();
        },
        render: function(){
            var self = this
              , users;
            this.$el.html($("#users-tab-template").html());
            this.updateTable();
        },
        updateTable: function () {
            console.log(this.$("input[name='userRadio']:checked").val());
            switch(this.$("input[name='userRadio']:checked").val()){
                case "all":
                    users = this.users.toArray();
                    break;
                case "students":
                    users = this.users.filter(function(user) {return _.contains(user.get("role"),"student")});
                    break;
                case "sponsors":
                    users = this.users.filter(function(user){return _.contains(user.get("role"),"sponsor")});
                    break;
                case "judges":
                    users = this.users.filter(function(user){return _.contains(user.get("role"),"judge")});
                    break;

            }
            var _users = new UserList(users);
            _users.on("change",function(user){
                user.save();
            });
            this.userTable = new CollectionTableView({columnInfo: this.cols, collection: _users,
                                paginator: {page_size: 15, button_class: "btn btn-default", row_class: "btn-group"}});
            this.userTable.render().$el.addClass("table table-bordered table-condensed");
            this.$('.users-table').html(this.userTable.el);

            // set up some styling
            this.userTable.$(".paginator-row td").css("text-align","center");
            this.userTable.$(".paginator-page").addClass("btn btn-default");

            this.$("a.showProposal").truncate()
        },
        events: {
            "keyup #search-user-box": "search",
            "click a.showProposal": "showProposal",
            "change input[name='userRadio']": "updateTable",
            "click .clear-search-user": "clearSearch"
        },
        test: function(){
          console.log("hi");
          console.log(this.$("input[name='userRadio']:checked").val());
        },
        showProposal: function (evt){
            var proposal = this.parent.proposals.get($(evt.target).data("id"));

            $(".proposal-modal").html(_.template($("#proposal-view-modal").html(),proposal.attributes));
            $(".proposal-modal .modal").modal();
            $(".proposal-modal .modal").width($(window).width()*0.75);
            $(".proposal-modal .modal").css("margin-left", -1*$(".proposal-modal .modal").width()/2 + "px");

        },
        tableSetup: function () {
            var self = this;
            var roleTemplate = _.template($("#role-template").html());
            this.cols = [{name: "Delete", key: "delete", classname: "delete-set",
                stickit_options: {update: function($el, val, model, options) {
                    $el.html($("#delete-button-template").html());
                    $el.children(".btn").on("click",function() {self.deleteUser(model);});
                }}},
            {name: "First Name", key: "first_name", classname: "first-name", editable: true, datatype: "string"},
            {name: "Last Name", key: "last_name", classname: "last-name", editable: true, datatype: "string"},
            {name: "Role", key: "role", classname: "role", stickit_options: {
                update: function($el, val, model, options){
                    $el.html(roleTemplate({role: model.get("role")}));
                    _(model.get("role")).each(function(role){$el.find("[data-role='"+role+"']").prop("checked",true)}); // check all the given roles.
                    $el.find("input[type='checkbox']").off("change").on("change",function(evt){
                        if($(evt.target).prop("checked")){
                            model.set("role",_.union(model.get("role"),[$(evt.target).data("role")]));
                        } else {
                            model.set("role",_.without(model.get("role"),$(evt.target).data("role")));
                        }
                    });
                }}},
            {name: "Email", key: "email", classname: "email", editable: false, datatype: "string"}
            ];

        },
        deleteUser: function (_user){
            var del = confirm("Do you wish to delete the user: " + _user.get("first_name") + " "
                                    + _user.get("last_name") +"?  This will also delete all proposals "+
                                    "submitted by the user");
            if (del){
                _user.destroy();
                // also destroy all proposals
                _(this.proposals.where({email: _user.get("email")})).each(function(_prop){
                    _prop.destroy();
                })


            }
        },
        search: function(evt){
            this.userTable.filter($(evt.target).val());
            this.userTable.render();
        },
        clearSearch: function(evt){
            this.$("#search-user-box").val("");
            this.userTable.filter("");
            this.userTable.render();
        }

    });

    return UsersView;
});

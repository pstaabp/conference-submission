define(['backbone','views/CollectionTableView','models/UserList'], function(Backbone,CollectionTableView,UserList){
    var UsersView = Backbone.View.extend({
        initialize: function(options){
            _.bindAll(this, "render");
            this.users = options.users;
            this.rowTemplate = _.template($("#user-row-template").html());
            this.users.on("remove",this.render);
            this.tableSetup();
        },
        render: function(){
            var self = this
              , users;
            switch($("input[type='radio'][name='usersview']:checked").val()){
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
        events: {"keyup .search-user-box": "search",
            "click a.showProposal": "showProposal",
            "change input[name='usersview']": "render",
            "click .clear-search-user": "clearSearch"},
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
                //selectOptions: {
                //collection: [{value:"student", label: "Student"},{value: "faculty", label: "Faculty"},{value: "admin", label: "admin"}]}}},
            {name: "Email", key: "email", classname: "email", editable: false, datatype: "string"}
            ];

        },
        deleteUser: function (model){
            var del = confirm("Do you wish to delete the user: " + this.model.get("first_name") + " " 
                                    + this.model.get("last_name") +"?");
            if (del){
                this.model.destroy();
            }
        },
        search: function(evt){
            this.userTable.filter($(evt.target).val());
            this.userTable.render();
        },
        clearSearch: function(evt){
            this.$(".search-user-box").val("");
            this.userTable.filter("");
            this.userTable.render();
        }

    });

    return UsersView;
});
define(['backbone','apps/common'], function(Backbone,common){
    var SponsorsView = Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this,"render");
            this.users = options.users;
            this.rowTemplate = _.template($("#sponsor-row-template").html());
        },
        render: function() {
            var self = this; 
            this.$el.html($("#sponsor-table-template").html());
            this.$el.append("<p>" + this.users.chain().filter(function(u) {
                return _(u.attributes.role).contains("sponsor");
            }).map(function(u){
                return u.attributes.first_name + " " + u.attributes.last_name;
            }).value().join(", ") + "</p>");
        }
    });

/*    var JudgesRowView = Backbone.View.extend({
        tagName: "tr",
        initialize: function (options) {
            _.bindAll(this,"render","save","deleteJudge");
            this.rowTemplate = options.rowTemplate;
            this.model.on("change",function(model) {console.log(model)});

        },
        render: function() {
            this.$el.html(this.rowTemplate());
            this.stickit();
            return this;
        },
        events: {"click .delete-judge": "deleteJudge",
                "blur td.editable": "save"},
        bindings: {
            ".name": "name",
            ".email": "email", 
            ".presentation": { observe: "presentation",
                selectOptions: {
                    collection: common.majors
                }
            },
            ".type": {observe: "type",
                selectOptions: {
                    collection: ["oral","poster","either"]
                }
            }
        },
        deleteJudge: function() { 
            var del = confirm("Do you want to delete the judge " + this.model.get("name") + "?");
            if(del){
               this.model.destroy();
           }
       },
       save: function (){ 
            this.model.save();
            this.judges.add(this.model);
        }
    }); */

    return SponsorsView;
});
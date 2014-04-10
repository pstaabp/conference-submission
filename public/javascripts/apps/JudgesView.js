define(['backbone','apps/common'], function(Backbone,common){
    var JudgesView = Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this,"render");
            this.parent = options.parent;
            this.rowTemplate = _.template($("#judges-row-template").html());
            this.parent.judges.on("remove", this.render);
        },
        render: function() {
            var self = this; 
            this.$el.html($("#judges-table-template").html());
            var judgesTable = this.$(".judges-table tbody");
            this.parent.judges.each(function(judge){
                judgesTable.append((new JudgesRowView({model: judge, rowTemplate: self.rowTemplate})).render().el);
            })
        }
    });

    var JudgesRowView = Backbone.View.extend({
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
    });
    return JudgesView;
});
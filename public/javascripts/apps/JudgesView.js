define(['backbone','apps/common'], function(Backbone,common){
    var JudgesView = Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this,"render");
            this.judges = options.judges; 
            this.proposals = options.proposals;
            this.rowTemplate = _.template($("#judges-row-template").html());
            this.judges.on("remove", this.render);
        },
        render: function() {
            var self = this; 
            this.$el.html($("#judges-table-template").html());
            var judgesTable = this.$(".judges-table tbody");
            this.judges.each(function(judge){
                judgesTable.append((new JudgesRowView({model: judge, rowTemplate: self.rowTemplate, proposals: self.proposals})).render().el);
            })
        }
    });

    var JudgesRowView = Backbone.View.extend({
        tagName: "tr",
        initialize: function (options) {
            var self = this;
            _.bindAll(this,"render","save","deleteJudge");
            this.rowTemplate = options.rowTemplate;
            this.sessionTemplate = _.template($("#session-template").html());
            var sessions = [];
            options.proposals.each(function(prop){ 
                prop.get("feedback").each(function(feed){ 
                    if(feed.get("judge_id")===self.model.id){
                        sessions.push(prop.get("session"))}
                    });
            });
            this.model.set("sessions",sessions);
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
            },
            ".sessions-to-judge": {
                observe: "sessions", 
                update: function($el, val, model, options) { 
                    $el.html(this.sessionTemplate({sessions: val}));
                    $el.children("button").on("click",function(evt){
                        model.set("sessions",_(model.get("session")).without($(evt.target).data("session")));
                        model.save();
                    })
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
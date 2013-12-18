define(['backbone'], function(Backbone){
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
                    collection: [{name: "Biology", value: "Biology"}, 
                                {name:"Business Administration", value: "Business_Administration"},
                                {name: "Communications Media", value: "Communications_Media"},
                                {name: "Computer Information Systems", value: "Computer_Information_Systems"},
                                {name: "Computer Science", value: "Computer_Science"},
                                {name: "Criminal Justice", value: "Criminal_Justice"},
                                {name: "Early Childhood Education", value: "Early_Childhood_Education"},
                                {name: "Earth Systems Science", value: "Earth_Systems_Science"},
                                {name: "Economics", value: "Economics"},
                                {name: "Elementary Education", value: "Elementary_Education"},
                                {name: "English Studies", value: "English_Studies"},
                                {name: "Exercise and Sports Science", value: "Exercise_and_Sports_Science"},
                                {name: "Game Design", value: "Game_Design"},
                                {name: "Geography", value: "Geography"},
                                {name: "History", value: "History"},
                                {name: "Human Services", value: "Human_Services"},
                                {name: "Industrial Technology", value: "Industrial_Technology"},
                                {name: "Mathematics", value: "Mathematics"},
                                {name: "Middle School Education", value: "Middle_School_Education"},
                                {name: "Nursing", value: "Nursing"},
                                {name: "Occupational/Vocational Education", value: "Occupational_Vocational_Education"},
                                {name: "Political Science", value: "Political_Science"},
                                {name: "Psychological Science", value: "Psychological_Science"},
                                {name: "Sociology", value: "Sociology"},
                                {name: "Special Education", value: "Special_Education"},
                                {name: "Technology Education",value: "Technology_Education"}],
                    labelPath: "name",
                    valuePath: "value"
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
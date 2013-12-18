define(['backbone', 'underscore','stickit'], function(Backbone, _){
var FeedbackView = Backbone.View.extend({
        initialize: function (){
            _.bindAll(this,"render");
        },
        render: function(){
            this.$el.html($("#feedback-template").html());
            this.stickit();
            this.$(".modal").modal().width($(window).width()*0.90)
                .css("margin-left", -1*this.$(".modal").width()/2 + "px");
            this.$(".total-score").text(0 + this.model.get("visual_design") + this.model.get("knowledge") 
                    + this.model.get("verbal_presentation") + this.model.get("organization_and_logic")
                    + this.model.get("explanations") + this.model.get("overall"));
        },
        bindings: {".visual-design": "visual_design",
                    ".knowledge": "knowledge",
                    ".verbal-presentation" : "verbal_presentation",
                    ".organization-and-logic": "organization_and_logic",
                    ".explanations": "explanations",
                    ".overall": "overall",
                    ".strength": "strength_comment",
                    ".improvement": "improvement_comment"}
    });

    return FeedbackView;
});
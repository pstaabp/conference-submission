define(['backbone', 'underscore','stickit'], function(Backbone, _){
var FeedbackView = Backbone.View.extend({
        className: "tab-pane",
        initialize: function (opts){
            _.bindAll(this,"render");
            this.tab_num = opts.tab_num;
            this.proposal = opts.proposal;
        },
        render: function(){
            this.$el.html($("#feedback-template").html());
            this.$el.attr("id","tab-num-"+this.tab_num);
            this.stickit();
            return this;
        },
        events: {
            "click .save-feedback-button": "saveFeedback"
        },
        bindings: {".visual-design": "visual_design",
                    ".knowledge": "knowledge",
                    ".verbal-presentation" : "verbal_presentation",
                    ".organization-and-logic": "organization_and_logic",
                    ".explanations": "explanations",
                    ".overall": "overall",
                    ".strength": "strength_comment",
                    ".improvement": "improvement_comment",
                    ".total-score": {observe: "score", update: function($el, val, model, options){
                        $el.text(model.score());
                    }}},
        saveFeedback: function(){
            this.proposal.save();
        }
    });

    return FeedbackView;
});
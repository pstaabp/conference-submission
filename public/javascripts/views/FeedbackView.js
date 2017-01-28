define(['backbone', 'underscore','stickit'], function(Backbone, _){
var FeedbackView = Backbone.View.extend({
        className: "tab-pane",
        initialize: function (opts){
            _.bindAll(this,"render");
            var self = this;
            this.tab_num = opts.tab_num;
            this.proposal = opts.proposal;
            this.model.on("change",function(p){
                self.$(".total-score").text(self.model.score());
                self.$(".warn-submit").removeClass("invisible");
                self.$(".save-feedback-button").button("reset").removeClass("disabled");
            })
            this.proposal.on("sync",function(p){
                console.log("saved"); 
                self.$(".save-feedback-button").button("saved").addClass("disabled");
                self.$(".warn-submit").addClass("invisible");
            }); 
            
            this.numberRange =  _(_.range(11)).map(function(v) { return {label: ""+v, value: v}});
        },
        render: function(){
            switch(this.proposal.get("type")){
                case "Poster Presentation": this.$el.html($("#poster-feedback-template").html()); break;
                case "Oral Presentation":   this.$el.html($("#oral-feedback-template").html()); break;
            }

            this.$el.attr("id","tab-num-"+this.tab_num);
            this.stickit();
            return this;
        },
        events: {
            "click .save-feedback-button": "saveFeedback"
        },
        bindings: {".visual-design": {observe: "visual_design", selectOptions: {
                        collection: function(){ return this.numberRange;}
                    }},
                    ".knowledge": {observe: "knowledge", selectOptions: {
                        collection: function(){ return this.numberRange;}
                    }},
                    ".verbal-presentation" : {observe: "verbal_presentation", selectOptions: {
                        collection: function(){ return this.numberRange;}
                    }},
                    ".organization-and-logic": {observe: "organization_and_logic", selectOptions: {
                        collection: function(){ return this.numberRange;}
                    }},
                    ".explanations": {observe: "explanations", selectOptions: {
                        collection: function(){ return this.numberRange;}
                    }},
                    ".overall": {observe: "overall", selectOptions: {
                        collection: function(){ return this.numberRange;}
                    }},
                    ".comments": "comments",
                    ".total-score": {observe: "score", update: function($el, val, model, options){
                        $el.text(model.score());
                    }}},
        saveFeedback: function(){
            this.proposal.save();
        }
    });

    return FeedbackView;
});

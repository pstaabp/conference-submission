define(['backbone'], function(Backbone){

    var judgePts = /^([01]?\d?\d)$/;
    var pointMessage = 'The points must be between 1 and 100';
    /**
     *
     * This defines an Feedback from a judge
     * 
     * @type {*}
     */

    var Feedback = Backbone.Model.extend({
        defaults: {
            judge_id: "",
            visual_design: 0,
            verbal_presentation: 0,
            organization_and_logic: 0,
            knowledge: 0,
            explanations: 0,
            overall: 0,
            strength_comment: "",
            improvement_comment: ""
        },
        validation: {
            judge_id: {required: true},
            visual_design: { pattern: judgePts, msg: pointMessage},
            verbal_presentation: { pattern: judgePts, msg: pointMessage},
            organization_and_logic: { pattern: judgePts, msg: pointMessage},
            knowledge: { pattern: judgePts, msg: pointMessage},
            explanations: { pattern: judgePts, msg: pointMessage},
            overall: { pattern: judgePts, msg: pointMessage},
        },
        idAttribute: "_id",
        numericalAttributes: ["visual_design","verbal_presentation","organization_and_logic","knowledge","explanations"],
        score: function () { // total all the numerical Attributes
            return _(this.pick(this.numericalAttributes)).chain().values().reduce(function(memo, num){ return parseInt(memo) + parseInt(num); }).value();
        }
    });

    return Feedback;
});
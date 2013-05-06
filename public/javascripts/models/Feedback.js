define(['Backbone', 'underscore'], 
function(Backbone, _){

    var judgePts = /^[0-4](\.[0|5])?|5|5.0$/;
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
            visual_design: { pattern: judgePts, msg: 'The points must be between 0.0 and 5.0 in increments of 0.5'},
            verbal_presentation: { pattern: judgePts, msg: 'The points must be between 0.0 and 5.0 in increments of 0.5'},
            organization_and_logic: { pattern: judgePts, msg: 'The points must be between 0.0 and 5.0 in increments of 0.5'},
            knowledge: { pattern: judgePts, msg: 'The points must be between 0.0 and 5.0 in increments of 0.5'},
            explanations: { pattern: judgePts, msg: 'The points must be between 0.0 and 5.0 in increments of 0.5'},
            overall: { pattern: judgePts, msg: 'The points must be between 0.0 and 5.0 in increments of 0.5'},
        },
        idAttribute: "_id"
    });

    return Feedback;
});
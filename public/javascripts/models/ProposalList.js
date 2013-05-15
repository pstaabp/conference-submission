define(['Backbone', 'underscore','./Proposal'], function(Backbone, _,Proposal){
    /**
     *
     * This defines a User
     * 
     * @type {*}
     */

    var ProposalList = Backbone.Collection.extend({
        model: Proposal,
        comparator: function (proposal){
            return proposal.get("session");
        },
        url: '/conference-submission/proposals'
    });

    return ProposalList;

});

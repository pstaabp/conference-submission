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
        url: '/conference-submission/proposals',
        parse: function (response,options){
            console.log("in ProposalList.parse");
            console.log(response);
            console.log(options);
            return response;
        } 
    });

    return ProposalList;

});

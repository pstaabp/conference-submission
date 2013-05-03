define(['Backbone', 'underscore','./Proposal'], function(Backbone, _,Proposal){
    /**
     *
     * This defines a User
     * 
     * @type {*}
     */

    var ProposalList = Backbone.Collection.extend({
        model: Proposal,
        initialize:function () {
    
        },
        comparator: function (proposal){
            return proposal.get("session");
        },
        url: '/conference-submission/proposals',
        parse: function (response){
            console.log(response);
            return response;
        }
    });

    return ProposalList;

});

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
            this.sortField = "session";
        },
        comparator: function (proposal){
            if (this.sortField==="author"){
                return proposal.get("author").trim().split(/\s+/)[1];
            } else {
                return proposal.get(this.sortField);
            }
        },
        url: '/conference-submission/proposals',
        /*parse: function (response){
            console.log(response);
            return response;
        }*/
    });

    return ProposalList;

});

define(['backbone', 'models/Proposal'], function(Backbone,Proposal){
    /**
     *
     * This defines a User
     * 
     * @type {*}
     */

    var ProposalList = Backbone.Collection.extend({
        model: Proposal,
        initialize:function (options) {
            this.sortField = "submit_date";
            this.user_id = options ? options.user_id : null;
        },
        comparator: function (proposal){
            if (this.sortField==="author"){
                return proposal.get("author").trim().split(/\s+/)[1];
            } else {
                return proposal.get(this.sortField);
            }
        },
        parse: function(response,options){
            var proposals = [];
            _(response).each(function(model){
                proposals.push(Proposal.prototype.parse(model));
            });
            return proposals;
        },
        url: function(){
            return '/conference-submission/users/' + this.user_id + '/proposals';
        }
    });

    return ProposalList;

});

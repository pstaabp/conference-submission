define(['backbone', 'models/Proposal','apps/settings'], function(Backbone,Proposal,settings){
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
            return _(response).map(function(_set){
                return new Proposal(_set);
            });
        },
        url: function(){
            if(this.user_id){
                return '/' + settings.top_dir + 'users/' + this.user_id + '/proposals';    
            } else {
                return '/' + settings.top_dir + 'proposals';
            }
            
        }
    });

    return ProposalList;

});

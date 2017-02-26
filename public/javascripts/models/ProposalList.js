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
        // parse: function(response,options){
        //     return _(response).map(function(_prop){
        //         return new Proposal(_prop);
        //     });
        // },
        url: function(){
            // if(this.get("author_id")){
            //     return '/' + settings.top_dir + '/users/' + this.get("author_id") + '/proposals';
            // } else {
                return '/' + settings.top_dir + '/proposals';
            // }

        }
    });

    return ProposalList;

});

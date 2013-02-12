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
        url: '/proposals',
        /*parse: function (response){
            console.log(response);
            return response;
        }*/
    });

    return ProposalList;

});

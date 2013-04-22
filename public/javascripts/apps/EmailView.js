define(['Backbone'], function(Backbone){

    var EmailView = Backbone.View.extend({
        initialize: function () {
            _.bindAll(this,"render");
            this.parent = this.options.parent;
        },
        render: function() {
            var _allUsers = this.parent.users.pluck("email");
            var _otherAuthors = _.chain(this.parent.getProposals()).pluck("attributes").pluck("other_authors")
                                    .flatten().pluck("email").value(); 
            var _allParticipants = _.unique(_allUsers,_otherAuthors).join(", ");
            var _oralPresenters = _.chain(this.parent.getOrals()).pluck("attributes").pluck("email").unique().value();
            var _oralPresentersOther = _.chain(this.parent.getOrals()).pluck("attributes").pluck("other_authors")
                                            .flatten().pluck("email").union(_oralPresenters).value().join(", ");
            var _posterPresenters = _.chain(this.parent.getPosters()).pluck("attributes").pluck("email").unique().value().join(", ");
            var _posterPresentersOther = _.chain(this.parent.getPosters()).pluck("attributes").pluck("other_authors")
                                            .flatten().pluck("email").union(_posterPresenters).value();

            var _oralSponsors = _.chain(this.parent.getOrals()).pluck("attributes").pluck("sponsor_email").unique().value().join(", ");
            var _posterSponsors = _.chain(this.parent.getPosters()).pluck("attributes").pluck("sponsor_email").unique().value().join(", ");

            var _missingNames = _(this.parent.users.filter(function(user) { return user.get("first_name")==="";}))
                                    .chain().pluck("attributes").pluck("email").unique().value().join(", ");
            var _sponsors = _.chain(this.parent.getProposals()).pluck("attributes").pluck("sponsor_email").unique().value().join(", ");

            var _missing_statments = _.chain(this.parent.getProposals()).filter(function(proposal){
                                            return proposal.get("sponsor_statement")==="";
                                        }).pluck("attributes").pluck("sponsor_email").unique().value().join(", ");

            var _acceptedPosters = _.chain(this.parent.getPosters()).filter(function(proposal) { 
                    return proposal.get("accepted")===true;}).pluck("attributes").pluck("email").value();


            var _acceptedPostersOther = _.chain(this.parent.getPosters()).filter(function(p){ 
                    return p.get("accepted")===true;}).pluck("attributes").pluck("other_authors")
                            .flatten().pluck("email").union(_acceptedPosters).value().join(", ");

            var _acceptedOrals = _.chain(this.parent.getOrals()).filter(function(proposal) { 
                    return proposal.get("accepted")===true;}).pluck("attributes").pluck("email").value();


            var _acceptedOralsOther = _.chain(this.parent.getOrals()).filter(function(p){ 
                    return p.get("accepted")===true;}).pluck("attributes").pluck("other_authors")
                            .flatten().pluck("email").union(_acceptedOrals).value().join(", ");


            var _judges = _(this.parent.judges.pluck("email")).unique().join(", ");


            this.$el.html(_.template($("#emails-template").html(),{allParticipants: _allParticipants,
                    oralPresenters: _oralPresentersOther, posterPresenters: _posterPresentersOther,
                    missingNames: _missingNames, sponsors: _sponsors, missing_statements: _missing_statments,
                    acceptedPosters: _acceptedPostersOther, acceptedOrals: _acceptedOralsOther, judges: _judges,
                    oralSponsors: _oralSponsors, posterSponsors: _posterSponsors}));

        }
    });

    return EmailView;

});
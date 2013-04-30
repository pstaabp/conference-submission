define(['Backbone'], function(Backbone){

    var EmailView = Backbone.View.extend({
        initialize: function () {
            _.bindAll(this,"render");
            this.users = this.options.users;
            this.proposals = this.options.proposals;
            this.judges = this.options.judges;
        },
        render: function() {
            var orals = this.proposals.where({type: "Oral Presentation"});
            var posters = this.proposals.where({type: "Poster Presentation"});


            var _allUsers = this.users.pluck("email");
            var _otherAuthors = _.chain(this.proposals.pluck("other_authors")).flatten().pluck("email").value(); 
            var _allParticipants = _.unique(_allUsers,_otherAuthors).join(", ");
            var _oralPresenters = _.chain(orals).pluck("attributes").pluck("email").unique().value();
            var _oralPresentersOther = _.chain(orals).pluck("attributes").pluck("other_authors")
                                            .flatten().pluck("email").union(_oralPresenters).value().join(", ");
            var _posterPresenters = _.chain(posters).pluck("attributes").pluck("email").unique().value().join(", ");
            var _posterPresentersOther = _.chain(posters).pluck("attributes").pluck("other_authors")
                                            .flatten().pluck("email").union(_posterPresenters).value();

            var _oralSponsors = _.chain(orals).pluck("attributes").pluck("sponsor_email").unique().value().join(", ");
            var _posterSponsors = _.chain(posters).pluck("attributes").pluck("sponsor_email").unique().value().join(", ");

            var _missingNames = _(this.users.filter(function(user) { return user.get("first_name")==="";}))
                                    .chain().pluck("attributes").pluck("email").unique().value().join(", ");
            var _sponsors = _.chain(this.proposals.pluck("sponsor_email")).unique().value().join(", ");

            var _missing_statments = _.chain(this.proposals.where({sponsor_statement: ""})).pluck("attributes").pluck("sponsor_email").unique().value().join(", ");

            var _acceptedPosters = _.chain(this.posters).filter(function(proposal) {
                        return proposal.get("accepted")===true;}).pluck("attributes").pluck("email").value();


            var _acceptedPostersOther = _.chain(posters).filter(function(p){ 
                    return p.get("accepted")===true;}).pluck("attributes").pluck("other_authors")
                            .flatten().pluck("email").union(_acceptedPosters).value().join(", ");

            var _acceptedOrals = _.chain(orals).filter(function(proposal) { 
                    return proposal.get("accepted")===true;}).pluck("attributes").pluck("email").value();


            var _acceptedOralsOther = _.chain(orals).filter(function(p){ 
                    return p.get("accepted")===true;}).pluck("attributes").pluck("other_authors")
                            .flatten().pluck("email").union(_acceptedOrals).value().join(", ");


            var _judges = _(this.judges.pluck("email")).unique().join(", ");


            this.$el.html(_.template($("#emails-template").html(),{allParticipants: _allParticipants,
                    oralPresenters: _oralPresentersOther, posterPresenters: _posterPresentersOther,
                    missingNames: _missingNames, sponsors: _sponsors, missing_statements: _missing_statments,
                    acceptedPosters: _acceptedPostersOther, acceptedOrals: _acceptedOralsOther, judges: _judges,
                    oralSponsors: _oralSponsors, posterSponsors: _posterSponsors}));

        }
    });

    return EmailView;

});
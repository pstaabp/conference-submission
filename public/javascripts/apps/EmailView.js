define(['backbone'], function(Backbone){

    var EmailView = Backbone.View.extend({
        emailTemplate: _.template($("#emails-template").html()),
        initialize: function (options) {
            _.bindAll(this,"render");
            this.users = options.users;
            this.proposals = options.proposals;
            this.judges = options.judges;
        },
        render: function() {
          var self = this;
            var orals = this.proposals.where({type: "Oral Presentation"});
            var posters = this.proposals.where({type: "Poster Presentation"});


            var _allUsers = _(this.users.pluck("email")).chain().unique().value().join(", ");
            var _oralPresenters = _.chain(orals).map(function (_prop){
              var _user = self.users.get(_prop.get("author_id"));
              return _.isUndefined(_user)?"":_user.get("email");
            }).value();

            var _oralPresentersOther =  _.chain(orals).map(function (_prop){
              var _other = _prop.get("other_authors");
                return _.isArray(_other)? _(_other).map(function(_o){return self.users.findWhere({falconkey: _o}).get("email")}):"";
            }).value();

            var _allOralPresenters = _(_oralPresenters).chain()
                    .union(_(_oralPresentersOther).flatten()).unique().value().join(", ");

            var _posterPresenters = _.chain(posters).map(function (_prop){
              var _user = self.users.get(_prop.get("author_id"));
              return _.isUndefined(_user)?"":_user.get("email");
            }).unique().value();

            var _posterPresentersOther =  _.chain(posters).map(function (_prop){
                    var _other = _prop.get("other_authors");
                      return _.isArray(_other)? _(_other).map(function(_o){
                          return self.users.findWhere({falconkey: _o}).get("email")}):"";
                  }).value();

            var _allPosterPresenters = _(_posterPresenters).chain()
                      .union(_(_posterPresentersOther).flatten()).unique().value().join(", ");

            var _oralSponsors = _(orals).chain().pluck("attributes").pluck("sponsor_id").map(function(_sid){
                      var _sp = self.users.get(_sid);
                      return _.isUndefined(_sp)?"":_sp.get("email");
                    }).unique().value().join(", ");

            var _posterSponsors = _(posters).chain().pluck("attributes").pluck("sponsor_id").map(function(_sid){
                      var _sp = self.users.get(_sid);
                      return _.isUndefined(_sp)?"":_sp.get("email");
                    }).unique().value().join(", ");


            var _sponsors = _(this.proposals.pluck("sponsor_id")).chain().map(function(_sid){
                  var _sp = self.users.get(_sid);
                  return _.isUndefined(_sp)?"":_sp.get("email");
                }).unique().value().join(", ");

            var _missing_statements =_(this.proposals.filter(function(_p){ return _p.get("sponsor_statement") == ""}))
                      .chain().map(function(_prop){
                                var sponsor = self.users.get(_prop.get("sponsor_id"))
                                return _.isUndefined(sponsor)?"":sponsor.get("email");
                              }).unique().value().join(", ");

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

            this.$el.html(this.emailTemplate({allUsers: _allUsers,
                    oralPresenters: _allOralPresenters, posterPresenters: _allPosterPresenters,
                    sponsors: _sponsors, missing_statements: _missing_statements,
                    acceptedPosters: _acceptedPostersOther, acceptedOrals: _acceptedOralsOther, judges: _judges,
                    oralSponsors: _oralSponsors, posterSponsors: _posterSponsors}));
        }
    });

    return EmailView;

});

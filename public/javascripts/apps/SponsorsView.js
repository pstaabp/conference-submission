define(['backbone','apps/common'], function(Backbone,common){
    var SponsorsView = Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this,"render");
            this.users = options.users;
            this.rowTemplate = _.template($("#sponsor-row-template").html());
            this.sponsors = this.users.chain().filter(function(u) {
                return _(u.attributes.role).contains("sponsor");
            }).sortBy(function(u){
                return u.attributes.last_name;
            });
        },
        render: function() {
            var self = this;
            this.$el.html($("#sponsor-table-template").html());
            this.$el.append("<p>" + this.sponsors.map(function(u){
                return u.attributes.first_name + " " + u.attributes.last_name;
            }).value().join(", ") + "</p>");
        }
    });
    return SponsorsView;
});

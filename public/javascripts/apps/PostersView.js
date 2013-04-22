define(['Backbone'], function(Backbone){
    var PostersView = Backbone.View.extend({
        initialize: function(){
            _.bindAll(this, "render");
            this.rowTemplate =  _.template($("#poster-row-template").html());
            
        },
        render: function (){
            var self = this;
            this.proposals = this.options.parent.getPosters();
            this.$el.html($("#poster-table-template").html());
            var posterTable = this.$(".poster-table tbody");
            _(this.proposals).each(function(proposal){
                posterTable.append((new PosterRowView({model: proposal, parent: self})).render().el);
            })
        }
    });

    var PosterRowView = Backbone.View.extend({
        tagName: "tr",
        className: "poster-row",
        initialize: function (){
            _.bindAll(this, "render","showProposal");
            this.parent=this.options.parent;
            this.model.on("change:session",this.render);
        },
        render: function(){
            this.$el.html(this.parent.rowTemplate(this.model));
            this.$el.attr("id",this.model.cid);
            return this;
        },
        events: {"click a.showProposal": "showProposal"},
        showProposal: function (evt){
            $(".proposal-modal").html(_.template($("#proposal-view-modal").html(),this.model.attributes));
            $(".proposal-modal .modal").modal(); 
            $(".proposal-modal .modal").width($(window).width()*0.75);
            $(".proposal-modal .modal").css("margin-left", -1*$(".proposal-modal .modal").width()/2 + "px");

        }

    });

    return PostersView;

});
define(['Backbone','stickit','jquery-truncate'], function(Backbone){
    var PresentationsView = Backbone.View.extend({
        initialize: function(){
            _.bindAll(this, "render");
            this.parent = this.options.parent;
            
        },
        render: function() {
        	var _proposals;
        	switch($("input[type='radio'][name='presentationsview']:checked").val()){
        	case "orals": 
           		_proposals = this.parent.proposals.where({type: "Oral Presentation"});
        	   	this.$(".presentation-content").html((new PresentationView({type: "Orals", proposals: _proposals})).render().el);
        	   	break;
   	    	case "schedule": 
           		_proposals = this.parent.proposals.where({type: "Oral Presentation"});
        	   	this.$(".presentation-content").html((new OralPresentationScheduleView({parent: this, proposals: _proposals})).render().el);
        	   	break;
        	case "posters":
        		_proposals = this.parent.proposals.where({type: "Poster Presentation"});
        		this.$(".presentation-content").html((new PostersView({proposals: _proposals})).render().el);
        		break;
        	case "videos":
        		_proposals = this.parent.proposals.where({type: "Video"});
        		this.$(".presentation-content").html((new PresentationView({type: "Video", proposals: _proposals})).render().el);
        		break;
        	case "art2d":
        		_proposals = this.parent.proposals.where({type: "2D Art"});
        		this.$(".presentation-content").html((new PresentationView({type: "2D Art", proposals: _proposals})).render().el);
        		break;
        	case "art3d":
	    		_proposals = this.parent.proposals.where({type: "3D Art"});
        		this.$(".presentation-content").html((new PresentationView({type: "3D Art", proposals: _proposals})).render().el);
        		break;
        	case "music":
        		_proposals = this.parent.proposals.where({type: "Music"});
        		this.$(".presentation-content").html((new PresentationView({type: "Music", proposals: _proposals})).render().el);
        		break;
        	case "theatre":
        		_proposals = this.parent.proposals.where({type: "Theatre"});
        		this.$(".presentation-content").html((new PresentationView({type: "Theatre", proposals: _proposals})).render().el);
        		break;
        	}
        }, 
        events: {"change input[name='presentationsview']": "render"}

    });


     var OralPresentationScheduleView = Backbone.View.extend({
        rowTemplate: _.template($("#proposal-row-template").html()),
        initialize: function(){
            _.bindAll(this,"render","reorder");
            this.parent = this.options.parent;
            this.proposals = this.options.proposals;

        },
        render: function (){
        	var self = this;
            var sessionNames = "ABCDEFGHIJKL";

            this.$el.html(_.template($("#schedule-template").html(),{numSessions: 12 }));
            
            var re = /OP-(\d+)-(\d+)/;

            _(this.proposals).each(function(prop){
                var matches = prop.get("session").match(re);
                var propHTML = _.template($("#oral-presentation-template").html(),_.extend(prop.attributes, {cid: prop.cid}));
                if(matches){
                    self.$("#col" + matches[1]).append(propHTML);
                } else {
                    self.$("#extra-ops").append(propHTML);
                }


            });

            this.$(".oral-present-col").sortable({ 
                    connectWith: ".oral-present-col", 
                    placeholder: "ui-state-highlight",
                    stop: this.reorder});

            //this.$(".op-title").truncate();
            return this;

        },
        reorder: function (){
            var self = this; 
            this.$("li").each(function(i,item){
                var cid = $(item).attr("id")
                var proposal = _(self.proposals).find(function(prop) { return prop.cid===cid;})
                var list = parseInt($(item).parent().attr("id").split("col")[1]); 
                proposal.set("session","OP-"+list + "-"+$(item).index());
                proposal.save();
            })
        }
    });

var PostersView = Backbone.View.extend({
        initialize: function(){
            _.bindAll(this, "render");
            this.rowTemplate =  _.template($("#presentation-row-template").html());
            this.proposals = this.options.proposals;
            
        },
        render: function (){
            var self = this;
            this.$el.html($("#presentation-table-template").html());
            var posterTable = this.$("table tbody");
            _(this.proposals).each(function(proposal){
            	var row = new PresentationRowView({model: proposal, rowTemplate: self.rowTemplate, reorder: true}).render();
            	row.$el.addClass("poster-row");
                posterTable.append(row.el);
            });


            this.$("table").sortable({ 
                axis: "y",
                items: "tr.poster-row",
                // handle: "tr.poster-row button",
                update: function( event, ui ) {
                  	console.log("I was sorted!!");
                  	self.$(".poster-row").each(function(i,prop){
                    	var cid = $(prop).attr("id");
	                    var updateProp = _(self.proposals).find(function(proposal) { return proposal.cid === cid;})
	                    var sess = "P" + ( (i<9)? "0"+(i+1): ""+(i+1));
	                    if (sess !== updateProp.get("session")){

	                        updateProp.set("session",sess);
	                        updateProp.save();

	                        $(prop).find(".session .srv-value").text(sess);
	                    }
	              	});
                }
            });

            return this;
        }
    });

    var PresentationRowView = Backbone.View.extend({
        tagName: "tr",
        className: "presentation-row",
        initialize: function (){
            _.bindAll(this, "render","showDetails");
            this.rowTemplate = this.options.rowTemplate;
            this.reorder = this.options.reorder;
            this.model.on("change:session",this.render);
        },
        render: function(){
            this.$el.html(this.rowTemplate({reorder: this.reorder}));
            this.$el.attr("id",this.model.cid);
            this.stickit();
            return this;
        },
        events: {"click button.showDetails": "showDetails"},
        bindings: {".title": "title",
    				".author": "author",
    				".session": "session"},
        showDetails: function (evt){
            $(".proposal-modal").html(_.template($("#proposal-view-modal").html(),this.model.attributes));
            $(".proposal-modal .modal").modal(); 
            $(".proposal-modal .modal").width($(window).width()*0.75);
            $(".proposal-modal .modal").css("margin-left", -1*$(".proposal-modal .modal").width()/2 + "px");

        }

    });

	var PresentationView = Backbone.View.extend({
        initialize: function(){
            _.bindAll(this, "render");
            this.rowTemplate =  _.template($("#presentation-row-template").html());
            this.proposals = this.options.proposals;
            this.type = this.options.type;
            
        },
        render: function (){
            var self = this;
            this.$el.html($("#presentation-table-template").html());
            var table = this.$("table tbody");
            _(this.proposals).each(function(proposal){
                table.append((new PresentationRowView({model: proposal, rowTemplate: self.rowTemplate, reorder: false })).render().el);
            });
            return this;
        }
    });




    return PresentationsView;

});



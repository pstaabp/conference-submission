define(['backbone','stickit','jquery-truncate','jquery-ui'], function(Backbone){
    var PresentationsView = Backbone.View.extend({
        initialize: function(options){
            _.bindAll(this, "render");
            this.parent = options.parent;
            
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
        initialize: function(options){
            _.bindAll(this,"render","reorder");
            this.parent = options.parent;
            this.proposals = options.proposals;

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
        initialize: function(options){
            _.bindAll(this, "render");
            this.rowTemplate =  _.template($("#presentation-row-template").html());
            this.proposals = options.proposals;
            
        },
        render: function (){
            var self = this;
            this.$el.html($("#presentation-table-template").html());
            var posterTable = this.$("table tbody");
            _(this.proposals).each(function(proposal,i){
                if(proposal.get("session")===""){
                    proposal.set({session: "P"+ (i<9?"0"+ (i+1): (i+1))});
                }
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
        initialize: function (options){
            _.bindAll(this, "render","showHideDetails");
            this.rowTemplate = options.rowTemplate;
            this.reorder = options.reorder;
            this.model.on("change:session",this.render);
        },
        render: function(){
            this.$el.html(this.rowTemplate({reorder: this.reorder}));
            this.$el.attr("id",this.model.cid);
            this.stickit();
            return this;
        },
        events: {"click button.showDetails": "showHideDetails"},
        bindings: {".title": "title",
    				".author": "author",
    				".session": "session"},
        showHideDetails: function (evt){
            if($(evt.target).text()==="Show Details"){
                $(evt.target).text("Hide Details");
                this.$el.after(new PresentationDetailView({model: this.model}).render().el);
            } else {
                $(evt.target).text("Show Details");
                this.$el.next().remove();
            }  
        }

    });

	var PresentationView = Backbone.View.extend({
        initialize: function(options){
            _.bindAll(this, "render");
            this.rowTemplate =  _.template($("#presentation-row-template").html());
            this.proposals = options.proposals;
            this.type = options.type;
            
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

     var PresentationDetailView = Backbone.View.extend({
        tagName: "tr",
        className: "presentation-detail-row",
        render: function(){
            var row = $("<td colspan='5'></td>");
            row.html($("#presentation-details-template").html());
            this.$el.html(row);
            this.$el.data("id",this.model.id);
            this.stickit();
            return this;
        },
         bindings: {".accepted": "accepted",
                ".author": "author",
                ".session": "session",
                ".type": "type",
                ".title": "title",
                ".sponsor-name": "sponsor_name",
                ".sponsor-email": "sponsor_email",
                ".sponsor-dept": "sponsor_dept",
                ".use-human-subjects": "use_human_subjects",
                ".use-animal-subjects": "use_animal_subjects",
                ".proposal-content": "content",
                ".sponsor-statement": "sponsor_statement"
        },    
    });




    return PresentationsView;

});



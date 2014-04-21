define(['backbone','models/Feedback','bootstrap'], function(Backbone,Feedback){

    var JudgeScheduleView = Backbone.View.extend({
        initialize: function(options){
            _.bindAll(this,"render","showPosters","showOrals");
            this.proposals = options.proposals;
            this.judges = options.judges; 
            this.sessionNames = "ABCDEFGHIJKL";
            this.judgeTemplate = _.template($("#judges-schedule-row-template").html());
        },
        render: function () {
            this.$(".posters,.orals").css("display","none");
            var viewType =  $("input[name='jsview']:checked").val();
            this.$("."+viewType).css("display","block");

            if(viewType==="orals") {this.showOrals();}
            else if (viewType==="posters"){this.showPosters();}
        },
        events: {"change input[name='jsview']": "render",
                "click .remove-judge": "removeJudgeFromSession"},
        removeJudgeFromSession: function(evt){
            
            var judgeID = $(evt.target).data("judgeid");
            var judge= this.judges.get(judgeID);
            
            var sessionName = $(evt.target).data("session");
            var prop = this.proposals.findWhere({session: $(evt.target).data("session")});
            var feedback = prop.get("feedback").findWhere({judge_id: judge.id});
            prop.get("feedback").remove(feedback);
            prop.save();
            this.render();
        },
        showPosters: function () {
            var self = this;

            var posterTemplate = _.template($("#judges-schedule-poster-row").html());
            
            this.$(".posters tbody").html("<tr><td><ul class='all-judge-list'></ul></td><td colspan='8'></td></tr>");

            var judges = this.judges.filter(function(judge){ 
                    return (judge.get("type")==="poster") || (judge.get("type")==="either"); });

            var posters = _(this.proposals.filter(function(prop) { return prop.get("type")==="Poster Presentation";}))
                    .sortBy("session");

            for(var i=0; i<posters.length; i+=4){
                var rowString = "<tr>";
                for(var j=0; j<4;j++){
                    if(i+j>=posters.length) { break;}
                    rowString += posterTemplate(posters[i+j].attributes);
                }
                rowString += "</tr>";
                self.$("div.posters table tbody").append(rowString);
            }

            // Add the judges to each session

            _(posters).each(function(poster,i){
                var _sessionName = poster.get("session");
               _(poster.get("feedback").pluck("judge_id")).each(function(id){
                    var judge = self.judges.get(id);
                    if(judge){
                        var obj = {};
                        _.extend(obj,judge.attributes,{cid: judge.cid, removable: true, sessionName: _sessionName});
                        $(".poster-judge[data-session='" + _sessionName + "'] ul").append(self.judgeTemplate(obj));    
                    }
               });

            });

            this.$(".all-judge-list").parent().attr("rowspan",parseInt(Math.floor(posters.length/4)+2));
            this.listAllJudges();

            this.$(".judge-popover").popover().draggable({revert: true});
            this.$(".poster-judge").droppable({
                hoverClass: "ui-session-highlight",
                scroll: true,
                helper: "clone",
                drop: function( event, ui ) {  
                    var _sessionName = $(event.target).data("session");
                    var judge = self.judges.get($(ui.draggable).data("judgeid"));
                    var _proposal = self.proposals.findWhere({session: _sessionName});
                    var _feed = _proposal.get("feedback").findWhere({judge_id: judge.id});
                    if(typeof(feed)==="undefined"){
                        _proposal.get("feedback").add(new Feedback({judge_id: judge.id}));
                        _proposal.save();
                    }

                    var obj = {};
                    _.extend(obj,judge.attributes,{cid: judge.cid,removable: true, sessionName: _sessionName});
                    $(event.target).children("ul").append(self.judgeTemplate(obj));
                    $(ui.draggable).popover("disable");
                    // determine the number of sessions the judge has 
                    var numProps = 0;
                    self.proposals.each(function(prop){ 
                        prop.get("feedback").each(function(feed){ 
                            if(feed.get("judge_id")===judge.id){
                                numProps++;}
                            })
                    });

                    if(numProps>1){
                        self.$("ul.all-judge-list li[data-judgeid='"+judge.get("_id") + "']").removeClass("no-sessions")
                    }
                }
            });


        },
        showOrals: function (){
            var self = this;
            // Need to empty all of the ul's in the table. 
            this.$("ul").html("");
            for(var i =0; i<this.sessionNames.length;i++){
                this.renderSession(i);
            }
            this.listAllJudges();

            this.$(".judge-popover").popover().draggable({revert: true});
            this.$(".session").droppable({
                hoverClass: "ui-session-highlight",
                drop: function( evt, ui ) { 
                    var sessionNumber = $(evt.target).attr("id").charCodeAt(0)-65; 
                    var sessionRE = new RegExp("OP\-"+sessionNumber+"\-");
                    var props = self.proposals.filter(function(prop){ return sessionRE.test(prop.get("session"));});
                    var judge = self.judges.get($(ui.draggable).data("judgeid"));
                    
                    _(props).each(function(_proposal){
                        _proposal.get("feedback").add(new Feedback({judge_id: judge.id}));
                        _proposal.save();
                    })
                    self.renderSession(sessionNumber);
                    self.$("ul.all-judge-list li[data-judgeid='"+judge.get("_id") + "']").removeClass("no-sessions")
                }
            });
        },
        renderSession: function(sessionNumber){
            var ul = this.$("td#"+this.sessionNames[sessionNumber]+" ul").empty();
            var self = this; 
            var sessionRE = new RegExp("OP\-"+sessionNumber+"\-");
            var props = self.proposals.filter(function(prop){ return sessionRE.test(prop.get("session"));});
            var judges = [];
            _(props).each(function(_proposal){
                judges.push(_proposal.get("feedback").pluck("judge_id"));
            });
            judges = _(judges).chain().flatten().uniq().compact().value();
            _(judges).each(function(id){
                var judge = self.judges.get(id);
                var obj = {};
                _.extend(obj,judge.attributes,{cid: judge.cid,removable: false});
                ul.append(self.judgeTemplate(obj));
            });
        },
        listAllJudges: function(){
            var self = this; 
            var judgeListCell = this.$(".all-judge-list").empty();
            var judgeTemplate = $("#judge-template").html();
            this.judges.each(function(judge){
                judgeListCell.append( new JudgeView({model: judge,template: judgeTemplate, proposals: self.proposals}).render().el);
            });

        }
    });

    var JudgeView = Backbone.View.extend({
        tagName: "li",
        className: "judge-popover",
        initialize: function(opts){
            this.template = opts.template; 
            this.proposals = opts.proposals;
        },
        render: function(){
            var self = this;
            this.$el.html(this.template);
            this.$el.attr("data-judgeid",this.model.id);
            var numProps = 0;
            this.proposals.each(function(prop){ 
                prop.get("feedback").each(function(feed){ 
                    if(feed.get("judge_id")===self.model.id){
                        numProps++;}
                    })
            });
            if(numProps<2){
                this.$el.addClass("no-sessions");
            }
            this.stickit();
            return this;
        },
        bindings: {
            ".name": "name"
        }
    })

    return JudgeScheduleView;
});
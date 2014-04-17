define(['backbone','bootstrap'], function(Backbone){

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
            var sessions = judge.get("sessions");
            var sessionName = $(evt.target).data("session");
            judge.set({sessions: _(sessions).without(sessionName)});

            judge.save();
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
                var sessionJudges = _(judges).filter(function(judge) { return _(judge.get("sessions")).contains(_sessionName)});
               
                _(sessionJudges).each(function(judge) {
                    var obj = {};
                    _.extend(obj,judge.attributes,{cid: judge.cid, removable: true, sessionName: _sessionName});
                    $(".poster-judge[data-session='" + _sessionName + "'] ul").append(self.judgeTemplate(obj));
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
                    var _sessions = judge.get("sessions");
                    _sessions.push(_sessionName);

                    judge.set({sessions: _sessions});
                    judge.save();

                    var obj = {};
                    _.extend(obj,judge.attributes,{cid: judge.cid,removable: true, sessionName: _sessionName});
                    $(event.target).children("ul").append(self.judgeTemplate(obj));
                    $(ui.draggable).popover("disable");
                    if(judge.get("sessions").length>1){
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
                    judge.set({sessions: _(props).map(function(p) { return p.get("session");})});
                    judge.save();
                    self.renderSession(sessionNumber);
                    self.$("ul.all-judge-list li[data-judgeid='"+judge.get("_id") + "']").removeClass("no-sessions")
                }
            });
        },
        renderSession: function(sessionNumber){
            var ul = this.$("td#"+this.sessionNames[sessionNumber]+" ul").empty();
            var self = this; 
            var sessionRE = new RegExp("OP\-"+sessionNumber+"\-");
            var judges = this.judges.filter(function(j) { return _(j.get("sessions")).some(function(s){ return sessionRE.test(s);});});
            _(judges).each(function(judge){
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
                judgeListCell.append( new JudgeView({model: judge,template: judgeTemplate}).render().el);
            });

        }
    });

    var JudgeView = Backbone.View.extend({
        tagName: "li",
        className: "judge-popover",
        initialize: function(opts){
            this.template = opts.template; 
        },
        render: function(){
            this.$el.html(this.template);
            this.$el.attr("data-judgeid",this.model.get("_id"));
            if(this.model.get("sessions").length<2){
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
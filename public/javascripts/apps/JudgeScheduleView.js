define(['backbone','bootstrap'], function(Backbone){

    var JudgeScheduleView = Backbone.View.extend({
        initialize: function(options){
            _.bindAll(this,"render","showPosters","showOrals");
            this.parent = options.parent;
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
            var judge= this.parent.judges.get(judgeID);
            var sessions = judge.get("session");
            var sessionName = $(evt.target).data("session");
            judge.set({session: _(sessions).without(sessionName)});

            judge.save();
            this.render();
        },
        showPosters: function () {
            var self = this;

            var posterTemplate = _.template($("#judges-schedule-poster-row").html());
            var judgeTemplate = _.template($("#judges-schedule-row-template").html());

            
            this.$(".posters tbody").html("<tr><td><ul id='judge-list-poster'></ul></td><td colspan='8'></td></tr>");

            var judges = this.parent.judges.filter(function(judge){ 
                    return (judge.get("type")==="poster") || (judge.get("type")==="either"); });

            var sessionNames = "ABCDEFGHIJKL";

            var posters = _(this.parent.proposals.filter(function(prop) { return prop.get("type")==="Poster Presentation";}))
                    .sortBy(function(poster){ return poster.get("session");});

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
                var _sessionName = (i)<9?"P0"+(i+1):"P"+(i+1);
                var sessionJudges = _(judges).filter(function(judge) { return _(judge.get("session")).contains(_sessionName)});
               
                _(sessionJudges).each(function(judge) {
                    var obj = {};
                    _.extend(obj,judge.attributes,{cid: judge.cid, removable: true, sessionName: _sessionName});
                    $(".poster-judge[data-session='" + _sessionName + "'] ul").append(judgeTemplate(obj));
                });
            });

            var judgeListCell = this.$("#judge-list-poster");
            judgeListCell.parent().attr("rowspan",parseInt(Math.floor(posters.length/4)+2));
            _(judges).each(function(judge){  
                var obj = {};
                _.extend(obj,judge.attributes,{cid: judge.cid,removable: false});
                judgeListCell.append(judgeTemplate(obj));
            });


            this.$(".judge-popover").popover().draggable({revert: true});
            this.$(".poster-judge").droppable({
                hoverClass: "ui-session-highlight",
                scroll: true,
                helper: "clone",
                drop: function( event, ui ) {  
                    console.log("dropped"); 
                    $(ui.draggable).removeClass("no-sessions"); 
                    
                    var _sessionName = $(event.target).data("session");
                    var judge = self.parent.judges.get($(ui.draggable).data("judgeid"));
                    var _sessions = judge.get("session");
                    _sessions.push(_sessionName);

                    judge.set({session: _sessions});
                    judge.save();

                    var obj = {};
                    _.extend(obj,judge.attributes,{cid: judge.cid,removable: true, sessionName: _sessionName});
                    $(event.target).children("ul").append(judgeTemplate(obj));
                }
            });


        },
        showOrals: function (){
            var self = this;

            // Need to empty all of the ul's in the table. 

            this.$("ul").html("");

            var template = _.template($("#judges-schedule-row-template").html());
            var judgeListCell = this.$("#judge-list-oral"); 
            var judges = this.parent.judges.filter(function(judge){ return (judge.get("type")==="oral") || (judge.get("type")==="either"); });

            var sessionNames = "ABCDEFGHIJKL";

            _(judges).each(function(judge){  
                var obj = {};
                _.extend(obj,judge.attributes,{cid: judge.cid,removable: false});
                judgeListCell.append(template(obj));
                for(var i =0; i<sessionNames.length;i++){
                    if (_(judge.get("session")).contains(sessionNames[i])) {
                        obj["removable"]=true;
                        obj["sessionName"] = sessionNames[i];
                        self.$("#"+sessionNames[i]+ " ul").append(template(obj));
                    }
                }
            });





            this.$(".judge-popover").popover().draggable({revert: true});
            this.$(".session").droppable({
                hoverClass: "ui-session-highlight",
                drop: function( event, ui ) {  
                    console.log("dropped"); 
                    var _sessionName = $(ui.draggable).data("session"); 
                    var judge = self.parent.judges.get($(ui.draggable).data("judgeid"));
                    var _sessions = judge.get("session");
                    _sessions.push($(event.target).attr("id"));
                    judge.set({session: _sessions});
                    judge.save();
                    var obj = {};
                    _.extend(obj,judge.attributes,{cid: judge.cid, removable: true, sessionName: _sessionName});
                    $(event.target).children("ul").append(template(obj));
                    $(ui.draggable).removeClass("no-sessions");   

                }
            });
        }
    });

    return JudgeScheduleView;
});
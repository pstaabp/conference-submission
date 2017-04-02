define(['backbone'],function(Backbone){

  var ScheduleView = Backbone.View.extend({
    sessions: ["ABCDE","GHIJK"],
    initialize: function(opts){
      _(this).extend(_(opts).pick("users","proposals"));
    },
    render: function(){
      var self = this;
      this.$el.html($("#schedule-template").html());
      var opRE = /OP-(\d)-(\d)/;
      // Print Session 1
      var session1_presentations = this.proposals.filter(function(_prop){
        var match = opRE.exec(_prop.get("session"));
        return match?match[1]<6:false;
      });
      this.$("#schedule-table tbody").append("<tr><td colspan='9'>Session 1, 9am-10am</td></tr>");
      _(session1_presentations).each(function(_prop){
        self.$("#schedule-table tbody").append(new ScheduleRowView({model: _prop}).render().el);
      })
    }
  });

  var ScheduleRowView = Backbone.View.extend({
    tagName: "tr",
    initialize: function(opts){

    },
    render: function(){
      this.$el.html("<td>" + this.model.get("title") + "</td>");
      return this;
    }
  });

  return ScheduleView;
});

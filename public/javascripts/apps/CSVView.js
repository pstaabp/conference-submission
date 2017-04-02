define(['backbone'], function(Backbone){

    var CSVView = Backbone.View.extend({
      initialize: function(opts){
        _(this).extend(_(opts).pick("users","proposals"));
      },
      csvify: function(arr){
        return _(arr).map(function(_element){
          var el = _.isUndefined(_element)?'': _element.toString();
          return '"' + el.replace(/"/g,'""') + '"';
        }).join(",");
      },
      render: function(){
        var self = this;
        this.$el.html($("#csv-template").html());
        var ta = this.$("#proposals-textarea");
        var str = '"Title","Author","Other Authors","Type","To be Judged","Sponsor","Sponsor Department"\n';
        this.proposals.each(function(_prop){
          var author = self.users.findWhere({_id: _prop.get("author_id")});
          var sponsor = self.users.findWhere({_id: _prop.get("sponsor_id")});

          var prop_array = [_prop.get("title"),
              author.get("first_name") + " " + author.get("last_name"),
              _(_prop.get("other_authors")).map(function (_fc){
                  var _oauthor = self.users.findWhere({falconkey: _fc});
                  return _oauthor.get("first_name") + " " + author.get("last_name");
              }).join(","),
              _prop.get("type"),
              _prop.get("to_be_judged"),
              sponsor.get("first_name") + " " + sponsor.get("last_name"),
              sponsor.get("department")];
          str += self.csvify(prop_array) + "\n";
        });
        $(ta).text(str);
        var _mimetype = "text/csv";
        var blob = new Blob([str], {type:_mimetype});
        var _url = URL.createObjectURL(blob);
        var csv_template = _.template($("#csv-url-template").html());
        this.$("#url-to-csv").html(csv_template({url: _url}));
        //<a href="blob:https://webwork.fitchburgstate.edu/c3252531-64f8-46dd-97f2-9ab02a01bbe9" download="Math1300-0406_Spring2017-classlist-04-02-2017.csv">Save the classlist file</a>
      }


    });

    return CSVView;
});

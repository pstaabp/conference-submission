define(['backbone','stickit'], function(Backbone){
    
    var common = {
        getParameterByName: function(name)
        {
          name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
          var regexS = "[\\?&]" + name + "=([^&#]*)";
          var regex = new RegExp(regexS);
          var results = regex.exec(window.location.search);
          if(results == null)
            return "";
          else
            return decodeURIComponent(results[1].replace(/\+/g, " "));
        },
        proposalParams : [{class: ".session", field: "session"},{class:".title",field: "title"},
          {class: ".sponsor-name", field: "sponsor_name"}, {class: ".sponsor-email", field: "sponsor_email"},
          {class: ".sponsor-dept", field: "sponsor_dept"}, {class: ".type", field: "type"}]

    }

  Backbone.Stickit.addHandler({
    selector: "td[contenteditable='true']",
    events: ['blur']
  });

    return common;

});

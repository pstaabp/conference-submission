define(['Backbone'], function(Backbone){
    
    var common = {
    	logout: function (evt) {
		    evt.preventDefault();
		    if (confirm('Are you sure you want to log out?')) {
		      var element = $(this),
		          form = $('<form></form>');
		      form.attr({method: 'POST',action: '/conference-submission/sessions'})
        		  .hide()
        		  .append('<input type="hidden" />')
        		  .find('input')
        		  .attr({'name': '_method','value': 'delete'})
        		  .end()
        		  .appendTo('body')
                  .submit();
    		}
    		return false;
        },
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

    return common;

});

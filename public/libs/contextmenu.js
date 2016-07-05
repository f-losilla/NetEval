/*global $*/
/*global graph*/
/*global newNode*/

$(document).ready(function() {
    $("#svf-canvas").bind("contextmenu", function (event) {
        
        // Avoid the real one
        event.preventDefault();
console.log(event.pageY);        
        
        var offset = $("#svf-canvas:first").offset();
        

        // Show contextmenu
        $(".custom-menu").finish().toggle(100).
        
        
        // In the right position (the mouse)
        css({
            top: (event.pageY - offset.top) + "px",
            left: (event.pageX - offset.left) + "px"
        });
    });
    
    
    // If the document is clicked somewhere
    $(document).bind("mousedown", function (e) {
        
        // If the clicked element is not the menu
        if (!$(e.target).parents(".custom-menu").length > 0) {
    
            // Hide it
            $(".custom-menu").hide(100);
        }
    });
    
    
    // If the menu element is clicked
    $(".custom-menu li").click(function(){
        // This is the triggered action name
        var action  = $(this).attr("data-action");
        switch(action) {
            
            // A case for each action. Your actions here
            case "dhcp":
            case "internet":
            case "router":
            case "captive":
            case "radius":
            case "switch":
            case "wireless-link":
            case "ap":
            case "vap":
            case "_aux_":
                graph.addNode(newNode(action)); 
                break;
            case "new-link": 
                console.log("new-link");
                var nodes_to_link = [];
                $(".node.selected").each(function (i, n){
                    nodes_to_link.push(this.id.slice(2));
/*                    if (nodes_to_link.length<2) {
                        
                        var id = [].push(n).attr("id").slice(2);
                        nodes_to_link.push(id);
                    }
                    */
                });
                console.log(nodes_to_link);
                if (nodes_to_link.length === 2) graph.addLink(nodes_to_link[0], nodes_to_link[1], {"vlan": ""}); 
                break;
            case "delete-link":
                var nodes_to_unlink = [];
                $(".node.selected").each(function (i, n){
                    nodes_to_unlink.push(this.id.slice(2));
                });
                if (nodes_to_unlink.length === 2) graph.removeLinks(nodes_to_unlink[0], nodes_to_unlink[1]);
                else alert ("You must select two nodes");
                break;
            case "delete-nodes":
                $(".node.selected").each(function (i, n){
                    graph.removeNode(this.id.slice(2));
                });
        }
      
        // Hide it AFTER the action was triggered
        $(".custom-menu").hide(100);
    });
    
    /*$.getScript("https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js", function(){

   alert("Script loaded but not necessarily executed.");

});*/
    
    // http://stackoverflow.com/questions/18706896/place-a-form-within-popover-in-bootstrap-3
/*    $('.popover-graph').popover({ 
        html : true,
        title: function() {
          return "Edit node"; // quitar función
        },
        content: function() {
            var html="";
            var new_object={};
            for (var key in this.__data__){
                if (key != "x" && key!= "y"){
                    new_object[key] = this[key];
                }
                //html+="{'"+key+"': " + "'"+ this[key] +"'"
                html = JSON.stringify(new_object);
            }
          //return $("#popover-content").html();
          console.log("popover text = " + html);
          return html;
        }
    });*/

});



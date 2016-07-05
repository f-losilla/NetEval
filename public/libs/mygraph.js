var nodes;
var links;

/*global lang*/
/*global d3*/
/*global $*/

function myGraph(el) {

    // Add and remove elements on the graph object
    this.addNode = function (node) {
        return addNode(node);
    }
    var addNode = function (node) {
        if ($.isEmptyObject(node)){
            console.log("Error trying to add empty node");
            return;
        }
        if (node.id ==null)
            node.id=max_id++;
        else if (node.id>=max_id) max_id = node.id+1;
//console.log("Añadiendo nodo con id =" + node.id + " type = " + node.type );        
        nodes.push(node);
//console.log(" en la posición " + nodes.indexOf(node))        
        update();
    }


    this.removeNode = function (id) {
        var i = 0;
        var n = findNode(id);
        while (i < links.length) {
            if ((links[i]['source'] === n)||(links[i]['target'] == n)) links.splice(i,1);
            else i++;
        }
        var index = findNodeIndex(id);
        if(index !== undefined) {
            nodes.splice(index, 1);
            update();
        }
    }
    
    this.getNodes = function (){
        return nodes;
    }

    this.getLinkByNodes = function(source, target){
        var sid = source.id;
        var tid = target.id;
        var link = null;

        links.forEach(function (l){
           if ((l.source.id == sid && l.target.id == tid) || (l.source.id == tid && l.target.id == sid )){
            link = l;
           }
        });
        return link;
    }

    // remove all links between source(id) and target(id) (bidirectional)
    this.removeLinks = function(sourceId, targetId){
        var removed = false;
        links.forEach(function (l, i){
            if ((sourceId == l.source.id && targetId == l.target.id) || (sourceId == l.target.id && targetId == l.source.id)) {
                links.splice(i, 1);
                removed = true;
            }
            if (removed) update();
        })
    }
    
    this.addLink = function (sourceId, targetId, prop_obj) {
        return addLink(sourceId, targetId, prop_obj);
    }
    var addLink = function (sourceId, targetId, prop_obj) {        
        var sourceNode = findNode(sourceId);
        var targetNode = findNode(targetId);
        var link;
console.log("prop_obj")
console.log(prop_obj)
        if((sourceNode !== undefined) && (targetNode !== undefined)) {
            link = {"source": sourceNode, "target": targetNode};
            for(var key in prop_obj)
                link[key] = prop_obj[key];
            links.push(link);
            update();
        }
    }
    
    this.getLinks = function (){
        return links;
    } 
    this.editNode = function (id, props){
        return editNode(id, props);
    }
    
    this.getNodeById = function(id){
        return findNode(id);
    }
    
    this.findConnectedByType = function (id, type) {
        return findConnectedByType(id, type);
    }
    
    var editNode = function(id, props){
        var node = findNode(id);
        for (var key in props){
            node[key] = props[key];
        }
    }

    var findNode = function (id) {
        for (var i=0; i < nodes.length; i++) {
            if (nodes[i].id == id)
                return nodes[i]
        };
    }

    var findNodeIndex = function (id) {
        for (var i=0; i < nodes.length; i++) {
            if (nodes[i].id == id)
                return i
        };
    }
    
    var findLink = function(sid, tid){
        for (var i=0; i < links.length; i++) {
            if ( (links[i].source.id == sid) && (links[i].target.id == tid))
                return links[i];
        }
    }
    
    var findConnectedByType = function(id, type){
        for (var i=0; i < links.length; i++) {
            if ( (links[i].source.id == id) && (links[i].target.type == type))
                return links[i].target;
            if ( (links[i].target.id == id) && (links[i].source.type == type))
                return links[i].source;
        }
    }
    
    var editLink = function(sid, tid, props){
        var link = findLink(sid, tid);
        for (var key in props){
            link[key] = props[key];
        }
    }
    
    //will be removed in the future
    this.nodeReapair = function (){
        return nodeReapair();
    }
    var nodeReapair = function (){
        if (nodes != null){
            nodes.forEach(function (n){
                if ("tx-pow" in n) {
                    n["tx-pow(dBm)"] = n["tx-pow"];
                    delete n["tx-pow"];
                    console.log("arreglado nodo " + n.id);
                }
            });
        
        }
    }
    
    var xhr;
    this.loadSubmission = function(url){
//console.log("myFunction")     
         xhr = new XMLHttpRequest();
    
         xhr.open("GET", url, true);
         xhr.setRequestHeader("Content-type", "application/json");
         xhr.onreadystatechange = function () { 
             var json;
             if (xhr.readyState == 4 && xhr.status == 200) {
                 json = JSON.parse(xhr.responseText);
    //             console.log(json)
                  json.network.nodes.forEach(function(n) {
            console.log("añadiendo node")
                    addNode(n);
                  });
      
                  json.network.links.forEach(function (l){
                      addLink(l.source, l.target, {"vlan": l.vlan});
                  });
                  
                  nodeReapair();
                  //problem = json.challenge;
                  
    //              if ("teacher_mode" in json && json["teacher_mode"]  == true) teacher_mode=true;
    //              else teacher_mode = false;
    //                teacher_mode = <%= set_teacher_mode %>; // allow or disallow submitting
    
             } else if (xhr.readyState == 4 && xhr.status != 200) {
                 //json = JSON.parse(xhr.responseText);
                  
                  console.log(xhr.responseText);
                   // console.log(xhr.status)
                   // alert("Error al cargar los datos:" +  xhr.responseText);
             }
         }
         xhr.send();
    }
 

    // set up the D3 visualisation in the specified element
    var w = $(el).innerWidth(),
        h = $(el).innerHeight();
        
    var icon_width = 40;
    var icon_height = 40;
    
    var second_selected_node = null;
    
    var max_id = 0;

    var vis = this.vis = d3.select(el).append("svg:svg")
        .attr("width", w)
        .attr("height", h);
        // THIS MAY BE THROWING A WARNING AND COULD STOP WORKING
        // TRY UPDATING JQUERY VERSION OR SET SIZE IN A DIFFERENT WAY
        
    var links_group = vis.append("g")
                   .classed("links", true);
    var nodes_group = vis.append("g")
                   .classed("nodes", true);



    var update = function () {

/*
        var node = nodes_group.selectAll("g.node")
            .data(nodes, function(d) { return d.id;});

        var nodeEnter = node.enter().append("g")
*/
        var link = links_group.selectAll("g.link")
            .data(links, function(d) { return d.source.id + "-" + d.target.id; });
 
        var linkEnter = link.enter().append("g")
            .classed("link popover-graph new", true);
//prueba
        linkEnter.append("svg:line")
            .attr("class", "link")
            .attr("stroke-width", 8)
            .style("stroke", "rgb(255,255,255)");


// fin de prueba
        linkEnter.append("svg:line")
            .attr("class", "link")
            .attr("stroke-width", 2)
            .style("stroke", "rgb(6,120,155)");
/*            .attr("x1", function(d) { return d.source.x })
            .attr("y1", function(d) { return d.source.y })
            .attr("x2", function(d) { return d.target.x })
            .attr("y2", function(d) { return d.target.y })
*///            .style("stroke", "rgb(6,120,155)");

        linkEnter.append("svg:text")
            .attr("class", "nodetext");
            
//        link.selectAll("text")    
/*            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; })
*///            .attr("dx", function(d) { return -3*d.type.length; })
//            .attr("dy", icon_height/2+5)
//            .text(function(d) {return d.vlan});


          link.selectAll("line")
            .attr("x1", function(d) { return d.source.x })
            .attr("y1", function(d) { return d.source.y })
            .attr("x2", function(d) { return d.target.x })
            .attr("y2", function(d) { return d.target.y });
        
        link.selectAll("text")
            .attr("x",  function(d) { return (d.source.x + d.target.x)/2 })
            .attr("y",  function(d) { return (d.source.y + d.target.y)/2 })
            .text(function (d){return d.vlan});
            
        ;
            


/*        link.attr("x1", function(d) { return d.source.x })
            .attr("y1", function(d) { return d.source.y })
            .attr("x2", function(d) { return d.target.x })
            .attr("y2", function(d) { return d.target.y });
*/
//        link.append("text")
//            .attr("class", "nodetext")
/*            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; })*/
//            .attr("dx", function(d) { return -3*d.type.length; })
//            .attr("dy", icon_height/2+5)
//            .text(function(d) {return d.type});

        link.exit().remove();

        var node = nodes_group.selectAll("g.node")
            .data(nodes, function(d) { return d.id;});

        var nodeEnter = node.enter().append("g")
/*            .attr("class", "node")
*/
            .classed("node popover-graph new", true)
            .attr("id", function(d) { return "id"+d.id; })
            .attr("transform", function (d){ return "translate("+d.x+" "+d.y+")"})
            .on("click", click)
            .call(drag);

        nodeEnter.append("svg:circle")
            .attr("class", "background")
/*            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })*/
            .attr("r", function(d) {return Math.sqrt((icon_height/2)*(icon_height/2)+(icon_width/2)*(icon_width/2))+10;})
            .attr("fill", "#DEF");
            
        nodeEnter.append("svg:image")
            .attr("class", "icon")
/*            .attr("xlink:href", "img/descarga.jpg")*/
            .attr("xlink:href", function(d) {return "/img/" + d.type+".png";})
            .attr("x", function(d) { return -icon_width/2; })
            .attr("y", function(d) { return - icon_height/2; })
/*            .attr("x", function(d) { return d.x -icon_width/2; })
            .attr("y", function(d) { return d.y - icon_height/2; })*/
            .attr("width", icon_width)
            .attr("height", icon_height);

        nodeEnter.append("text")
            .attr("class", "nodetext")
/*            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; })*/
            .attr("dx", function(d) { return -3*d.type.length; })
            .attr("dy", icon_height/2+5)
            .text(function(d) {return d.type});

        node.exit().remove();
        
        // adds double click event listener only for new nodes
        $(".node.new").dblclick(populatePropertyEditor);
        $(".link.new").dblclick(populatePropertyEditor);
        
        nodeEnter.classed("new", false);
        linkEnter.classed("new", false);


        //https://adilapapaya.wordpress.com/2014/04/11/twitter-bootstrap-tooltips-and-svg/
    
        // title: compulsary if you want a non-empty tooltip
        //d3.selectAll('.popover-graph').attr('title','Item properties');
        d3.selectAll('.popover-graph').attr('title', function (d){
            var str = lang.ui.ITEM_PROPS_TITLE;
            if ("id" in d){
                str += " id = " +d.id;
            }
            return str;
        });
         
        // erase?
        $('.popover-graph').popover({
           'trigger':'hover'
           ,'container': 'body'
           ,'placement': 'top'
           ,'white-space': 'nowrap'
           ,'html':'true'
           ,'content' : viewElementProp
        });
        

    }
    
    
    
    var populatePropertyEditor = function (event){
            var item = event.currentTarget;
            var item_data = item.__data__;
            var table = $("#property-editor table tbody");
            var isEmpty = true;
            
            // make sure it works for different browsers
            event = event || window.event;
            
            table.empty();
            for (var key in item_data) 
                if (key != "x" && key!= "y" && key!= "id" && key != "type" && key != "source" && key != "target"){
                    table.append("<tr><td>" + key + "</td> <td> <input type='text' id='"+key+"_value' value='" + item_data[key] + "'></td></tr>");
                    isEmpty = false;
                }
            if (isEmpty) $("#changePropBtn").css("display", "none");
             //else

             {
                $("#changePropBtn").css("display", "block");
                if ("id" in item_data && "type") {
                    console.log(item_data)
                    $("#property-editor-title").text(lang.ui.NODE_PROPS_TITLE + " (node id = " + item_data["id"] + ", type = " +item_data["type"] + ")");
                } else if ("source" in item_data && "target" in item_data){
                    $("#property-editor-title").text(lang.ui.LINK_PROPS_TITLE + " (nodes id =" + item_data["source"].id + " --- " + item_data["target"].id +")");
                } else 
                    $("#property-editor-title").text(lang.ui.ITEM_PROPS_TITLE);
            }
                    
            //show 
            $("#property-editor").css("display", "block");
            if ("source" in item_data){
                // link
                $("#changePropBtn").attr("onclick", "graph.changeLinkProps(" + item_data.source.id + ","+item_data.target.id +")");
            } else //node
                $("#changePropBtn").attr("onclick", "graph.changeProps(" + item_data.id + ")");

            
        }
    
    // change properties of node id to the values in the text inputs with ids equal to the defined in the first column of the #property editor table concat "_value"
    this.changeProps =  function (id){
        var node = findNode(id);
        if (node == null) return;
        var new_object = {};
        var key, value;
        $("#property-editor tr").each(function(){
            key = $(this).find("td:first").text();
            value = document.getElementById(key+"_value").value;
            new_object[key]=value;
        });
        editNode(id, new_object);
        
        
    }
    
    this.changeLinkProps = function (sid, tid){
        var link = findLink(sid, tid);
        if (link == null) return;
        var new_object = {};
        var key, value;
        $("#property-editor tr").each(function(){
            key = $(this).find("td:first").text();
            value = document.getElementById(key+"_value").value;
            new_object[key]=value;
        });
        editLink(sid, tid, new_object);
        update();
    }
        // show properties of a item(node, link)
    var viewElementProp = function() {
            var html="";
            var new_object={};
            for (var key in this.__data__){
                if (key != "x" && key!= "y" && key!= "id" && key != "type" && key != "source" && key != "target"){
                    html += "<div class='popover-property'>" + key + ": " + this.__data__[key] + "</div>";
                    new_object[key] = this.__data__[key];

                }

            }

          return html;
    }
    
   var click = function (d){
        if ($(this).hasClass('noclick')) {
               $(this).removeClass('noclick');
               return;
        }
        
        var clicked = d3.select("#id"+d.id);
        if ($(this).hasClass('selected')){
            clicked.classed("selected", false);
            second_selected_node = null;
        } else {
            // maximum two selected nodes at a time
            if (second_selected_node != null) second_selected_node.classed("selected",false);
                second_selected_node = vis.select(".selected");
                if (second_selected_node.empty()) second_selected_node=null;
                
                clicked.classed("selected", !clicked.classed("selected"));
        }
    }
    
    var drag = d3.behavior.drag()
        .on("drag", function(d,i) {

            if ((d3.event.y <= 0) || (d3.event.y >= vis.attr("height"))) return;
            if ((d3.event.x <= 0) || (d3.event.x >= vis.attr("width"))) return;

            // is it actually dragging?
            if ( d3.event.dx==0 && d3.event.dy==0 ){
                return;
            }

            // do not execute onclick handler    
            d3.select(this).classed("noclick", true);
            
            d.x += d3.event.dx;
            d.y += d3.event.dy;

            // move the group of elements (image, text...)
            d3.select(this).attr("transform","translate("+d.x+" "+d.y+")");

            update();
      

        });


    update();
}



var max_id=0;
/*var graph;

$(document).ready(function() {
    
    window.d3.json("data/graph.json", function(error, json) {
        if (error) return console.warn(error.toString());
        var data = json;
        nodes=[]; links=[];
        graph = new myGraph("#svf-canvas");
        data.nodes.forEach(function(n) {
            graph.addNode(n);
    
        });


        data.links.forEach(function (l){
            graph.addLink(l.source, l.target, {"vlan": l.vlan});
        });

    });

});*/
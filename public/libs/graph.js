var data; // graph nodes and edges
var vis;
var links = [];
var drag = window.d3.behavior.drag();
var nodes;
var lines;
var text;
var linksLabels;
var max_id=0;


    var drag = d3.behavior.drag()
        .on("drag", function(d,i) {
            if ((d3.event.y <= 0) || (d3.event.y >= vis.attr("height"))) return;
            if ((d3.event.x <= 0) || (d3.event.x >= vis.attr("width"))) return;

              d.x = d3.event.x;
              d.y = d3.event.y;
            

            d3.select(this).attr("cx", d.x).attr("cy", d.y);
            updateLinksVisualization();
            updateText();
            updateLinksLabels();

/*            update();*/
               vis.selectAll("line")
                  .attr("x1", function(d) { return d.source.x })
                  .attr("y1", function(d) { return d.source.y })
                  .attr("x2", function(d) { return d.target.x })
                  .attr("y2", function(d) { return d.target.y })
                  .style("stroke", "rgb(6,120,155)");
                  

        });
        

$(document).ready(function() {
    vis = window.d3.select(".svf-canvas")
                .append("svg");
    vis.attr("width", 1200)
        .attr("height", 1000);
        
    
    window.d3.json("data/graph.json", function(error, json) {
        if (error) return console.warn(error.toString());
    data = json;
    data.nodes.forEach(function(n) {
        if (n.id>max_id) max_id = n;
    });
    
    data.links.forEach(function(l){
      links.push( {"source": data.nodes[l.source], "target": data.nodes[l.target], "vlan": l.vlan } );
    });
      update();
    });
    
    
});

// sustituye al resto de funciones update
function update(){
    vis.selectAll(".nodes")
        .data(data.nodes, function (d){return d._id;})
        .enter()
        .append("circle")
        .attr("class", "nodes")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", "10px")
        .attr("fill", "black")
        .call(drag);

}

function visualizeNewGraph(){
  vis.selectAll(".nodes")
      .data(data.nodes)
      .enter()
      .append("svg:circle")
      .attr("class", "nodes")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", "10px")
      .attr("fill", "black")
      .call(drag);
      
   vis.selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("x1", function(d) { return d.source.x })
      .attr("y1", function(d) { return d.source.y })
      .attr("x2", function(d) { return d.target.x })
      .attr("y2", function(d) { return d.target.y })
      .style("stroke", "rgb(6,120,155)");

  text= vis.selectAll("text")
                   .data(data.nodes)
                   .enter()
                   .append("text");
   updateText();
   
   linksLabels =  vis.selectAll(".link-label")
                    .data(links)
                    .enter()
                    .append("text");
    updateLinksVisualization();
    updateLinksLabels();
}


function updateVisualization(){
     updateNodesVisualization();
     updateLinksVisualization();
     updateLinksLabels();
}

function addNodeToGraph(){
    de.select(".nodes")
}

function updateNodesVisualization(){
            var node = vis.selectAll(".nodes")
            .data(data.nodes, function(d) { return d.id;});
            
    var nodeEnter = node.enter().append("svg:circle")
        .attr("class", "nodes")
        .call(drag);


    d3.selectAll(".nodes")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", "10px")
        .attr("fill", "black");
}

function updateLinksVisualization(){
    vis.selectAll("line")
        .attr("x1", function(d) { return d.source.x })
        .attr("y1", function(d) { return d.source.y })
        .attr("x2", function(d) { return d.target.x })
        .attr("y2", function(d) { return d.target.y })
        .style("stroke", "rgb(6,120,155)");

}

function updateText(){
    var textLabels = text
                       .attr("x", function(d) { return d.x; })
                       .attr("y", function(d) { return d.y; })
                       .text( function (d) { return d.type; })
                       .attr("font-family", "sans-serif").attr("font-size", "20px")
                       .attr("fill", "red");
}

function updateLinksLabels(){
     linksLabels
                       .attr("x", function(d) { return (d.source.x + d.target.x)/2; })
                       .attr("y", function(d) { return (d.source.y + d.target.y)/2; })
                       .text( function (d) { return d.vlan; })
                       .attr("font-family", "sans-serif").attr("font-size", "20px")
                       .attr("fill", "red");
}

var node_properties = [
    {"type" : "dhcp", "start_ip": "", "end_ip": ""},
    {"type": "internet"},
    {"type": "router"},
    {"type": "captive"},
    {"type": "radius"},
    {"type": "switch"},
    {"type": "radio-link", "tx-pow": 100, "gain": 0, "sens": -70},
    {"type": "ap", "essid": ""},
    {"type" : "vap", "essid": ""},
];
      

function insertDefaultNode(type){
    var new_node = node_properties.filter(function(np){ return np.type === type});
    if (new_node.length>0) new_node.id = ++max_id;
    data.nodes.push(new_node[0]);
    updateVisualization();
}



function getData(){
    return vis.selectAll(".nodes").data();
}

// args debe ser un onjeto con los pares clave valor/propiedades que se deben buscar
function findNodes(args){
    var res =[];
    data.nodes.forEach(function (n){
        for (var key in args){
            if ( (key in n) && (n[key] == args[key]) ){
                res.push(n);
            }
        }
    })
    return res;
    
}

function getNodeById(id){
    var node = null;
    var data = getData();
    data.forEach(function(n){
        if (n._id == id) node = n;
    })
    
    return node;
}

function calculateVlanTag(link, prev_tag){
    var prev_tag_int, link_vlan_int;

    if (link.vlan === "t"){
        return prev_tag;
    } 
    prev_tag_int = parseInt(prev_tag);
    link_vlan_int = parseInt(link.vlan);

    if ( (isNaN(prev_tag_int) && isNaN(link_vlan_int)) || (prev_tag_int === link_vlan_int) ) {
        return ""; //mandar paquete sin tag
    } else {
        if (isNaN(prev_tag_int) && (link_vlan_int>0))
            return link.vlan;
        else if (isNaN(link_vlan_int) && (prev_tag_int>0))
            return "not_allowed";
    }
    
    return "not_allowed";
    
}

// devuelve array con los siguientes nodos no visitados, se puede extender la función añadiendo mas
// restricciones (VLANs y no se si alguna mas), se deberia pasar la etiqueta VLAN con la que llegan los
// paquetes y descartar los hops por donde no se pueda mandar y devolver además un array con las etiquetas VLAN
// para cada hop
function getPossibleHops(source, path_ids, vlan_tag){
    var hops = [], vlan_tags = [], tag;
    links.forEach(function(l) {
        var l_source_id = parseInt(l.source._id);
        var l_target_id = parseInt(l.target._id);

        // si no se ha pasada ya por ese nodo...
        if ( (l_source_id == source._id) && (path_ids.indexOf(l_target_id)==-1) ) {
            tag = calculateVlanTag(l, vlan_tag);
            if (tag != "not_allowed")
                hops.push({"node":l_target_id, "vlan_tag": tag});
        } else if ( (l_target_id == source._id) && (path_ids.indexOf(l_source_id)==-1) ){
            tag = calculateVlanTag(l, vlan_tag);
            if (tag != "not_allowed")
                hops.push({"node":l_source_id, "vlan_tag": tag});
        }
    })
    return hops;
}

// comprueba conectividad entre source y target, list_path_ids es array 2D (incialmente [[source._id]]) con los caminos que se van encontrando
// revisar mas adelante el tema de la VLAN para autenticacion
function checkConnectivity(source, target, path_ids, vlan_tag){
    var hops = [];
    var list_path_ids = [[]], new_path_ids = [[]];
    
    // me aseguro de que path_id sea un array y añado el nodo origen si esta vacio
    path_ids = [].concat(path_ids);
    if (path_ids.length == 0) path_ids.push(source._id);
    // idem con vlan_tag
    vlan_tag = typeof vlan_tag !== 'undefined' ? vlan_tag : "";

    hops = getPossibleHops(source, path_ids, vlan_tag);
    
    hops.forEach(function(hop_obj) {
        var hop = hop_obj.node;
        var vlan_t = hop_obj.vlan_tag; 
        
        //editanto vlan_t
        if (hop == target._id && vlan_t=="") {
            new_path_ids = [[hop]];
        }
        else new_path_ids = checkConnectivity(getNodeById(hop), target, path_ids.concat(hop), vlan_t);
        if (new_path_ids[0].length>0){ // si a traves del nodo 'hop' se puede alcanzar el nodo target
            // se añade el nodo actual a todas las rutas encontradas
            new_path_ids.forEach(function (np){
               if (np.length>0) np.unshift(source._id); 
            });
            
            //se juntan las rutas nuevas (por el nodo hop) con las encontradas pasando por otros nodos, si las hay
            while(new_path_ids.length) list_path_ids.push(new_path_ids.shift());
            if (list_path_ids[0].length==0) list_path_ids.shift(); // el primer elemento se quita si esta en blanco (==[[]])

        }
    });
    
    return list_path_ids;
}


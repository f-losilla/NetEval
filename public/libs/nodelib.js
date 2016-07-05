/*global $*/
var default_nodes = {
    "dhcp" : {"x": 20, "y": 20, "type": "dhcp", "start_ip": "", "end_ip": ""},
    "internet" :  {"x": 20, "y": 20, "type": "internet"},
    "router": {"x": 20, "y": 20, "type": "router"},
    "captive": {"x": 20, "y": 20, "type": "captive"},
    "radius" : {"x": 20, "y": 20, "type": "radius", "password": ""},
    "switch" : {"x": 20, "y": 20, "type": "switch"},
    "wireless-link": {"x": 20, "y": 20, "type": "wireless-link", "tx-pow(dBm)": 1, "gain": 10, "sens": -70, "zone": ""},
    "ap": {"x": 20, "y": 20, "type": "ap", "essid": "", "zone": "", "security": "", "password": ""},
    "vap": {"x": 20, "y": 20, "type": "vap", "essid": "", "zone": "", "security": "",  "password": ""},
    "_aux_": {"x": 20, "y": 20, "type": "_aux_"}
}


function newNode(type){
    /*var pattern_node_arr = default_nodes.filter (function (n){return n.type == type});
    var pattern_node = pattern_node_arr[0];*/
    var new_node = {};
    $.extend(new_node, default_nodes[type]);
    return new_node;
}
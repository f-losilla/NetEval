var problem;
//var restrictions;
var msg;
/*global lang*/
/*global $*/
/*global nodes*/
/*global links*/
/*global graph*/
var teacher_mode =false; //teacher mode will not make submissions of the student design to the server 

var debug_mode = false;

// load test data
$(document).ready(function(error, json) {
    
/*    window.d3.json("data/challenge1.json", function(error, json) {
        if (error) return console.warn(error.toString());
        problem = json;
        //$(".formulation").text(problem.description);
    });*/
    
/*    //TODO: mover a otro archivo mas generico
    window.d3.json("data/language_spanish.json", function(error, json) {
        if (error) return console.warn(error.toString());
        msg = json;
    });*/

});

var errors =[];
/*var layer3_nodes =[];       // nodes delimiting broadcast domain
var layer3_nodes_ids = [];
*/
/*
// find layer3 nodes (delimiting broadcast domain)
// fin dhcp_res (dhcp restrictions)
// for every dhcp restriction
    // select all nodes (ap/vap) affected by the restriction (currently by ESSID) --> essid_nodes
    // for each node in essid_nodes(en) check that the IP range is OK
        // for each dhcp node(dn) obtain paths (connectivity) between en and dn 
            // for every path, check if they are in the same broadcast domain
                // if they are in the same bc domain check if the range is ok
    
*/

function checkRestricctions(){
    var layer3_nodes =[];       // nodes delimiting broadcast domain
    var layer3_nodes_ids = [];
    var internet_nodes = [];

    errors =[]; // reset errors
    
    //measuring elapsed time;
    var start = new Date().getTime();

    layer3_nodes = nodes.filter(function(n){
        return (n.type === "router" || n.type === "internet");
    });
    
    layer3_nodes.forEach(function (l3n){
        layer3_nodes_ids.push(l3n.id);
    });
    
    // usar findNode...
    internet_nodes = nodes.filter(function(n) {
        return (n.type == "internet");
    });

    // RADIUS server nodes
    var radiuses = findNodesByProps({"type" : "radius"});
    
    resetRestrictions();
    
    // CHECK GRAPH--------------------------------------------------------------
    // -------------------------------------------------------------------------
    

    var graph_res_arr = filterByProps(problem.restrictions, {"type": "graph"});
    var graph_res;
  

    if (graph_res_arr[0] == null) problem.restrictions.unshift({"desc": "Graph checking", "type": "graph"});

    //if (!("graph" in problem.restrictions)) problem.restrictions.unshift({"desc": "Graph checking", "type": "graph"})
    //var graph_res = filterByProps(problem.restrictions, {"type": "graph"});
    graph_res = problem.restrictions[0];


    startRestriction(graph_res);

    // check that all aux nodes have the same vlan tab in both links (and have no more than two links)
    var map_table_count = {};
    var map_table_tags = {};
    

    // counts how many times every aux node is used (Must be 2) and that vlans for each 2 links connected
    // are the same
    links.forEach(function (l){
        if (l.source.type == "_aux_"){
            var nid = l.source.id + "";
            if (nid in map_table_count) {
                map_table_count[nid]++;
                if (l.vlan != map_table_tags[nid]) logErrorDetails(graph_res, lang.err.GR_AUX_DIFF_VLAN)
            }
            else {
                map_table_count[nid]=1;
                map_table_tags[nid] = l.vlan;
            }
        }
        if (l.target.type == "_aux_"){
            var nid = l.target.id + "";
            if (nid in map_table_count) {
                map_table_count[nid]++;
                if (l.vlan != map_table_tags[nid]) logErrorDetails(graph_res, lang.err.GR_AUX_DIFF_VLAN)
            }
            else {
                map_table_count[nid]=1;
                map_table_tags[nid] = l.vlan;
            }
        }
    }); // end links
 
    for (var nid in map_table_count){
        if (map_table_count[nid] != 2) logErrorDetails(graph_res, lang.err.GR_AUX_NOT_TWO_LINKS + ": node id = " + nid);
    }

    // check that every vap is connected to an ap
    var vaps = filterByProps(nodes, {"type": "vap"});
    vaps.forEach(function (vap){
       if (graph.findConnectedByType(vap.id, "ap") == null) logErrorDetails(graph_res, lang.err.GR_VAP_NO_AP + ": node id = " + vap.id);
    });

    // check that captive portal nodes have two links (ports)
    checkNodePortsAndLogError(graph_res, "captive", 2, lang.err.GR_CAPTIVE_NOT_TWO_PORTS);
    // check that dhcp nodes have two links (ports)
    checkNodePortsAndLogError(graph_res, "dhcp", 1, lang.err.GR_DHCP_NOT_ONE_PORT);
    // check that captive radius nodes have two links (ports)
    checkNodePortsAndLogError(graph_res, "radius", 1, lang.err.GR_RADIUS_NOT_ONE_PORT);
    
    // check that captive portals are not connected to trunk interfaces
    var no_trunk = links.some(function (l){
       if ( (l.source.type == "captive" || l.target.type == "captive" || l.source.type == "internet" || l.target.type == "internet" || l.source.type == "dhcp" || l.target.type == "dhcp" || l.source.type == "radius" || l.target.type == "radius") && (l.vlan == "t" || l.vlan == "trunk" || l.vlan.indexOf(",") != -1 ) ) return true;
    });
    
    if (no_trunk) logErrorDetails(graph_res, lang.err.GR_NO_TRUNK_ALLOWED);
    
    
        
    
    // DHCP v2------------------------------------------------------------------
    // -------------------------------------------------------------------------
    var dhcp_res = problem.restrictions.filter(function(n){
        return n.type === "dhcp";
    });
    

//    console.log(dhcp_res);
    
    dhcp_res.forEach(function(dr){
//console.log("Nueva restriccion dhcp");        
        // errors
        var dh_no_ip = true; 
        var dh_several_dhcps = false;
        var dh_wrong_range = false;
        
        startRestriction(dr);
/*console.log(dr);        */
        // nodes to work with
        var dhcp_ok_nodes = findNodesByProps(dr.dhcp_props);
        var dhcp_other_nodes = findNodesWithoutProps(dr.dhcp_props).filter(function(n){return n.type == "dhcp"});
        var configured_nodes = findNodesByPropsArray(dr.conf_node_props);
  /*      console.log("rest, nodos_ok, nodos_otros, configurados");
        console.log(dr.dhcp_props);
        console.log(dhcp_ok_nodes);
        console.log(dhcp_other_nodes);
        console.log(configured_nodes);
  */      
  
  //BORRAR?
        configured_nodes.forEach(function(cn) {
            
        }); // end configured_nodes.foreach
        
        // todos los nodos deben tener conectividad con un servidor dhcp sin que haya un equipo layer 3 por enmedio (DH_NO_IP, DH_SEVERAL_DHCPS)
        // ningun nodo debe tener conectividad con otro servidor dhcp (DH_WRONG_RANGE)
        if (configured_nodes.length == 0){
            logErrorDetails(dr, lang.err.DH_NO_NODE_TO_CONFIGURE + ": " + JSON.stringify(dr.conf_node_props));
        } else if (dhcp_ok_nodes.length == 0){
            logErrorDetails(dr, lang.err.DH_NO_DHCP_NODE_OK + ": " + JSON.stringify(dr.dhcp_props));
        } else {
            configured_nodes.forEach(function(cn) {
                var num_dhcp_configuring = 0;
                
                // foreach ok dhcp node
                dhcp_ok_nodes.forEach(function(dn) {
                    var is_configuring = false;
                    var paths_dchp_node = checkConnectivity(cn, dn);
                    // there must be at least one path witout layer 3 nodes
                    paths_dchp_node.forEach(function(path) {
                        if (path.length > 0){
                            var in_bcast_domain = path.every(function (node_in_path){ return layer3_nodes_ids.indexOf(node_in_path) == -1});
                            if (in_bcast_domain) {
                                dh_no_ip = false; // ip configured
                                is_configuring = true; // will increase num_dhcp_configuring
                            }
                        }
                    }); 
                    
                    if (is_configuring) num_dhcp_configuring++;
                    
                }) // end dhcp_ok_nodes
                if (num_dhcp_configuring >1) {
                    dh_several_dhcps = true; // one of the nodes is configured by several dhcps  // BORRAR?
                    logErrorDetails(dr, lang.err.DH_SEVERAL_DHCPS + " (node id=" + cn.id + ")" );
                } else  if (num_dhcp_configuring == 0) {
                    logErrorDetails(dr, lang.err.DH_NO_IP + " (node id=" + cn.id + ")");
                }
                
                // Check if nodes are being configured by at least one dhcp server with other (wrong) range 
    //console.log("comprobando otros dhcps");
                dh_wrong_range = dhcp_other_nodes.some(function (don){
    //console.log("probando nuevo nodo" )
    //console.log(don);
                    var paths_dchp_node = checkConnectivity(cn, don);
                    var configuring = paths_dchp_node.some(function(path){
    //console.log("path")
    //console.log(path.length);
                        if (path.length > 0){
                            var in_bcast_domain = path.every(function (node_in_path){ return layer3_nodes_ids.indexOf(node_in_path) == -1});
                            if (in_bcast_domain) return true;
                        }
                        return false;
                    }); // end path_dhcp_node
                    if (configuring) return true;
                    return false;
                }); // end dhcp_other_nodes
                if (dh_wrong_range) logErrorDetails(dr, lang.err.DH_WRONG_RANGE + " (node id=" + cn.id + ")");
            }); // end configured_nodes
        }
/*console.log(dr);        */
        
/*        if (dh_wrong_range == true)  addError(dr, lang.err.DH_WRONG_RANGE);
        if (dh_no_ip) addError(dr, lang.err.DH_NO_IP);
        if (dh_several_dhcps) addError(dr, lang.err.DH_SEVERAL_DHCPS);
        if (!dh_no_ip && !dh_several_dhcps && !dh_wrong_range) 
            dr.success = true;
        else
            dr.success = false;
*/        
        
            
        
    }); // end dhcp_res
    
/*
    errors.forEach(function(e) {
        console.log(e);
    });*/

    // CAPTIVE v2 -------------------------------------------------------------
    // array with restrictions
    var capt_res = problem.restrictions.filter(function(n){
        return n.type === "captive";
    })
    
    // arrays with: (1)captive nodes, (2) their ids
    var capt_nodes = findNodesByProps({"type":"captive"});
    
    var capt_nodes_ids = [];
    capt_nodes.forEach(function (cn){
        capt_nodes_ids.push(cn.id);
    });
    
    capt_res.forEach(function(cr) {
        var pass = false;
        var process = true;
        var error_some_path_no_capt = false;
        var error_some_path_no_radius = false;
        var error_no_node_matching = false;
        var error_no_internet = false;
        // no borrar
        var error_no_path_to_internet = true; // true until proven otherwise
        var error_node_security = false;
        
        //logProgress(cr.desc);
        startRestriction(cr);
        
        // nodes to thich Internet access must be restricted
        var user_nodes = findNodesByPropsArray(cr.node_props); 
        var user_nodes_num = user_nodes.length;
        
        // all nodes (APs,VAPs...) must traverse the captive portal
        // if no node match the restriction...
        if (user_nodes.length == 0) {
            error_no_node_matching = true;
            logErrorDetails(cr, lang.err.GEN_NO_NODE_MATCH);
        } else {
            user_nodes = filterByProps(user_nodes, cr.security_props);
            if (user_nodes.length != user_nodes_num) {
                error_node_security = true;
                logErrorDetails(cr, lang.err.GEN_NODE_SECURITY);
                process = false;
            }

        }
/*console.log("process = " + process);        */
        if (process) {
            pass = user_nodes.every(function(un){
                // for all Internet nodes
                if (internet_nodes.length == 0){
                    error_no_internet = true;
                    logErrorDetails(cr, lang.err.GEN_NO_INTERNET);
                    return false;
                }
                //deberia ser some MAL!
                return internet_nodes.every(function(inn) {
                    
                    var paths_capt_un = checkConnectivity(un, inn);
                    
                    // for every path to Internet
                    if (paths_capt_un[0].length == 0) {
                        
                        return false; // no error logged (true initially)
                    }
                    
                    error_no_path_to_internet = false; // there is a path to Internet
                    // if every path to the internet has a operating captive portal ...
                    return paths_capt_un.every(function(path) {
                        // if no node of the path is a captive portal //some path allows reaching the internet wihtout traversing a captive portal
                        var cp_id;  // cp  in path
                        var some_node_is_pc = path.some(function(node_in_path) { // comprobando todo para cada nodo del path MAL!no, BIEN
                            // if there is no captive portal node
                            var is_cp = (capt_nodes_ids.indexOf(node_in_path)!=-1);
                            if (is_cp) {
                                cp_id = node_in_path;
                                return true; //path.some
                            } else return false; //path.some
                        }); // end path.some
                      
                        if (!some_node_is_pc) {
                            error_some_path_no_capt = true;
                            logErrorDetails(cr, lang.err.CP_PATH_NO_CP + " (Internet node:" + inn.id + ", user node:" + un.id +")");
                            return false;
                        }
                        
                        var current_cp_node = graph.getNodeById(cp_id);

                        // if the captive node cannot communicate with a RADIUS server
                        if (!radiuses.some(function(rn) {
                            var path_to_radius = checkConnectivity(current_cp_node, rn, []); // NO! check connectivity in management VLAN
                            if (path_to_radius[0].length > 0) return true;
                            else return false; //radius.some
                        })) {
                            error_some_path_no_radius = true;
                            logErrorDetails(cr, lang.err.CP_NO_RADIUS + "(user node: " + un.id +")" );
                            return false; // paths_capt_un.every
                        }
                        
                        // there is a CP node with connectivity with a RADIUS server
                        return true; // paths_capt_un.every
                            
                    }); // end path_capt_un.every
                }); // end internet_nodes.every
            }); // end user_nodes.every

        } // user_nodes.length >0
        if (error_no_path_to_internet) logErrorDetails(cr,lang.err.CP_NO_PATH_INTERNET);
/*console.log("pass = " + pass);        */
        // check error and restriction success
/*        if (pass) {
            cr.success = true;
        } else {

            if (error_some_path_no_capt) addError(cr, lang.err.CP_PATH_NO_CP);
            if (error_some_path_no_radius) addError(cr, lang.err.CP_NO_RADIUS);
            if (error_no_node_matching) addError(cr, lang.err.GEN_NO_NODE_MATCH);
            if (error_no_internet) addError(cr, lang.err.GEN_NO_INTERNET);
            if (error_no_path_to_internet) addError(cr, lang.err.CP_NO_PATH_INTERNET);
            cr.success = false;
        }*/
/*console.log("cr.success=" +cr.success);       
console.log("error_no_path_to_internet = " + error_no_path_to_internet);        
*/        
        
        
    }); // end capt_res
    
    
    // WPA-Enterprise ---------------------------------------------------------
    //-------------------------------------------------------------------------
     
    // array with restrictions
    var enterprise_res = problem.restrictions.filter(function(n){
        return n.type === "wpa-enterprise";
    });
    
    enterprise_res.forEach(function(er) {
        var pass = false;
        var process = true;
        //errores
        var error_no_node_matching = false;
        var error_no_path_to_radius = false;
        var error_node_security = false;
        var error_password_ap_radius_mismath =  false;
        
        //logProgress(er.desc);
        startRestriction(er);
        
        // wireless nodes protected by WPA Enterprise
        var user_nodes = findNodesByPropsArray(er.node_props); 
        var user_nodes_num = user_nodes.length;
        
       // if no node match the restriction (essid, zone...)
        if (user_nodes.length == 0) {
            error_no_node_matching = true;
            logErrorDetails(er, lang.err.GEN_NO_NODE_MATCH);
            process = false;
        } 
        else {
            user_nodes = filterByProps(user_nodes, er.security_props);
            if (user_nodes.length != user_nodes_num) {
                error_node_security = true;
                logErrorDetails(er, lang.err.GEN_NODE_SECURITY);
                process = false;
            }

        }
        
        if (process) {
            // let's check if all nodes have connectivity with a RADIUS server
            pass = user_nodes.every(function(un){ 
                // use physical devices, not virtual
                var un_phy;
                if (un.type == "vap"){
                    var un_phy = getPhysicalDevice(un);
                    if (un_phy == null) {
                        logErrorDetails(er, lang.err.WE_VIRTUAL_DEV_NOT_CONNECTED + ": node id = " + un.id);
                        return false;
                    }

                } else un_phy = un;
                
                var configuring_radius_node = null;
                // if node cannot communicate with a RADIUS server
                if (!radiuses.some(function(rn) {
                    var path_to_radius = checkConnectivity(un_phy, rn, []); // NO! check connectivity in management VLAN
                    if (path_to_radius[0].length > 0) {
                        configuring_radius_node = rn;
                        return true;
                    }
                    else return false; //radius.some
                })) {
                    //error_some_path_no_radius = true;
                    error_no_path_to_radius = true;
                    logErrorDetails(er, lang.err.WE_NO_PATH_RADIUS + "(user node: " + un_phy.id +")" );
                    return false; // paths_capt_un.every
                }
//console.log(configuring_radius_node);                
                if (configuring_radius_node.password != un.password || configuring_radius_node.password == ""){
                    error_password_ap_radius_mismath = true;
                    logErrorDetails(er, lang.err.WE_PASSWORD_MISMATCH + "(user node: " + un.id +")" );
                    return false; // paths_capt_un.every
                }
                
            // there is connectivity between each user node and a RADIUS server
            return true; // paths_capt_un.every

            }); //end user_nodes every
        }
/*        
        // check error and restriction success
        if (pass) {
            er.success = true;
        } else {

            if (error_no_path_to_radius) addError(er, lang.err.WE_NO_PATH_RADIUS);
            if (error_no_node_matching) addError(er, lang.err.GEN_NO_NODE_MATCH);
            if (error_node_security) addError(er, lang.err.GEN_NODE_SECURITY);
            if (error_password_ap_radius_mismath) addError(er, lang.err.WE_PASSWORD_MISMATCH);
            er.success = false;
            
        } // user_nodes.length >0*/
        
    }); // end enterprise_res
  
   // ZONE restriction ---------------------------------------------------------
   // --------------------------------------------------------------------------
    var link_nodes_ids=[];
    var zone_res = problem.restrictions.filter(function(n){
        return n.type === "zone";
    });
    /*var several_zones = false;*/
    //si existe alguna restricción asignar nodos a zonas
    //TODO seleccionar todos los nodos asignables (zone sí pero no wireless-link)
    //seleccionar todos los wireless links
    //comprobar la conectividad de cada nodo con todos los wl
    //ver si están dentro del alcanze (sin pasar por otro wl) y cuantos wl podrían alcanzarlo
    // si más de uno saltar error
    
    // fill zone fields
    if (zone_res.length != 0) {
        var link_nodes = findNodesByProps({"type": "wireless-link"});
        // set the field of all nodes with Zone field using their associated wireless-link
        var zone_nodes = filterItemWithProps(nodes, {"zone":""}); // find nodes with "zone" key (ignore "" value)
        zone_nodes = filterNotNodes(zone_nodes, link_nodes);
        link_nodes.forEach(function (ln){
            link_nodes_ids.push(ln.id);
        });
        
        // if there are not (wireless)link nodes put all nodes in the default zone
        if (link_nodes[0] == null){
            zone_nodes.forEach(function(zn) {
                zn.zone = "default";
            })
        } else {
            zone_nodes.forEach(function(zn){
                var candidate_zones = [];
                link_nodes.forEach(function(ln) {
                   var paths_zn_ln = checkConnectivity(zn, ln, [], "NO_VLANS");
    /*console.log("paths between " + zn.id + " and " + ln.id);               
    console.log(paths_zn_ln)               
    */               if (paths_zn_ln[0].length > 0) {
                       paths_zn_ln.forEach(function(path) {
                           var path_finished = false;
                
                           path.forEach(function(node_in_path){
                               if (!path_finished){
                                    if (link_nodes_ids.indexOf(node_in_path)!=-1){
                                        candidate_zones.push(node_in_path);
    /*console.log("candidate_zones")
    console.log(candidate_zones)
    */                                    path_finished = true;
                                        
                                    } // end if
                               } // end if !path_finished
                           }); //end path
                       }); // end paths_zn_ln 
                       
                   } // end if length>0
               }); // end link_nodes 
               
               // check if all paths have the same (wireless) link as the first link (if not error)
               var zone ="";
               candidate_zones.forEach(function(cz) {
    
    /*console.log("cz");  
    console.log(cz);  
    console.log("zone");
    console.log(zone);  */
                   if (zone == "" || (graph.getNodeById(cz)).zone == zn.zone) {
                        zone = (graph.getNodeById(cz)).zone;
                        zn.zone = zone;
                    } else{
    //console.log("else")                    
                        zone = lang.ui.ZONE_CONFLICT;
                        zn.zone = zone;
                    }
               });
               if (zone === lang.ui.ZONE_CONFLICT){
                   logErrorDetails({"desc": "ZONES"}, lang.err.ZN_ZONE_CONFLICT + " (node id = " + zn.id +")");
               }
            }); // end zone_nodes
        }        
// console.log("zone_nodes")        ;
//console.log(zone_nodes)        ;
        
    }
    
    zone_res.forEach(function(zr) {
        //errors
        var error_no_node_matching = false;
        var error_no_zone_node_matching = false;
        
        //logProgress(zr);
        startRestriction(zr);
        
        var frontier_nodes = findNodesByPropsArray(zr.frontier_props);  // no need by now to be array of props. maybe in the future...
        var zone_nodes = findNodesByPropsArray(zr.nodes_in_zone); // will be on the same zone than the frontier nodes if their zone_props are the same that the frontier nodes
        //zone_nodes = filterByPropsInverse(zone_nodes, {"type": "wireless-link"})
       zone_nodes = filterNotNodes(zone_nodes, frontier_nodes);
/*console.log("zone_nodes");
console.log(zone_nodes);
*/       var non_zone_nodes = findNodesByPropsArray(zr.nodes_not_in_zone); // idem, but with nodes not allowed to be in the zone

        //non_zone_nodes =  filterNotNodes(non_zone_nodes, frontier_nodes);
        zone_nodes = filterByPropsInverse(zone_nodes,{"type": "wireless-link"}); 
        non_zone_nodes = filterByPropsInverse(non_zone_nodes, {"type": "wireless-link"}); 

/*console.log("non_zone_nodes")        ;
console.log(non_zone_nodes.length)        ;
*/        
        // If the restriction uses zones different than the default there must be frontier nodes (wireless link nodes)
        if (frontier_nodes.length == 0 && zr.frontier_props!= null && (zr.frontier_props.zone != "default" && zr.frontier_props.zone != "" && zr.frontier_props.zone != null )) {
            error_no_node_matching = true;
            logErrorDetails(zr, lang.err.ZN_NO_FRONTIER_NODE);
            return;
        } 
 
        if (zr.nodes_in_zone!=null && zone_nodes.length == 0){
            error_no_zone_node_matching = true;
            logErrorDetails(zr, lang.err.ZN_NO_ZONE_CANDIDATES + ": " + JSON.stringify(zr.nodes_in_zone));
            return;
        }

        // check that there is at least one node of each of the required nodes for the zone
        // loop all properties' set that must be found in nodes of the zone
        [].concat(zr.nodes_in_zone).forEach(function(prop_niz){
            // for some frontier node there must be connectivity
            frontier_nodes.some(function(fn) {
                var zone_nodes_subset = filterByProps(zone_nodes, prop_niz);

                // for some of the nodes satisfying the properties...
                var ok = zone_nodes_subset.some(function (zns){
                    //if there is some path
                    if (checkConnectivity(zns, fn, [], "ZONE_"+fn.zone)[0].length>0){
                        return true;
                    } // end if checkconnectivity                    
                    return false;
                }); // end zone_nodes_subset.some 
                
                if (!ok) logErrorDetails(zr, lang.err.ZN_NODE_NOT_FOUND + ": " + JSON.stringify(prop_niz));

            }); // end frontier_nodes.some
        }); // end zr.nodes_in_zone
        
        // check that there is no nodes in the zone with some of the subset of properties forbidden by the restriction
        [].concat(zr.nodes_not_in_zone).forEach(function(prop_nniz){
            // for all frontier nodes there must not be connectivity
            frontier_nodes.every(function(fn) {
                var non_zone_nodes_subset = filterByProps(non_zone_nodes, prop_nniz);

                // for all nodes satisfying the properties...
                var ok = non_zone_nodes_subset.every(function (nzns){
                    //if there is some path
                    if (checkConnectivity(nzns, fn, [], "ZONE_"+fn.zone)[0].length>0){
                        return false;
                    } // end if checkconnectivity                    
                    return true;
                }); // end non_zone_nodes_subset.every 
                
                if (!ok) logErrorDetails(zr, lang.err.ZN_NODE_FORBIDDEN_FOUND + ": " + JSON.stringify(prop_nniz));

            }); // end frontier_nodes.every
        }); // end zr.nodes_not_in_zone
        


        
//        console.log("pass = " + pass);
    }); // end zone_res.forEach
    
    //--------------------------------------------------------------------------




    // WIRELESS-LINK RESTRICTIONS ----------------------------------------------
    //--------------------------------------------------------------------------
    var wireless_link_res = problem.restrictions.filter(function(n){
        return n.type === "wireless-link";
    });
    
    wireless_link_res.forEach(function(wlr) {
        startRestriction(wlr);
        // check that for each [bs, subs] zone pair there is some frontier node in each of them directly connected (or ERR) and
        // that each node complies with its maximum tx-pow and eirp (if specified), the sensitivity value entered is ok and the computed too
        // node sets needed: 
        var bs_nodes = findNodesByProps(wlr.bs_props.node);
        if (bs_nodes.length==0){
            logErrorDetails(wlr, lang.err.WL_NO_BS);
        }
        bs_nodes.forEach(function(bsn) {
            // check if eirp is over maximum
            if ("eirp" in wlr.bs_props.radio){
                if (parseInt(bsn["tx-pow(dBm)"]) + parseInt(bsn["gain"]) > parseInt(wlr.bs_props.radio.eirp) ) logErrorDetails(wlr, lang.err.WL_MAX_EIRP_EXCEEDED + ": node id = " + bsn.id);
            }
            if ("max-tx-pow(dBm)" in wlr.bs_props.radio){
                if (parseInt(bsn["tx-pow(dBm)"]) > parseInt(wlr.bs_props.radio["max-tx-pow(dBm)"]) ) logErrorDetails(wlr, lang.err.WL_MAX_TX_POW_EXCEEDED + ": node id = " + bsn.id);
            }
            if ("sens" in wlr.bs_props.radio){
                if (Math.abs(parseInt(bsn["sens"]) - parseInt(wlr.bs_props.radio["sens"])) > 1 ) logErrorDetails(wlr, lang.err.WL_WRONG_SENS + ": node id = " + bsn.id);
            }
            //TODO ver que llega nivel de potencia adecuado, tener en cuenta fading?, para cada enlace
            
            
            // for each subscriber zone
            [].concat(wlr.subscribers_props).forEach(function (sp){
                var zone_connected = false;
                var subs_nodes = findNodesByProps(sp.node);
                // check the link between a bs and a subsciber
                if (subs_nodes.length==0){
                    logErrorDetails(wlr, lang.err.WL_NO_SUBS);
                }
                subs_nodes.forEach(function(sn) {
                    if ("eirp" in sp.radio){
                        if (parseInt(sn["tx-pow(dBm)"]) + parseInt(sn["gain"]) > parseInt(sp.radio.eirp) ) logErrorDetails(wlr, lang.err.WL_MAX_EIRP_EXCEEDED + ": node id = " + sn.id);
                    }
                    if ("max-tx-pow(dBm)" in sp.radio){
                        if (parseInt(sn["tx-pow(dBm)"]) > parseInt(sp.radio["max-tx-pow(dBm)"]) ) logErrorDetails(wlr, lang.err.WL_MAX_TX_POW_EXCEEDED + ": node id = " + sn.id);
                    }
                    if ("sens" in sp.radio){
                        if (Math.abs(parseInt(sn["sens"]) - parseInt(sp.radio["sens"])) > 1 ) logErrorDetails(wlr, lang.err.WL_WRONG_SENS + ": node id = " + sn.id);
                    }
                    
                    var link = graph.getLinkByNodes(bsn, sn);
                    if (link == null) {
                        logErrorDetails(wlr, lang.err.WL_NO_WL_CONNECTIVITY + ":  node id = " + bsn.id + ", node id = " + sn.id  );
                        // return false;
                    } else {
                        zone_connected = true;
                        var margin = 0;
                        if ("margin" in sp.radio) margin = parseInt(sp.radio["margin"]);
                        if ("loss" in sp.radio) {
                            // downlink power budget  FALTA ganacia
                            if ( (parseInt(bsn["tx-pow(dBm)"]) + parseInt(bsn.gain) - parseInt(sp.radio.loss) + parseInt(sn.gain)) < (parseInt(sn.sens) + margin) ) logErrorDetails(wlr, lang.err.WL_POWER_BUDGET_FAIL + ": " + bsn.id + " --> " + sn.id);
                            // uplink power budget
                            if (  (parseInt(sn["tx-pow(dBm)"]) + parseInt(sn.gain) - parseInt(sp.radio.loss) + parseInt(bsn.gain) ) < (parseInt(bsn.sens) + margin ) ) logErrorDetails(wlr, lang.err.WL_POWER_BUDGET_FAIL + ": " + sn.id + " --> " + bsn.id);
                        }
//                        if (parseInt(bsn["tx-pow(dBm)"] - ))
                        
                    }
                    //return true;
                }); // end subs_nodes
                if (!zone_connected) logErrorDetails(wlr, lang.err.WL_NO_ZONE_CONNECTIVITY + ": zone " + bsn.zone + ", zone " + sp.zone );

            }); // end wlr.subscriber_props.node
        }); // end bs_nodes        
        var susc_nodes =[[]];
        
        //wlr.subscribers_props.node
        
    }); // end wireless_link_res

    var end = new Date().getTime();
    var time = end - start;
    //alert("Elapsed time:" + time);
    
    //--------------------------------------------------------------------------
    updateRestrictions();
    
    $("#eval_output").html(getEvaluationResults());
    
     errors.forEach(function(e) {
            console.log(e);
     });
     
     if (!teacher_mode) submitResults();
    
    


}

function logProgress(msg){
    console.log(msg);
}
function resetRestrictions(){
    problem.restrictions.forEach(function(r){
        r.success ="NOT_EVALUATED";
        r.errors = [];
    });
}

function startRestriction(restriction){
    restriction.success = "EVALUATING";
    restriction.errors = [];
    console.log("Evaluating restriction " + restriction.desc);
}

// all evaluated restriccions which didn't throw an error are set to success
function updateRestrictions(){
    problem.restrictions.forEach(function(r){
        if (r.success == "EVALUATING" || r.success == true)
            r.success = true;
        else
            r.success = false;
    });
}

function logErrorDetails(restriction, msg){
    restriction.success = false;
    restriction.errors.push(msg);
    console.log("*" + restriction.desc + ": " + msg);
}


function getEvaluationResults(){
    var res = "";
    var ok=0, fail=0;
    problem.restrictions.forEach(function(r){ 
        res += "<p><strong> " + r.desc + ": ";
        if (r.success == true) {
            res += "OK </strong></p>";
            ok++;
        } else{
            res += "FAIL </strong></p>";
            if (errors != null){
                res += "<ul>";
                r.errors.forEach(function(e){
                   res += "<li>" + e +"</li>";
                });
                res += "</ul>";
                fail++;
            }
        }
        
    });
    res += "<strong>" + ok + "/" + (ok + fail) + " " + lang.ui.REST_OK_PRECENT + "</strong>";
    problem.score = 10 * ok / (ok + fail);
    return res;
}
    

// shloudn't be used
function addError(restriction, msg){
    errors.push(restriction.desc + ": " + msg);
}

    
// args must be an object with the appropriate key/value properties that are being searched
function findNodesByProps(args){
    var res = nodes.filter(function (n){
        
        for (var key in args){
            if  ( !((key in n) && (n[key] == args[key])) )  return false;
        }
        return true;
    });

   return res;
}

// return item having the props key/value pairs in args
function filterByProps(array, args){
    var res = array.filter(function (n){
        for (var key in args){
            if  ( !((key in n) && (n[key] == args[key])) )  return false;
        }
        return true;
        
    });
    
    return res;
}

// return item not having the props key/value pairs in args
function filterByPropsInverse(array, args){
    var res = array.filter(function (n){
        for (var key in args){
            if  ( !((key in n) && (n[key] == args[key])) )  return true;
        }
        return false;
        
    });
    
    return res;
}


//  REVISAR, parace que con cumplir la primera propiedad devolverá true
// args must be an object or array of objects with the appropriate key/value properties that are being searched
// replace findNodesByProps with this?
function findNodesByPropsArray(args){
    var arr = [].concat(args);
    var arr_length = arr.length;
    var res = nodes.filter(function (n){
        return arr.some(function (obj){
            var pass = false;
            for (var key in obj){
                pass = true;
                if  ( (key in n) && (n[key] == obj[key]) )  continue;
                return false;
            }
            return pass;
        });
    });
     
   return res;
}

// return items in elements and not in subelements
function filterNotNodes (elements, subelements){
    return elements.filter(function (e){
       return (subelements.every(function (se){
/*           console.log(e);
           console.log(se);
           console.log("--");
*/          if (se != e) return true;
//          console.log("coincide")
          return false;
       }));
    });
}

// return items with all keys in prop_obj (ignore values)
function filterItemWithProps(elements, prop_obj){
    var res = elements.filter(function (n){
        for (var key in prop_obj){
            if  (!(key in n))  return false;
        }
        return true;
    });
    
    return res;
}

// not used
function findNodesWithoutProps(args){
    var res = nodes.filter(function (n){
        
        for (var key in args){
            if  ( (key in n) && (n[key] == args[key]) )  return false;
        }
        return true;
    });

   return res;
}

// returns the physical device of a virtual decive (e.g. vap and ap)
function getPhysicalDevice(virtual_node){
    if (virtual_node.type == "ap") return virtual_node; // it was a physical node all the time
    if (virtual_node.type == "vap"){
        return graph.findConnectedByType(virtual_node.id, "ap");
    }
}

// check that every count the number of times that a type of node has been connected to other nodes
// and log error in the res  restriction
function checkNodePortsAndLogError(res, type, allowed_ports, error){
    var map_table_count = {}; 
    links.forEach(function (l){
        if (l.source.type == type){
            var nid = l.source.id + "";
            if (nid in map_table_count) {
                map_table_count[nid]++;
            }
            else {
                map_table_count[nid]=1;
            }
        }
        if (l.target.type == type){
            var nid = l.target.id + "";
            if (nid in map_table_count) {
                map_table_count[nid]++;
            }
            else {
                map_table_count[nid]=1;
            }
        }
    }); // end links
    
    for (var nid in map_table_count){
        if (map_table_count[nid] != allowed_ports) logErrorDetails(res, error + ": node id = " + nid);
    }
}


function calculateVlanTag(link, prev_tag, source){
/*console.log("calculateVlanTag")
console.log(source);
console.log(prev_tag=="")*/
    var prev_tag_int, link_vlan_int; // unused
    
    var link_vlan = link.vlan.replace(/ /g,'');
    
    prev_tag = (prev_tag + "").replace(/ /g,''); // transform to string and remove blank spaces
    

    prev_tag_int = parseInt(prev_tag);
    link_vlan_int = parseInt(link.vlan);

/*    
    // don't allow sending tagged frames to the Internet
    // TODO: add error message to a "others" restriction
    target = (link.source == source)?link.target:link.source; 
    if (target == "internet"){
        if (link.vlan != "") {
            console.log("Error: enviando tramas etiquedas a Internet")
            return "not_allowed";
        }
        return "";
    }*/
//NEW RULES
// comprobar zonas y NO_VLANS
// comprobar si es trunk y cuales permite
// si es un aux se manda la misma etiqueta 
// si es un router se quita la etiqueta previa (se pone "") y se sigue procesando, el enlace de salida determinará la etiqueta 
// si no tiene etiqueta (o sale de router o de un cliente) y el enlace es de acceso se manda sin etiqueta (aunque sea una VLAN) o si es trunk se le asigna la VLAN 1 (si está permitida)
// si tiene etiqueta solo se mandará si coincide con la del enlace de acceso (quitando la etiqueta) o es trunk (y permitido)

// si source es un router manda por la vlan del enlace si es un enlace de acceso o por la VLAN por defecto (VLAN 1) si es un enlace trunk, 
// si es trunk y la tag esta permitida reenviar tag
// 

    if (debug_mode){
        console.log("link");
        console.log(link);
        console.log("prev_tag")
        console.log(prev_tag)
        console.log("source")
        console.log(source);
    }
// tags starting with ZONE_, used for testing if nodes are in the same zone
if (debug_mode) console.log("zone");
    if (prev_tag.startsWith("ZONE_")){
        if ("zone" in link.source && prev_tag.substring(5) != link.source.zone) return "not_allowed";
        if ("zone" in link.target && prev_tag.substring(5) != link.target.zone) return "not_allowed";
        return prev_tag;
    }
if (debug_mode) console.log("NO_VLANS");
    // special tag used when vlans shouldn't be checked (used in restriction checking)
    if (prev_tag == "NO_VLANS"){
        return prev_tag;
    }
if (debug_mode) {
    console.log('source.type == "router" = '); 
    console.log(source.type == "router");    
}    
    // router elimina tag, captive tambien ya que debe estar en enlaces(interfaces) de acceso que no les llega tag
    // otros equipos similares que solo tienen un enlace no los contemplo (saltará la restriccion de graph checking)
    if (source.type == "router" || source.type == "captive" || source.type == "internet" || source.type == "dhcp") prev_tag ="";
    
if (debug_mode) console.log('prev_tag == ""' + (prev_tag == ""));    
    // if no VLANs used
    if (prev_tag == "" && link_vlan == "") return "";
    
    var is_trunk = link_vlan === "t" || link_vlan === "trunk" || link_vlan.indexOf(",") != -1;
    var allowed_trunk_vlans = {};
    if (is_trunk && link_vlan.indexOf(",")) {
        link_vlan.split(",").forEach(function (vlan){
           allowed_trunk_vlans[vlan] = true; 
        });
    }
    if (link_vlan == "t" || link_vlan == "trunk"){
        allowed_trunk_vlans[prev_tag] = true;
    }
    
    var is_access = !is_trunk && link.vlan != "";
    if (debug_mode){
        console.log("is_trunk = "  + is_trunk);
        console.log(allowed_trunk_vlans);
        console.log("is_access =" + is_access);
        console.log("prev_tag ="+ prev_tag);        
    }



    // si no tiene etiqueta y el enlace es de acceso se pone en vlan del enlace o si es trunk se le asigna la VLAN 1 si permitida
    if (prev_tag === ""){
        
        if (is_access) 
            return link_vlan;
        else {
            if (allowed_trunk_vlans["1"] || link_vlan === "t" || link_vlan == "trunk") 
                return "1";
            else 
                return "not_allowed";
        }
    }
    

    // si tiene etiqueta solo se mandará si coincide con la del enlace de acceso (quitando la etiqueta) o es trunk (y permitido)
    if (prev_tag != ""){
        if (is_access){
            if (prev_tag == link_vlan) 
                return prev_tag;
            else
                return "not_allowed";
        } 
        if (is_trunk) {
            if (allowed_trunk_vlans[prev_tag])
                return prev_tag;
            else
                return "not_allowed";
        }
        // si llega tageado a una interfaz sin vlan, lo mando sólo si el tag es el de la 1
        if (link_vlan == "" && prev_tag != "1")
            return "not_allowed";
        if (link_vlan == "" && prev_tag == "1")
            return "1";            
    }
    
    //alert("opciones sin considerar en "+ link.source.id + " --> " + link.target.id + ", prev_tag =" + prev_tag );
    
    
/*
    // aux nodes should not change anything
    // but they willhave to be well configured (two links with the same tag)
    // TODO check before anyoyher restriction that all of them are well configured
    if (source.type  == "_aux_"){
        return prev_tag;
    }    
    
    // special tag used when vlans shouldn't be checked (used in restriction checking)
    if (prev_tag == "NO_VLANS"){
        return prev_tag;
    }
    
    // routers route all vlans (and use the new tag)
    if (source.type == "router"){
        return link.vlan; 
    }
    
    //OJO
    // trunk ports/links keep the tag, if untagged use tag 1 
    if (link.vlan == "t" || link.vlan == "trunk"){
        if (prev_tag == "") 
            return "1";
        return prev_tag;
    }
        
    // links with no tag specified send only untagged or management traffic
    if (link.vlan == ""){
        if (prev_tag == "" || prev_tag == "management" || prev_tag == "1")
            return prev_tag;
        else
            return "not_allowed";
    }
    
    // tagged ports will tag non tagged traffic
    if (link.vlan != "" && prev_tag == "")
        return link.vlan;
        
    // Rest of tagged ports only send traffic with that tag, // NOT removing the tag (NO native vlan) 
    if (link.vlan == prev_tag)
        //return "";
        return prev_tag;
    else
        return "not_allowed";
        
    */
    
}

/*// TODO: falta tener en cuenta a los routers y la vlan ""
function calculateVlanTag(link, prev_tag, next_node){
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
    
}*/

// devuelve array con los siguientes nodos no visitados, se puede extender la función añadiendo mas
// restricciones (VLANs y no se si alguna mas), se deberia pasar la etiqueta VLAN con la que llegan los
// paquetes y descartar los hops por donde no se pueda mandar y devolver además un array con las etiquetas VLAN
// para cada hop
function getPossibleHops(source, path_ids, vlan_tag){
    var hops = [], vlan_tags = [], tag;
    links.forEach(function(l) {
        var l_source_id = parseInt(l.source.id);
        var l_target_id = parseInt(l.target.id);

        // search in the list of links for all links that can be traversed
        // si no se ha pasada ya por ese nodo...
        if ( (l_source_id == source.id) && (path_ids.indexOf(l_target_id)==-1) ) {
            tag = calculateVlanTag(l, vlan_tag, l.source);
if (debug_mode) console.log ("DEVUELTO tag =" + tag);            
/*console.log("tag="+tag);     */       
            if (tag != "not_allowed")
                hops.push({"node":l_target_id, "vlan_tag": tag});
        } else if ( (l_target_id == source.id) && (path_ids.indexOf(l_source_id)==-1) ){
            tag = calculateVlanTag(l, vlan_tag, l.target);
if (debug_mode) console.log ("DEVUELTO tag =" + tag);                        
/*console.log("tag="+tag);            */
            if (tag != "not_allowed")
                hops.push({"node":l_source_id, "vlan_tag": tag});
        }
    })
/*console.log("hops: ");    */
/*    hops.forEach(function(h) {
        console.log("node "+ h.node+ ", tag " + h.vlan_tag)
    })
*/
    return hops;
}

// check connectivity between source and target, 
// path_ids = array with previously visited nodes (if any)
// revisar mas adelante el tema de la VLAN para autenticacion
function checkConnectivity(source, target, path_ids, vlan_tag){
    var hops = [];
    var list_path_ids = [[]], new_path_ids = [[]];
    
    // me aseguro de que path_id sea un array y añado el nodo origen si esta vacio
    if  (typeof path_ids == 'undefined' || path_ids.length == 0) {
        path_ids=[source.id];
    }
    
    // idem con vlan_tag
    vlan_tag = typeof vlan_tag !== 'undefined' ? vlan_tag : "";

    hops = getPossibleHops(source, path_ids, vlan_tag);

    hops.forEach(function(hop_obj) {
        var hop = hop_obj.node;
        var vlan_t = hop_obj.vlan_tag; 
        
        //editanto vlan_t
        //if (hop == target.id && vlan_t=="") {
            if (hop == target.id) {
            new_path_ids = [[hop]];
        }
        else new_path_ids = checkConnectivity(graph.getNodeById(hop), target, path_ids.concat(hop), vlan_t);
        if (new_path_ids[0].length>0){ // si a traves del nodo 'hop' se puede alcanzar el nodo target
            // se añade el nodo actual a todas las rutas encontradas
            new_path_ids.forEach(function (np){
               if (np.length>0) np.unshift(source.id); 
            });
            
            //se juntan las rutas nuevas (por el nodo hop) con las encontradas pasando por otros nodos, si las hay
            while(new_path_ids.length) list_path_ids.push(new_path_ids.shift());
            if (list_path_ids[0].length==0) list_path_ids.shift(); // el primer elemento se quita si esta en blanco (==[[]])

        }
    });
    
    return list_path_ids;
}

var retrieveSubmission = function (uri){
    
}

var submitResults = function(){
console.log("Submitting")     
     var xhr = new XMLHttpRequest();
     var url = "/submissions";
     xhr.open("POST", url, true);
     xhr.setRequestHeader("Content-type", "application/json");
     var timer = setTimeout(function(){
         xhr.abort();
         alert("El servidor no contesta. No se ha podido subir la red");
     }, 2000);
     
     xhr.onreadystatechange = function () { 
         if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 201)) { // REVISAR, procesa igualmente, tb se puede(debe) devolver 201
//console.log("texto recibido = "+ xhr.responseText);
//console.log(xhr.status)
            clearTimeout(timer);
             var json = JSON.parse(xhr.responseText);
             //alert(xhr.status);
             console.log(json)
         } else if (xhr.readyState == 4 && (xhr.status != 200 || xhr.status != 201)) {
              clearTimeout(timer);
              //var json = JSON.parse(xhr.responseText);
             alert("Error al grabar resultados en el servidor:" + xhr.responseText); 
             console.log("texto recibido = "+ xhr.responseText);
//               console.log(xhr.status)
               console.log("Nuevo envío (URL):" + xhr.getResponseHeader("location"))

         }
     }
     var processed_links = [];
     links.forEach(function (l){
          var copy_link={};
          for (var key in l){
               if (key != "source" && key != "target") copy_link[key] =  l[key];
               else if (key == "source") copy_link[key] = l.source.id;
               else if (key == "target") copy_link[key] = l.target.id;
          }
          processed_links.push(copy_link);
     });
     var data = JSON.stringify({"score": problem.score, "challenge_id": problem.challenge_id, "network": {"links":processed_links, "nodes": nodes}, "challenge":problem});
//console.log("data to be sent");     
//console.log(data);
     xhr.send(data);
} 


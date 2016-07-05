/*global lang*/
lang = {
    "settings" :{
        "LANGUAGE": "ENGLISH",
        "HELP_FILENAME": "help"
    },
    "err": {
        // Generic
        "GEN_NO_NODE_MATCH" : "No node matching the requisites specified by the restriction have been found",
        "GEN_NO_INTERNET": "No node of the Internet type has been found",
        "GEN_NO_PATH_INTERNET": "No path to the Internet has been found",
        "GEN_NODE_SECURITY": "There are nodes with a wrong security configuration",
        //GRAPH errors
        "GR_AUX_NOT_TWO_LINKS": "_aux_ nodes must be connected to two nodes",
        "GR_AUX_DIFF_VLAN": "VLAN values of the links connected to the same _aux_ node must be identical",
        "GR_VAP_NO_AP": "Virtual access points (vap) must be connected to physical access points (ap)",
        "GR_CAPTIVE_NOT_TWO_PORTS": "Captive portal nodes (captive) must have two links",
        "GR_DHCP_NOT_ONE_PORT": "DHCP servers must have one single link",
        "GR_RADIUS_NOT_ONE_PORT": "RADIUS servers must have one single link",
        "GR_NO_TRUNK_ALLOWED": "Captive, radius, dhcp and internet nodes cannot be connected to trunk interfaces",
        // DHCP errors
        "DH_WRONG_RANGE" : "An incorrect IP range is being received (from another DHCP server)",
        "DH_NO_IP": "The right IP range is not being received (in at least one AP/VAP)",
        "DH_SEVERAL_DHCPS": "A node is receiving IPs from more than one DHCP server(in at least one AP/VAP/zone)",
        "DH_NO_NODE_TO_CONFIGURE": "No candidate nodes to be configured have been found",
        "DH_NO_DHCP_NODE_OK": "No server with the required properties was found",
        // captive portal errors
        "CP_PATH_NO_CP" : "There is at least one path that allows reaching the Internet without traversing a captive portal",
        "CP_NO_RADIUS" : "There is no connectivity between the captive portal and a RADIUS server",
        "CP_NO_PATH_INTERNET": "No path to the Internet traversing a captive portal was found",
        // WPA_ENTERPRISE
        "WE_NO_PATH_RADIUS": "There is no connectivity between (at least) one of the APs and a RADIUS",
        "WE_PASSWORD_MISMATCH": "The password in the access point does not match the password in the RADIUS server, or any of the passwords has not been specified",
        // ZONE
        "ZN_NO_FRONTIER_NODE": "No frontier nodes (wireless-link, etc.) complying to the requisites specified by the restriction has been found",
        "ZN_NO_ZONE_CANDIDATES": "No candidate nodes to be part of the zone have been found (check properties of nodes)",
        "ZN_ZONE_CONFLICT": "Zone conflict. Check the zone field of wireless-links and that all nodes are connected to their corresponding wireless-link node (and not to others)",
        "ZN_NODE_NOT_FOUND": "No nodes with the specified properties have been found in the zone",
        "ZN_NODE_FORBIDDEN_FOUND": "Nodes with not allowed properties were found in the zone",
        // WIRELESS LINK
        "WL_NO_BS": "The base station has not been found",
        "WL_NO_SUBS": "No subscribers have been found",
        "WL_NO_WL_CONNECTIVITY": "There is not a RF link between the base station node and the subscriber",
        "WL_NO_ZONE_CONNECTIVITY": "Zones are not connected",
        "WL_MAX_EIRP_EXCEEDED": "Maximum EIRP exceeded",
        "WL_MAX_TX_POW_EXCEEDED": "Maximum transmission power exceeded",
        "WL_WRONG_SENS": "Wrong sensitivity value",
        "WL_POWER_BUDGET_FAIL": "Power budget calculation failed (reception signal level inadequate)"
        
    },
    "ui" :
        {// errors
        "ZONE_CONFLICT": "ZONE CONFLICT",
        // web
        "TAB_TITLE": "NetEval",
        "WINDOW_TITLE": "NetVal",
        // buttons
        "button": {
            "EVALUATE": "Evaluate network",
            "CHANGE_ITEM_PROPS": "Change properties",
            "SIGN_OUT": "Sign out"
        },
        "ITEM_PROPS_TITLE": "Item properties",
        "NODE_PROPS_TITLE": "Properties of node",
        "LINK_PROPS_TITLE": "Properties of link between ",
        "ITEM_PROPS_HELP": "Double click on one the nodes or links to show and edit its properties",
        "PROBLEM_DESCRIPTION_TITLE": "Problem description", // añadido title
        "PROBLEM_DESCRIPTION": "",
        // eval
        "REST_OK_PRECENT": "OK restrictions",
        "NETEVAL_DESCRIPTION": "Tool for designing and assessing educational wireless networking projects", 
        "HOME_INSTRUCTIONS_P1": "In the following exercises you will be asked to create networks according to certain requisites. You will be able to automatically verify if your network fulfils the requirements and get a grade",
        "HOME_INSTRUCTIONS_P2": "The results that you submit will be stored in a server. You will be able to resume work from the point you left off",
        "SAMPLE_SECTION_TITLE": "NetEval Sample exercises", 
        "SAMPLE_EX1_TITLE": "Exercise 1. Virtual access points", 
        "SAMPLE_EX1_DESC": "In this exercise a physical access point will be used to create two virtual networks", 
        "SAMPLE_EX2_TITLE": "Exercise 2. Remote Internet access",
        "SAMPLE_EX2_DESC": "In this exercise a network to provide Internet access to remote locations will be designed",
        "SAMPLE_EX3_TITLE": "Your own network", 
        "SAMPLE_EX3_DESC": "You can use this exercise to draw networks subject to no restrictions (just  to make snapshots of them)",
        "GO": "GO!",  
        "CHANGE_SVG_HEIGHT": "Change design area height", 
        "ENLARGE": "Enlarge", 
        "REDUCE": "Reduce", 
        "FEEDBACK_PANEL_TITLE": "Feedback and evaluation output", 
        "LOGOUT": "Log out",
        "ADMIN_SECTION_TITLE": "ADMIN operations",
        "ADMIN_UPLOAD_TITLE": "Exercise upload",
        "ADMIN_UPLOAD_DESCRIPTION": "You can upload new exercises modifying the template.ejs template and renaming it.  The path for accessing the exercise will be <domain>/challenges/<filename> (without file extension)",
        "ADMIN_MONITOR_TITLE": "User monitoring",
        "ADMIN_MONITOR_DESCRIPTION": "Link to the user monitoring page (scores, submissions, user data, etc.)",
        "MUST_LOG_IN": "Please sign in",
        "NO_PERMISSION": "You don't have permission to access this resource"
        
    }
}
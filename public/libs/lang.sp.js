/* SPANISH LANGUAGE. ESPAÑOL. Aún no se han comprobrado los últimos cambios al fichero */
/*global lang*/
lang = {
    "settings" :{
        "LANGUAGE": "SPANISH",
        "HELP_FILENAME": "ayuda"
    },
    "err": {
        // Generic
        "GEN_NO_NODE_MATCH" : "No se han encontrado nodos que cumplan las requisitos especificados por la restricción",
        "GEN_NO_INTERNET": "No se han encontrado ningún nodo del tipo Internet",
        "GEN_NO_PATH_INTERNET": "No se han encontrado ningún camino hacia Internet",
        "GEN_NODE_SECURITY": "Existen nodos con una configuración de seguridad incorrecta",
        //GRAPH errors
        "GR_AUX_NOT_TWO_LINKS": "Los nodos _aux_ deben estar conectados a dos nodos",
        "GR_AUX_DIFF_VLAN": "Las vlans de los enlaces conectados a un mismo nodo _aux_ deben ser identicas",
        "GR_VAP_NO_AP": "Los puntos de acceso virtuales (vap) deben estar conectados a puntos de acceso físicos (ap)",
        "GR_CAPTIVE_NOT_TWO_PORTS": "Los nodos captive (portal cautivo) deben tener dos enlaces",
        "GR_DHCP_NOT_ONE_PORT": "Los servidores DHCP deben tener un único enlace",
        "GR_RADIUS_NOT_ONE_PORT": "Los servidores RADIUS deben tener un único enlace",
        "GR_NO_TRUNK_ALLOWED": "Los nodos captive, radius, dhcp e internet no se pueden conectar a interfaces trunk",
        // DHCP errors
        "DH_WRONG_RANGE" : "Se está recibiendo un rango incorrecto de IPs (de otro servidor DHCP)",
        "DH_NO_IP": "No se está recibiendo el rango correcto de IPs (en al menos un AP/VAP/zona)",
        "DH_SEVERAL_DHCPS": "Se están recibiendo IPs de más de un servidor DHCP (en al menos un AP/VAP/zona)",
        "DH_NO_NODE_TO_CONFIGURE": "No se han encontrado nodos que configurar",
        "DH_NO_DHCP_NODE_OK": "No se han encontrado ningún servidor DHCP con las propiedades requeridas",
        // captive portal errors
        "CP_PATH_NO_CP" : "Existe al menos un camino que permite acceder a Internet sin pasar por un portal cautivo",
        "CP_NO_RADIUS" : "No hay conectividad entre el portal cautivo y un servidor RADIUS",
        "CP_NO_PATH_INTERNET": "No se ha encontrado ningún camino hacia Internet pasando por un portal cautivo",
        // WPA_ENTERPRISE
        "WE_NO_PATH_RADIUS": "No hay conectividad de al menos un AP con un servidor RADIUS",
        "WE_PASSWORD_MISMATCH": "La contraseña del punto de acceso no coincide con la que tiene asociada en el servidor RADIUS o no  se ha especificado alguna de las dos",
        // ZONE
        "ZN_NO_FRONTIER_NODE": "No se han encontrado nodos frontera de zona(wireless-link, etc.) que cumplan las requisitos especificados por la restricción",
        "ZN_NO_ZONE_CANDIDATES": "No se han encontrado candidatos a formar parte de la zona (revisar propiedades de los nodos)",
        "ZN_ZONE_CONFLICT": "Conflicto de zonas. Comprueba el campo zone de los wireless-link y que todos los nodos están conectados a su wireless-link y no a otros",
        "ZN_NODE_NOT_FOUND": "No se han encontrado nodos en la zona con las propiedades especificadas",
        "ZN_NODE_FORBIDDEN_FOUND": "Se han encontrado nodos con propiedades no permitidas en esa zona",
        // WIRELESS LINK
        "WL_NO_BS": "No se ha encontrado la estación base",
        "WL_NO_SUBS": "No se han encontrado subscriptores",
        "WL_NO_WL_CONNECTIVITY": "No hay un radioenlace entre estación base y suscriptor",
        "WL_NO_ZONE_CONNECTIVITY": "Las zonas no están conectadas",
        "WL_MAX_EIRP_EXCEEDED": "PIRE máxima excedida",
        "WL_MAX_TX_POW_EXCEEDED": "Potencía máxima de transmisión excedida",
        "WL_WRONG_SENS": "Valor de sensibilidad incorrecto",
        "WL_POWER_BUDGET_FAIL": "No se ha superado el cálculo del balance de potencias (nivel de señal en recepción insuficiente)"
        
    },
    "ui" :
        {// errors
        "ZONE_CONFLICT": "CONFLICTO DE ZONAS",
        // web
        "TAB_TITLE": "Redes Inámbricas. Práctica 4.3",
        "WINDOW_TITLE": "REDES INALÁMBRICAS. Práctica 4.3. Diseño del esquema lógico de red",
        // buttons
        "button": {
            "EVALUATE": "Evaluar red",
            "CHANGE_ITEM_PROPS": "Cambiar propiedades ",
            "SIGN_OUT": "cerrar sesión"
        },
        "ITEM_PROPS_TITLE": "Propiedades del elemento",
        "NODE_PROPS_TITLE": "Propiedades del nodo",
        "LINK_PROPS_TITLE": "Propiedades del enlace entre ",
        "ITEM_PROPS_HELP": "Haz doble click sobre un nodo o enlace para mostrar y editar sus propiedades",
        "PROBLEM_DESCRIPTION": "Descripción del problema",
        "PROBLEM_DESCRIPTION_TITLE": "Descripción del problema",
        // eval
        "REST_OK_PRECENT": "restricciones OK",
        "NETEVAL_DESCRIPTION": "Herramienta para diseño y evaluación de redes inalámbricas", 
        "HOME_INSTRUCTIONS_P1": "En los siguientes ejercicios se te planteará que crees redes de acuerdo a unos requisitos. Podrás verificar automáticamente si tu red cumple los requisitos y obtener una puntuación.",
        "HOME_INSTRUCTIONS_P2": "Los resultados que envíes serán almancenados en servidor. Podrás continuar en cualquier momento por donde lo dejaste.",
        "SAMPLE_SECTION_TITLE": "Ejercicios de prueba de NetEval", 
        "SAMPLE_EX1_TITLE": "Ejercicio 1. Puntos de acceso virtuales",
        "SAMPLE_EX1_DESC": "En este ejercicio se usará un punto de acceso físico para crear dos redes virtuales", 
        "SAMPLE_EX2_TITLE": "Ejercicio 2. Caso práctico",
        "SAMPLE_EX2_DESC": "En este ejercicio se diseñará una red para dar acceso a Internet a localizaciones remotas",
        "SAMPLE_EX3_TITLE": "Tu propia red",
        "SAMPLE_EX3_DESC": "Puedes usar este ejercicio para dibujar una red sin restricciones (para poder hacer capturas de ella)",
        "GO": "Vamos!",  // "Vamos!"
        "CHANGE_SVG_HEIGHT": "Cambiar altura del panel de diseño", 
        "ENLARGE": "Agrandar",
        "REDUCE": "Reducir",
        "FEEDBACK_PANEL_TITLE": "Evaluación de la maqueta",
        "LOGOUT": "Cerrar sesión",
        "ADMIN_SECTION_TITLE": "Operaciones del administrador",
        "ADMIN_UPLOAD_TITLE": "Subida de ejercicios",
        "ADMIN_UPLOAD_DESCRIPTION": "Puedes subir ejercicios modicando el archivo(patrón) template.ejs y dándole otro nombre.  La ruta para acceder a los nuevos ejercicios será <dominio>/challenges/<fichero> (sin la extensión del fichero)",
        "ADMIN_MONITOR_TITLE": "Monitorización de usuarios",
        "ADMIN_MONITOR_DESCRIPTION": "Enlace a la página de monitorización de usuarios (puntuaciones, envíos, datos de los usuarios, etc.)",
        "MUST_LOG_IN": "Debes iniciar sesión para usar la aplicación",
        "NO_PERMISSION": "No tienes permiso para acceder a este recurso"
         
    }
}
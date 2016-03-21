/*
 * Client code for TigerGammonServer HTML5 Client
 *
 * This file is licensed under the Affero General Public License
 * version 3 or later; see LICENSE
 *
 * @author Andreas Hausmann <andreas@tigergammon.com>
 * @copyright Andreas Hausmann 2016
 *
*/

var DEVELOP_MODE = false;
var CLIENT_LABEL = 'TiGa-0.8-1';
var CLIENT_PROTOCOL = '2010';
var HOST_PORT = {//'themisto': "192.168.1.201:8001",
                 //'uranus': "192.168.1.214:8001",
                 'localhost': "127.0.0.1:8001",
                 //'TGS': "tigergammon.com:8080"
    };
var serverChoser = document.getElementById("switchservers");

function loadTGCConnection() {
  var tgc = (function() {
    var signal_colors = {1: "green", 3: "red", 0: "orange"};
    var login = document.getElementById("login"),
        denied = document.getElementById("denied"),
        regismsg = document.getElementById("registration"),
        greeting = document.getElementById("greeting"),
        goodbye = document.getElementById("goodbye");

    return {
        connectionData: {},
        checkConnections: function() {
            if (window.WebSocket === undefined) {
-                /* Das hier sollte einen alternativen Zweig starten
-                 * mit Darstellung von Erklärung und kein login erlauben.*/
                alert("Websockets undefined");
            } else {
                this.connectionData['setHost'] = function (host) {
                        this['data-host'] = host;
                    };
                function ping(host, host_port, multiple) {
                    function displayConnection(host, host_port, state, multiple) {
                        var $s = $("#sockets tr");
                        var h = host_port.split(':');
                        var choser = '';
                        if (multiple) {
                            choser = "<input type=\"radio\" name=\"socket\" value=\""+
                                     host+"\" checked=\"checked\" onclick=\""+
                                     "connectionData.setHost('"+host_port+"');\"/>";
                        }
                        var row = "<tr><td>"+choser+"</td><td>"+host+":</td><td>"+h[0]+
                                  "</td><td>"+h[1]+"</td><td id=\""+host+"Status\"> r </td></tr>";
                        $s.last().after($(row));
                        var $d = $s.find("td").filter("#discard");
                        if ($d.length > 0) {
                            $d.parent().remove();
                        }
                        $("#sockets").attr('data-host', host_port);
                        $("#sockets #"+host+"Status").attr('class', signal_colors[state]);
                    }
                    var registerConnection = function() {
                        return function(state, obj) {
                            obj.connectionData[host] = host_port;
                            obj.connectionData.setHost(host_port);
                            displayConnection(host, host_port, state, multiple);
                            };
                        }();
                    var ws = new WebSocket("ws://"+host_port+"/ws");
                    ws.onopen = function() {
                        ws.send("ping");
                    };
                    ws.onmessage = function(event) {
                        var data = event.data.split(',');
                        var state = ws.readyState;
                        ws.close();
                        if ($.inArray(CLIENT_PROTOCOL, data) != -1) {
                            registerConnection(state, window.tgcCnct);
                        }
                    };
                };
                var HP = HOST_PORT;
                var multiple = Object.keys(HP).length > 1;
                for (var h in HP) {
                    ping(h, HP[h], multiple);
                }
            }
        },
        handOver: function(client) {
            client.ws = tgc.ws;
            client.nickname = tgc.nickname;
        },
        openSession: function(mode, fullLogin) {
            var hp = window.tgcCnct.connectionData['data-host'];
            var registration = function (msg) {
                    if (msg.indexOf('** ') > -1) {
                        regismsg.innerHTML = msg;
                        regismsg.style.display = "block";
                    }
                };
            var tgcLogin = function(loginCmd) {
                if (typeof denied !== 'undefined' && denied != null) {
                    denied.style.display = "none";
                }
                ws.send(loginCmd);
                return true;
            };
            var littleParse = function(msg) {
                var action_parts = msg.split("#");
                if (action_parts.length > 1) {
                    var act = action_parts[0];
                    var cmd = action_parts[1];
                    switch (act) {
                        case "000":
                            //tgc.action.access_denied(cmd);    TODO:0l: muss dargestellt werden
                            break;
                        case "001":
                            var tgcClient = window.open("client.html");
                            tgc.nickname = cmd;
/*                            regismsg.style.display = "none";
  */                          break;
                    }
                }
            };

            var ws = new WebSocket("ws://"+hp+"/ws");
            tgc.ws = ws;
            ws.onopen = function() {
                if (mode != 'fullLogin') {
                    var name = document.getElementById("login_name").value,
                        passwd = document.getElementById("login_password").value,
                        login = mode+" "+name+" "+passwd+" "+
                                CLIENT_LABEL+" "+CLIENT_PROTOCOL;
                    fullLogin = login;
                    if (name == '' || passwd == '') {
                        registration('** please give a name and a password');
                        return;
                    }
                }
                tgcLogin(fullLogin);
            };
            ws.onclose = function(event) {
                return; //tgc.action.showBye();       TODO:0l: brauch ich das?
            };
            ws.onmessage = function(evt) {
                littleParse(evt.data);
            };
        },
    };
  }());
  window.tgcCnct = tgc;
  tgc.checkConnections();
//  if (window.tgcConfig.DEVELOP_MODE) {
  if (DEVELOP_MODE) {
    if (typeof serverChoser !== 'undefined' && serverChoser != null) {
        serverChoser.style.display = "block";
    }
  }
};

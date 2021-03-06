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

var CLIENT_VERSION = window.tgcConfig.VERSION;
var CLIENT_LABEL = 'TiGa-' + CLIENT_VERSION;
var CLIENT_PROTOCOL = '2010';
var $login = jQuery("#login");

function loadTGCConnection() {
  var tgc = (function() {
    var signal_colors = {1: "green", 3: "red", 0: "orange"};

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
                                     "tgcCnct.connectionData.setHost('"+host_port+"');\"/>";
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
                var HP = window.tgcConfig.HOST_PORT;
                var multiple = Object.keys(HP).length > 1;
                for (var h in HP) {
                    ping(h, HP[h], multiple);
                }
            }
        },
        start_registration: function () {
            $('#loginPrompt').html('Chose a nick and password');
            $('#login_name').attr("placeholder", "Pick a username");
            $('#login_password').attr("placeholder", "Create a password");
            $('#registerButton').show();
            $('#loginButton').hide();
        },
        reset_login: function () {
            $('#loginPrompt').html('Login to TigerGammon or <span class="softLink" onclick="tgcCnct.start_registration();">create an account</span> if you are new!');
            $('#login_name').attr("placeholder", "Username");
            $('#login_password').attr("placeholder", "Password");
            $('#registerButton').hide();
            $('#loginButton').show();
        },
        access_denied: function (nick) {
            var denied = document.getElementById("denied"),
                target = document.getElementById("user-name"),
                greeting = document.getElementById("greeting");
            greeting.style.display = "none";
            denied.style.display = "block";
            target.innerHTML = nick;
        },
        registration_error: function (msg) {
            var regismsg = document.getElementById("introMsg");
            regismsg.style.display = "none";
            regismsg = document.getElementById("registration");
            regismsg.style.display = "block";
            regismsg.innerHTML = msg;
        },
        openSession: function(mode, label, fullLogin) {
            var hp = window.tgcCnct.connectionData['data-host'];
            var registration = function (msg) {
                    if (msg.indexOf('** ') > -1) {
                        var regismsg = document.getElementById("registration");
                        regismsg.innerHTML = msg;
                        regismsg.style.display = "block";
                    }
                };
            var tgcLogin = function(loginCmd) {
                var denied = document.getElementById("denied");
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
                            tgcCnct.access_denied(cmd);
                            break;
                        case "002":
                            tgcCnct.registration_error(cmd);
                            break;
                        case "001":
                            loadTGC();
                            window.tgc.clocks = loadTGCClock();
                            window.tgc.nickname = cmd;
                            window.tgc.version = label;
                            window.tgc.ws = ws;
                            $login.hide();
                            tgcCnct.reset_login();
                            window.tgc.startClient();
                            var regismsg = document.getElementById("registration");
                            if (typeof regismsg !== 'undefined' && regismsg != null) {
                                regismsg.style.display = "none";
                            }
                            break;
                    }
                }
            };

            var ws = new WebSocket("ws://"+hp+"/ws");
            tgc.ws = ws;
            ws.onopen = function() {
                $("#goodbye").hide();
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
        closeSession: function () {
            jQuery("#greeting").hide();
            jQuery("#goodbye").show();
            $login.show();
        },
    };
  }());
  window.tgcCnct = tgc;
  tgc.checkConnections();
  if(typeof(Storage) !== "undefined") {
    if (typeof(sessionStorage.name) !== "undefined") {
        if (sessionStorage.board == 'brownboard') {
            $("head").append($('<link rel="stylesheet" type="text/css" href="board2.css">'));
            sessionStorage.board = 'board2';
        } else {
            $("head").append($('<link rel="stylesheet" type="text/css" href="board1.css">'));
            sessionStorage.board = 'board1';
        }
        $login.load("flogin.html",
              function () {
                  $login.show();
                  ebifConnect();
              }
        );
    } else {
        $("head").append($('<link rel="stylesheet" type="text/css" href="board.css">'));
        sessionStorage.board = 'board';
        $login.load("login.html",
              function () {
                  $login.show();
                  if (window.tgcConfig.DEVELOP_MODE) {
                    var serverChoser = document.getElementById("switchservers");
                    if (typeof serverChoser !== 'undefined' && serverChoser != null) {
                        serverChoser.style.display = "block";
                    }
                  }
              }
        );
    }
  } else {
    // Sorry! No Web Storage support..
    // TODO:0l: get a intelligent message here
  }
};

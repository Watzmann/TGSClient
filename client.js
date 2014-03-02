/*
 * Client code for TigerGammonServer HTML5 Client
 *
 * (c) 2013, 2014 Andreas Hausmann
 * Licensed under AGPL3; see LICENSE
 *
 *
*/

var HOST_PORT = {'rechner1': "192.168.1.204:8001",
                 'rechner2': "192.168.1.201:8001",
                 'TGS': "tigergammon.com:8080"
                 };
var CLIENT_PROTOCOL = '2010';

function loadTGC() {
  var tgc = (function() {
    var signal_colors = {1: "green", 3: "red", 0: "orange"};
    var input_field = document.getElementById("send_input");
    var login = document.getElementById("login"),
        denied = document.getElementById("denied"),
        client = document.getElementById("client"),
        greeting = document.getElementById("greeting"),
        goodbye = document.getElementById("goodbye"),
        systempane = document.getElementById("system"),
        board = document.getElementById("board"),
        board2 = document.getElementById("board2"),
        players = document.getElementById("players"),
        systemLine = document.getElementById("systemLine"),
        shoutTarget = document.getElementById("shouts"),
        tellTarget = document.getElementById("tells"),
        shoutField = document.getElementById("send_shout"),
        tellField = document.getElementById("send_tell"),
        gameLog = document.getElementById("board_received");

    function lineBreak(msg) {
        return msg + '\n';
    }

    return {
        action: {
            playersList: {},
            plRowElement: {'start': '<tr class="playersList"><td>',
                           'starto': '<tr class="playersList"><td class="playersName">',
                           'end':  '</td></tr>',
                           'running':  '</td><td>',
                            },
            access_denied: function (nick) {
                denied.style.display = "block";
                var target = document.getElementById("user-name");
                target.innerHTML = nick;
                tgc.cc.reopen();
            },
            showBye: function () {
                greeting.style.display = "none";
                goodbye.style.display = "block";
            },
            showClient: function (enter) {
                if (enter) {
                    login.style.display = "none";
                    client.style.display = "block";
                } else {
                    client.style.display = "none";
                    login.style.display = "block";
                }
            },
            set_nick: function (nick) {
                this.showClient(true);
                var target = document.getElementById("nick");
                target.innerHTML = nick;
                tgc.selfNick = nick;
            },
            whoFormat1Head: function () {
                var heading = {user: "Name",
                               status: " S ",
                               rating: "Rating",
                               experience: "Exp",
                               idle: "Idle",
                               };
                var line = sprintf("%(user)-24s %(status)4s %(rating)7s %(experience)5s %(idle)5s", heading);
                return "<span style=\"font-weight:bold\">" + line + "</span>";
            },
            whoFormat1: function (player) {
                player['status'] = "-R"[player['ready']] + " ";
                return sprintf("%(user)-24s %(status)4s %(rating)7.2f %(experience)5d %(idle)5s", player);
    // %(user)s %(opponent)s %(watching)s %(ready)s ' \
    //            '%(away)s %(login)s ' \
    //            '%(hostname)s %(client)s %(email)s
    //        w = '%(status)s %(user)-14s %(login)5s ' \
    //            '%(hostname)s' % args
            },
            displayPlayersList: function (playerList) {
                function setInvite(index, element) {
                    var $e = $(element),
                        name = $e.html();
                    $e.on("mousedown", function(event) {
                                tgc.dialogs.invite(name)(event);
                                });
                }
                $("tr.playersList").remove();
                var $h = $("tr.playersHeading"),
                    s = this.plRowElement.start,
                    so = this.plRowElement.starto,
                    e = this.plRowElement.end,
                    r = this.plRowElement.running;
                for (var pl in playerList) {
                    var p = playerList[pl],
                        st = "-R"[p['ready']] + " ",
                        sx = p.user == tgc.selfNick ? s : so,
                        line = sx+p.user+r+st+r+p.rating+r+p.experience+r+p.idle+e;
                    $h.last().after($(line));
                }
                $("#playersList td.playersName").each(setInvite);
            },
            who: function (list_of_players) {
                this.playersList = {};
                for (var p = 1, len = list_of_players.length-1; p < len; p++) {
                    var po = JSON.parse(list_of_players[p]);
                    this.playersList[po['user']] = po;
                }
                this.displayPlayersList(this.playersList);
            },
            whoUpdate: function (list_of_players) {
                for (var p = 1, len = list_of_players.length-1; p < len; p++) {
                    var po = JSON.parse(list_of_players[p]);
                    this.playersList[po['user']] = po;
                }
                this.displayPlayersList(this.playersList);
            },
            delFromPL: function (player) {
                delete this.playersList[player];
                this.displayPlayersList(this.playersList);
            },
            system: function (result) {
                var target = systemLine;
                target.innerHTML = result;
            },
            shouts: function (result) {
                var target = shoutTarget;
                target.value = target.value + result;
                target.scrollTop = target.scrollHeight - target.clientHeight;
            },
            tells: function (result) {
                var target = tellTarget;
                target.value = target.value + result;
                target.scrollTop = target.scrollHeight - target.clientHeight;
            },
            gameProtocol: function (result) {
                var target = gameLog;
                target.value = target.value + result;
                target.scrollTop = target.scrollHeight - target.clientHeight;
            },
            board: function (result) {
                var board2 = document.getElementById("board2"),
                    boardpane = document.getElementById("boardpane");
                    // TODO:0j: das hier soll nur einmal gemacht werden. Also hoch in das Objekt.
                if (result.indexOf("BAR") != -1) {
                    tgc.board.showAscii(boardpane, result);
                } else if (result.indexOf("board:") != -1) {
                    /* Rendering of board-string "board:......" */
                    boardpane.style.display = "none";
                    tgc.board.draw("#boardarea", result);
                } else if (result.indexOf("Type 'join' if you want") != -1) {
                    /* TODO:0j: of course this should be an 'exx#....' message!! */
                    /* Automatically joining the next game in this match. */
                    tgc.cc.sendCmd("join");
                } else if ((result.indexOf("roll") != -1) ||
                           (result.indexOf("move") != -1) ||
                           (result.indexOf("Type 'accept'") != -1))  {
                    tgc.action.gameProtocol(result);
                } else {
                    tgc.action.system(result);
                }
            },
            focus: null
        },
        parse: function(msg) {
            var action_parts = msg.split("#");
            if (action_parts.length > 1) {
                var act = action_parts[0];
                var cmd = action_parts[1];
                switch (act) {
                    /* This is the way to go: messages with message ids like
                     * cdd#...... (c=character, d=digit, #=separator, ....= msg)
                     * */
                    case "000":
                        tgc.action.access_denied(cmd);
                        break;
                    case "001":
                        tgc.action.set_nick(cmd);
                        break;
                    case "c01":
                        var data = JSON.parse(cmd),
                            line = sprintf("You            : %(message)s\n", data)
                        tgc.action.shouts(line);
                        break;
                    case "c02":
                        var data = JSON.parse(cmd),
                            line = sprintf("%(name)-15s: %(message)s\n", data)
                        tgc.action.shouts(line);
                        break;
                    case "d01":
                        var data = JSON.parse(cmd),
                            line = sprintf("-> %(name)-12s: %(message)s\n", data)
                        tgc.action.tells(line);
                        break;
                    case "d02":
                        var data = JSON.parse(cmd),
                            line = sprintf("%(name)-15s: %(message)s\n", data)
                        tgc.action.tells(line);
                        break;
                    case "g01":
                        tgc.action.who(action_parts);
                        break;
                    case "g02":
                        tgc.action.whoUpdate(action_parts);
                        break;
                    case "b04":
                        var data = JSON.parse(cmd);
                        tgc.action.delFromPL(data['name']);
                        break;
                    default:
                        tgc.action.focus(msg);
                    // unterdruecken: "User not known or wrong password" (ist das noch aktuell???)
                }
                return;
            }
            /* Don't use this way of interpretation; instead use msg-ids above. */
            else if (msg.indexOf("running match was loaded.") != -1) {
                tgc.cc.sendCmd("set b 3");  /* TODO:0k: set this in the server, hard */
                tgc.navigate.show("board");
            }
            else if (msg.indexOf("Starting a new game with") != -1) {
                tgc.cc.sendCmd("set b 3");
                tgc.navigate.show("board");
            }
            tgc.action.focus(msg);
        },
        connectionData: { /* This is a container for connection calls;
                 they are constructed during the checkConnection() call. */
        },
        checkConnections: function() {
            if (window.WebSocket === undefined) {
-                /* Das hier sollte einen alternativen Zweig starten
-                 * mit Darstellung von Erklärung und kein login erlauben.*/
                alert("Websockets undefined");
            } else {
                tgc.connectionData['setHost'] = function (host) {
                        $('#sockets').attr('data-host',host);
                    };
                function ping(host, host_port, multiple) {
                    function displayConnection(host, host_port, state, multiple) {
                        var $s = $("#sockets tr");
                        var h = host_port.split(':');
                        var choser = '';
                        if (multiple) {
                            choser = "<input type=\"radio\" name=\"socket\" value=\""+
                                     host+"\" checked=\"checked\" onclick=\""+
                                     "tgc.connectionData.setHost('"+host_port+"');\"/>";
                        }
                        var row = "<tr><td>"+choser+"</td><td>"+host+":</td><td>"+h[0]+
                                  "</td><td>"+h[1]+"</td><td id=\""+host+"Status\"> r </td></tr>";
                        $(row).insertAfter($s);
                        var $d = $s.find("td").filter("#discard");
                        if ($d.length > 0) {
                            $d.parent().remove();
                        }
                        $("#sockets").attr('data-host', host_port);
                        $("#sockets #"+host+"Status").attr('class', signal_colors[state]);
                    }
                    var registerConnection = function() {
                        return function(state) {
                            tgc.connectionData[host] = host_port;
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
                            registerConnection(state);
                        }
                    };
                };
                var multiple = Object.keys(HOST_PORT).length > 1;
                for (var h in HOST_PORT) {
                    ping(h, HOST_PORT[h], multiple);
                }
            }
        },
        cc: { /* This is a container for connection calls;
                 they are constructed during the openConnection() call. */
            /* TODO:0j: das muss doch hier drin gemacht werden;
             *          aber 'ws' muss bekannt sein */
        },
        openSession: function() {
            var hp = $("#sockets").attr('data-host');
            var ws = new WebSocket("ws://"+hp+"/ws");
            ws.onopen = function() {
                var name = document.getElementById("login_name"),
                    passwd = document.getElementById("login_password");
                tgc.cc.login(name.value, passwd.value, CLIENT_PROTOCOL);
                tgc.action.focus = tgc.action.system;
                tgc.board = loadBoard();
            };
            ws.onclose = function(event) {
                tgc.action.showBye();
                tgc.action.showClient(false);
            };
            ws.onmessage = function(evt) {
                    var data = evt.data;
                    tgc.parse(data);
                };
            tgc.cc.send_data = function() {
                ws.send(input_field.value);
                input_field.value = "";
            };
            tgc.cc.send_tell = function() {
                ws.send('tell '+tellField.value);
                tellField.value = "";
            };
            tgc.cc.send_shout = function() {
                ws.send('shout '+shoutField.value);
                shoutField.value = "";
            };
            tgc.cc.shutdown = function() {
                ws.send("ciao");
                ws.close();
            };
            tgc.cc.sendWho = function() {
                ws.send("who");
            };
            tgc.cc.sendCmd = function(msg) {
                ws.send(msg);
            };
            tgc.cc.login = function(name, passwd, protVersion) {
                ws.send("login "+name+" "+passwd+" "+protVersion);
                return true;
            };
            tgc.cc.reopen = function() {
                tgc.openConnection();
            };
        },
        navigate: {
            show: function(element) {
                switch (element) {
                    case "board":
                        systempane.style.display = "none";
                        players.style.display = "none";
                        board.style.display = "block";
                        tgc.action.focus = tgc.action.board;
                        /* TODO:0j: Protocol msgs should go to a separate window
                         *          that might be a fly out. This window may be
                         *          invisible; cmp to 'Tasks' in 'gmail'.     */
                        tgc.cc.sendCmd('board');
                        break;
                    case "system":
                        board.style.display = "none";
                        players.style.display = "none";
                        systempane.style.display = "block";
                        tgc.action.focus = tgc.action.system;
                        break;
                    case "players":
                        tgc.cc.sendWho();
                        board.style.display = "none";
                        systempane.style.display = "none";
                        players.style.display = "block";
                        tgc.action.focus = tgc.action.system;
                        break;
                    default:
                        ;
                };
            }
        }
    };
  }());
  tgc.checkConnections();
  tgc.dialogs = loadDialogs();
  window.tgc = tgc;
};

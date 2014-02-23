/*
 * Client code for TigerGammon HTML5 client
 *
 * (c) 2013 Dr. Andreas Hausmann
 *
 *
*/

function loadTGC(host_port) {
  var tgc = (function() {
    var signal_colors = {1: "green", 3: "red", 0: "orange"};
    var state = document.getElementById("status"),
        host = document.getElementById("host"),
        input_field = document.getElementById("send_input");
    var login = document.getElementById("login"),
        denied = document.getElementById("denied"),
        client = document.getElementById("client"),
        systempane = document.getElementById("system"),
        board = document.getElementById("board"),
        board2 = document.getElementById("board2"),
        players = document.getElementById("players");
    return {
        action: {
            playersList: {},
            access_denied: function (nick) {
                denied.style.display = "block";
                var target = document.getElementById("user-name");
                target.innerHTML = nick;
                tgc.cc.reopen();
            },
            set_nick: function (nick) {
                login.style.display = "none";
                client.style.display = "block";
                var target = document.getElementById("nick");
                target.innerHTML = "You are logged in as <i>"+nick+"</i>";
            },
            whoFormat1Head: function () {
                var heading = {user: "Name",
                               rating: "Rating",
                               experience: "Exp",
                               idle: "Idle",
                               };
                var line = sprintf("%(user)-14s %(rating)7s %(experience)5s %(idle)5s", heading);
                return "<span style=\"font-weight:bold\">" + line + "</span>";
            },
            whoFormat1: function (player) {
                return sprintf("%(user)-14s %(rating)7.2f %(experience)5d %(idle)5s", player);
    // %(user)s %(opponent)s %(watching)s %(ready)s ' \
    //            '%(away)s %(login)s ' \
    //            '%(hostname)s %(client)s %(email)s
    //        w = '%(status)s %(user)-14s %(login)5s ' \
    //            '%(hostname)s' % args
            },
            displayPlayersList: function (pl) {
                var target = document.getElementById("players_list");
                target.innerHTML = this.whoFormat1Head() + "<br>";
                for (var p in pl) {
                    target.innerHTML += this.whoFormat1(pl[p]) + "<br>";
                }
            },
            who: function (list_of_players) {
                this.playersList = {};
                for (var p = 1, len = list_of_players.length-1; p < len; p++) {
                    var po = eval("(" + list_of_players[p] + ")");
                    this.playersList[po['user']] = po;
                }
                this.displayPlayersList(this.playersList);
            },
            whoUpdate: function (list_of_players) {
                for (var p = 1, len = list_of_players.length-1; p < len; p++) {
                    var po = eval("(" + list_of_players[p] + ")");
                    this.playersList[po['user']] = po;
                }
                this.displayPlayersList(this.playersList);
            },
            delFromPL: function (player) {
                delete this.playersList[player];
                this.displayPlayersList(this.playersList);
            },
            system: function (result) {
                var target = document.getElementById("received");
                target.value = target.value + result;
                target.scrollTop = target.scrollHeight - target.clientHeight;
            },
            gameProtocol: function (result) {
                var target = document.getElementById("board_received");
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
                tgc.cc.sendCmd("set b 3");
                tgc.navigate.show("board");
            }
            else if (msg.indexOf("Starting a new game with") != -1) {
                tgc.cc.sendCmd("set b 3");
                tgc.navigate.show("board");
            }
            tgc.action.focus(msg);
        },
        _statusIndicators: {
            onopen: function(wsState) {
                state.innerHTML = 'open ' + wsState;
                state.className = signal_colors[wsState];
            },
            onclose: function(wsState) {
                state.innerHTML = 'closed ' + wsState;
                state.className = signal_colors[wsState];
            },
            onmessage: function(wsState) {
                state.innerHTML = 'open ' + wsState;
                state.className = signal_colors[wsState];
            },
            wsUndefined: function(wsState) {
                state.innerHTML = 'not supported';
                state.className = signal_colors[wsState];
            }
        },
        cc: { /* This is a container for connection calls;
                 they are constructed during the openConnection() call. */
            /* TODO:0j: das muss doch hier drin gemacht werden;
             *          aber 'ws' muss bekannt sein */
        },
        openConnection: function(host_port) {
            var ws = new WebSocket("ws://"+host_port+"/ws");
            ws.onopen = function() {
                tgc._statusIndicators.onopen(ws.readyState);
            };
            ws.onclose = function(event) {
                ws.send("ciao again");
                window.location = "ciao"
            };
            ws.onmessage = function(evt) {
                var data = evt.data;
                tgc.parse(data);
            };
            tgc._statusIndicators.onopen(ws.readyState);
            host.innerHTML = host_port; /* TODO:0j: das geht noch sauberer (code raus hier!) */
            if (window.WebSocket === undefined) {
                /* Das hier gehört höher und sollte einen alternativen Zweig starten
                 * mit Darstellung von Erklärung und kein login erlauben.*/
                tgc._statusIndicators.wsUndefined(ws.readyState);
            };
            tgc.cc.send_data = function() {
                ws.send(input_field.value);
                input_field.value = "";
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
            tgc.cc.login = function() {
                var name = document.getElementById("login_name"),
                    passwd = document.getElementById("login_password");
                ws.send("login "+name.value+" "+passwd.value);
                return true;
            };
            tgc.cc.reopen = function() {
                tgc.openConnection(host_port);
            }
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
  })();
  tgc.openConnection(host_port);
  tgc.action.focus = tgc.action.system;
  tgc.board = loadBoard();
  window.tgc = tgc;
};

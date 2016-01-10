/*
 * Client code for TigerGammonServer HTML5 Client
 *
 * This file is licensed under the Affero General Public License
 * version 3 or later; see LICENSE
 *
 * @author Andreas Hausmann <andreas@tigergammon.com>
 * @copyright Andreas Hausmann 2013 - 2015
 *
*/

var CLIENT_LABEL = 'TiGa-' + window.tgcConfig.VERSION;
var CLIENT_PROTOCOL = '2010';

function loadTGC() {
  var tgc = (function() {
    var signal_colors = {1: "green", 3: "red", 0: "orange"};
    var $inputField = jQuery("#send_input"),
        $shoutField = jQuery("#send_shout"),
        $tellField = jQuery("#send_tell"),
        $adrTellField = jQuery("#adr_tell"),
        $sayField = jQuery("#send_say");
    var selfrating = document.getElementById("selfRating"),
        selfexp = document.getElementById("selfExp"),
        selflogin = document.getElementById("selfLogin"),
        selfclient = document.getElementById("selfClient"),
        selfstatus = document.getElementById("selfStatus"),
        login = document.getElementById("login"),
        denied = document.getElementById("denied"),
        regismsg = document.getElementById("registration"),
        client = document.getElementById("client"),
        greeting = document.getElementById("greeting"),
        goodbye = document.getElementById("goodbye"),
        communicationpane = document.getElementById("communication"),
        developpane = document.getElementById("develop"),
        board = document.getElementById("board"),
        board2 = document.getElementById("board2"),
        information = document.getElementById("information"),
        settings = document.getElementById("settings"),
        players = document.getElementById("players"),
        systemLine = document.getElementById("systemLine"),
        shoutTarget = document.getElementById("shouts"),
        tellTarget = document.getElementById("tells"),
        sayTarget = document.getElementById("says"),
        gameLog = document.getElementById("board_received"),
        gameInfo = document.getElementById("gameInfo"),
        devMessages = document.getElementById("devMessages"),
        serverChoser = document.getElementById("switchservers"),
        alarmSound = document.getElementById("soundSuccess");

    var gameLinenumber;
    var variantMapper = {
            standard: ['standard', 'Game'],
            nack: ['standard', 'Nackgammon'],
            hyper: ['standard', 'Hypergammon'],
            tavli: ['portes', 'Portes'],
            portes: ['portes', 'Portes'],
            plakoto: ['plakoto', 'Plakoto'],
            fevga: ['fevga', 'Fevga'],
    }

    function lineBreak(msg) {
        return msg + '\n';
    }

    function sAlarm() {
        var $sb = $('#systemButton'),
            $pb = $('#playersButton'),
            sbc = $sb.attr('class'),
            pbc = $pb.attr('class'),
            tmsg = 'there are messages for you';
        if (((sbc.indexOf('bselected') == -1) && (pbc.indexOf('bselected') == -1))
                                              && (sbc.indexOf('alarm') == -1)) {
            $sb.attr({'class': sbc+' alarm', 'title': tmsg});
            $pb.attr({'class': pbc+' alarm', 'title': tmsg});
            alarmSound.play();
        }
    }

    return {
        action: {
            playersList: {},
            plRowElement: {'start': '<tr class="playersEntry"><td class="la self">',
                           'starto': '<tr class="playersEntry"><td class="la">',
                           'starti': '<tr class="playersEntry"><td class="la invitable">',
                           'end':  '</td></tr>',
                           'running':  '</td><td>',
                           'runningLeft':  '</td><td class="la">',
                           'runningLeftPadding':  '</td><td class="lap">',
                            },
            sgRowElement: {'start': '<tr class="sglEntry"><td>',
                           'end':  '</td><td></td></tr>',
                           'endResume':  '</td><td><button>Resume</button></td></tr>',
                           'running':  '</td><td>',
                            },
            access_denied: function (nick) {
                denied.style.display = "block";
                var target = document.getElementById("user-name");
                target.innerHTML = nick;
            },
            registration: function (msg) {
                if (msg.indexOf('** ') > -1) {
                    regismsg.innerHTML = msg;
                    regismsg.style.display = "block";
                }
            },
            hideElement: function (e) {
                $(e).hide();
            },
            hideSavedGamesList: function () {
                $("#generalAlert").hide();
                jQuery("#generalAlert .gaContent").html("Content");
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
                var target = document.getElementById("selfNick");
                target.innerHTML = nick;
                tgc.selfNick = nick;
                selfclient.innerHTML = 'v'+window.tgcConfig.VERSION;
                window.onbeforeunload = function(){
                    return "You are about to log out of TigerGammon.\nAny game or settings will be saved.";
                };
            },
            updateSelf: function (data) {
                var status, color, w;
                selfrating.innerHTML = data.rating;
                selfexp.innerHTML = data.experience;
                selflogin.innerHTML = data.login;
                if (data.ready) {
                    color = 0x008000;
                    w = 0x000080;
                    status = 'ready';
                } else {
                    color = 0xB00000;
                    w = 0x008000;
                    status = 'not ready';
                }
                if (data.watching != "-") {
                    color += w;
                    status = 'watching';
                }
                if (data.away) {
                    color += 0x303030;
                    status = 'away';
                }
                $(".identity").css("background-color",color.toString(16));
                selfstatus.innerHTML = status;
//                data.idle
            },
            whoFormat1Head: function () {
                var heading = {user: "Name",
//  Gender
                               status: " S ",
                               rating: "Rating",
                               experience: "Exp",
                               idle: "Idle",
//  Country
                               mail: "Email",
//  Hostname
                               client: "Client",
//  Opponent
//  Watching
//  login
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
                $("tr.playersEntry").remove();
                var $h = $("tr.playersHeading"),
                    s = this.plRowElement.start,
                    so = this.plRowElement.starto,
                    si = this.plRowElement.starti,
                    e = this.plRowElement.end,
                    r = this.plRowElement.running,
                    rl = this.plRowElement.runningLeft,
                    rlp = this.plRowElement.runningLeftPadding;
                for (var pl in playerList) {
                    var p = playerList[pl],
                        st = "-R"[p['ready']] + " ",
                        sx = p.user == tgc.selfNick ? s : (p.ready && !p.away) ? si : so,
                        line = sx+p.user+rl+st+r+p.rating+r+p.experience+r+
                                p.idle+rlp+p.email+rl+p.client+e;
                    $h.after($(line));
                    $h = $(".playersEntry").last();
                }
                $("#playersList td.invitable").each(setInvite);
            },
            who: function (list_of_players) {
                this.playersList = {};
                this.whoUpdate(list_of_players);
            },
            whoUpdate: function (list_of_players) {
                for (var p = 1, len = list_of_players.length-1; p < len; p++) {
                    var po = JSON.parse(list_of_players[p]);
                    if ('>=<?'.indexOf(po.client[0]) > -1) {    // TODO:01: let this be handled by the server
                        po.client = "JavaFIBS 2001";
                    }
                    if (po.user == tgc.selfNick) {
                        this.updateSelf(po);
                    }
                    this.playersList[po['user']] = po;
                }
                this.displayPlayersList(this.playersList);
            },
            delFromPL: function (player) {
                delete this.playersList[player];
                this.displayPlayersList(this.playersList);
            },
            savedGames: function (listOfGames) {
                var s = this.sgRowElement.start,
                    en = this.sgRowElement.end,
                    er = this.sgRowElement.endResume,
                    r = this.sgRowElement.running,
                    e,
                    focus = tgc.blackBoard['savedGamesFocus'],
                    itype = focus == '#inviteSavedGames' ? 'inviteSavedGames' : 'savedGames';
                function setInvite(name, id, hide) { return (
                    function () {
                        id = (id == '' ? '1' : id);
                        tgc.cc.sendCmd("invite "+name +" #"+id);
                        hide();
                        return false;
                    });
                }
                function displaySavedGames() {
                    $("tr.sglEntry").remove();
                    var $h = $("#sglHeading"),
                        score, opp, hideAway, status, line;
                    this.gamesList = {};
                    for (var g = 1; g < listOfGames.length; g++) {
                        var sg = JSON.parse(listOfGames[g]);
                        if (this.gamesList[sg['opponent']] === undefined) {
                            this.gamesList[sg['opponent']] = [sg];
                        } else {
                            this.gamesList[sg['opponent']].push(sg);
                        }
                    }                                                           // TODO:00: if #opponents > 0 else "no saved games"
                    for (var o in this.gamesList) {                             // TODO:00: sort alphabetically
                        for (g = 0, gl = this.gamesList[o]; g < gl.length; g++) {
                                                                                // TODO:00: andreas  5 games       click displays list of 5 games
                                                                                // TODO:00: hannes   7 games       if #opponents > 1
                                                                                // TODO:00: playerX  3 0 - 2       only a single game
                            sg = gl[g];
                            score = sprintf("%2s - %2s", sg.sc1, sg.sc2);
                            if (focus == '#inviteSavedGames') {
                                opp = '';
                                hideAway = tgc.dialogs.hideInvite;
                            } else {
                                opp = sg.opponent+r;
                                hideAway = tgc.action.hideSavedGamesList;
                            }
                            status = parseInt(sg.status);
                            e = status > 1 ? er : en;
                            line = s+opp+sg.ML+r+score+r+sg.hold+sg.dele+r+sg.variation+e;
                            $h.after($(line));
                            $h = $(".sglEntry").last();
                            if (status > 1) {
                                $sbl = $(".sglEntry button").last()
                                $sbl.click(setInvite(sg.opponent,sg.mid,hideAway))
                                if (status == 2) {
                                    $sbl.attr('disabled', 'disabled')
                                }
                            }
                        }
                    }
                    jQuery(focus).show();
                }
                jQuery(focus+" .gaContent").load(itype+'.html', displaySavedGames);
            },
            invite: function (text, data) {
                var join_ = function () { return (function () {
                        tgc.cc.sendCmd("join " + data.name);
                        hide();
                        });
                    }();
                var decline_ = function () { return (function () {
                        tgc.cc.sendCmd("tell " + data.name +
                            " Sorry, not now. Thanks for the invitation.");
                        hide();
                        });
                    }();
                function hide () {
                    jQuery("#gotInvitation").hide()
                    jQuery("#gotInvitation #joinInvitation").off( "click", join_)
                    jQuery("#gotInvitation #rejectInvitation").off( "click", decline_);
                }
                jQuery("#gotInvitation .giContent").html(text);
                jQuery("#gotInvitation #joinInvitation").click(join_);
                jQuery("#gotInvitation #rejectInvitation").click(decline_);
                jQuery("#gotInvitation").show();
            },
            system: function (result) {
                var target = systemLine;
                target.innerHTML = result;
            },
            shouts: function (result) {
                var target = shoutTarget;
                sAlarm();
                target.value = target.value + result;
                target.scrollTop = target.scrollHeight - target.clientHeight;
            },
            tells: function (result, alarm) {
                var target = sayTarget;
                if (alarm && $('#boardButton').attr('class').indexOf('bselected') == -1) {
                    sAlarm();
                }
                target.value = target.value + result;
                target.scrollTop = target.scrollHeight - target.clientHeight;
                var target = tellTarget;
                target.value = target.value + result;
                target.scrollTop = target.scrollHeight - target.clientHeight;
            },
            gameProtocol: function (result) {
                var target = gameLog;
                target.value = target.value + result;
                target.scrollTop = target.scrollHeight - target.clientHeight;
            },
            clearGameProtocol: function () {
                var target = gameLog;
                target.value = '';
            },
            devLog: function (result) {
                var target = devMessages;
                target.value = target.value + result;
                target.scrollTop = target.scrollHeight - target.clientHeight;
            },
            board: function (result) {
                var board2 = document.getElementById("board2"),
                    bigBoard,
                    boardpane = document.getElementById("boardpane");
                    // TODO:0j: das hier soll nur einmal gemacht werden. Also hoch in das Objekt.
                if (result.indexOf("BAR") != -1) {
                    tgc.board.showAscii(boardpane, result);
                } else if (result.indexOf("board:") != -1) {
                    /* Rendering of board-string "board:......" */
                    bigBoard = result.split('M');   // TODO:00: watch out! .... don't split nicknames!!
                    this.gameProtocol(bigBoard[1])
                    boardpane.style.display = "none";
                    tgc.board.draw("#boardarea", bigBoard[0]);
                } else if (result.indexOf("Type 'join' if you want") != -1) {
                    /* TODO:0j: of course this should be an 'exx#....' message!! */
                    /* Automatically joining the next game in this match. */
                    tgc.cc.sendCmd("join");
                } else {
                    tgc.action.system(result);
                }
            },
            focus: null
        },
        parse: function(msg) {
            var action_parts = msg.split("#"),
                gameLineHeader = '';
            tgc.action.devLog(msg+'\n')
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
                        regismsg.style.display = "none";
                        tgc.action.set_nick(cmd);
                        tgc.navigate.show("players");
                        break;
                    case "c01":
                        var data = JSON.parse(cmd),
                            line = sprintf("You            : %(message)s\n", data);
                        tgc.action.shouts(line);
                        break;
                    case "c02":
                        var data = JSON.parse(cmd),
                            line = sprintf("%(name)-15s: %(message)s\n", data);
                        tgc.action.shouts(line);    // TODO:00: tells and shouts can contain " and #!!!!!!!!
                        break;
                    case "d01":
                        var data = JSON.parse(cmd),
                            line = sprintf("-> %(name)-12s: %(message)s\n", data);
                        tgc.action.tells(line, false);
                        break;
                    case "d02":
                    case "d04":
                    case "d06":
                        var data = JSON.parse(cmd),
                            line = sprintf("%(name)-15s: %(message)s\n", data);
                        tgc.action.tells(line, true);
                        break;
                    case "e01":
                        var data = JSON.parse(cmd);
                        tgc.board.resign("#boardarea", data);
                        break;
                    case "e08":
                        var data = JSON.parse(cmd);
                        gameLinenumber = 1;
                        gameInfo.innerHTML = sprintf("%(name)s wins the game and gets %(value)s.%(addon)s", data);
                        data['color'] = '.opponent';
                        tgc.board.finish("#boardarea", data);
                        break;
                    case "e09":
                        var data = JSON.parse(cmd);
                        gameLinenumber = 1;
                        gameInfo.innerHTML = sprintf("You win the game and get %(value)s. Congratulations!", data);
                        data['color'] = '.player';
                        tgc.board.finish("#boardarea", data);
                        break;
                    case "e10":
                        var data = JSON.parse(cmd);
                        gameInfo.innerHTML = sprintf("%(opponent)s gives up. You win %(value)s.", data);
                        data['color'] = '.player';
                        tgc.board.finish("#boardarea", data);
                        break;
                    case "e11":
                        var data = JSON.parse(cmd);
                        gameInfo.innerHTML = sprintf("You give up. %(name)s wins %(value)s.", data);
                        data['color'] = '.opponent';
                        tgc.board.finish("#boardarea", data);
                        break;
                    case "e12":
                        var data = JSON.parse(cmd);
                        gameInfo.innerHTML = sprintf("%(opponent)s gives up. %(name)s wins %(value)s.", data);
                        data['color'] = '.player';
                        tgc.board.finish("#boardarea", data);
                        break;
                    case "e17":
                    case "e18":
                        var data = JSON.parse(cmd);
                        data['line'] = sprintf(tgc.dialect[act], data);
                        gameInfo.innerHTML = data['line'];
                        tgc.board.finishMatch("#boardarea", data);
                        break;
                    case "e19":
                    case "e20":
                    case "e21":
                    case "e22":
                        gameLinenumber = 1;
                        var data = JSON.parse(cmd),
                            line = sprintf(tgc.dialect[act], data);
                        tgc.action.system(line);
                        tgc.action.clearGameProtocol();
                        tgc.navigate.show("board");
                        break;
                    case "e23":
                        var data = JSON.parse(cmd),
                            line = sprintf(tgc.dialect[act], data);
                        tgc.board.setVariant(variantMapper[data['variant']]);
                        tgc.action.system(line);
                        break;
                    case "e25":
                    case "e26":
                        // TODO:10: here we should display the dice in the board and wait a second
                    case "e34":
                    case "e29":
                    case "e38":
                    case "e30":
                    case "e37":
                        break;
                    case "e39":
                    case "e40":
                        var data = JSON.parse(cmd);
                        tgc.action.invite(sprintf(tgc.dialect[act], data), data);
                        break;
                    case "e31":
                    case "e36":
                    case "e27":
                    case "e28":
                    case "e33":
                    case "e35":
                        var data = JSON.parse(cmd);
                        gameInfo.innerHTML = sprintf(tgc.dialect[act], data);
                        break;
                    case "e24":
                        var data = JSON.parse(cmd);
                        tgc.board.setVariant(variantMapper[data['variant']]);
                        gameInfo.innerHTML = sprintf(tgc.dialect[act], data);
                        break;
                    case "e32":
                        break;
                    case "g01":
                        tgc.action.who(action_parts);
                        break;
                    case "g02":
                        tgc.action.whoUpdate(action_parts);
                        break;
                    case "b06":
                        tgc.action.delFromPL(cmd);
                        break;
                    case "q13":
                        tgc.action.savedGames(action_parts);
                        break;
                    case "q14":
                        break;
                    default:
                        tgc.action.focus(msg);
                    // unterdruecken: "User not known or wrong password" (ist das noch aktuell???)
                }
                return;
            }
            if (msg.indexOf("board:") != -1) {
                tgc.action.board(msg);
            } else {
                tgc.action.focus(msg);
            }
        },
        blackBoard: { /* This is a container for communication between calls;
                 sort of tmp, for some of them. Do not litter! */
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
                        $s.last().after($(row));
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
                var HP = window.tgcConfig.HOST_PORT;
                var multiple = Object.keys(HP).length > 1;
                for (var h in HP) {
                    ping(h, HP[h], multiple);
                }
            }
        },
        cc: { /* This is a container for connection calls;
                 they are constructed during the openConnection() call. */
            /* TODO:0j: das muss doch hier drin gemacht werden;
             *          aber 'ws' muss bekannt sein */
        },
        openSession: function(mode) {
            var hp = $("#sockets").attr('data-host');
            var ws = new WebSocket("ws://"+hp+"/ws");
            ws.onopen = function() {
                var name = document.getElementById("login_name"),
                    passwd = document.getElementById("login_password");
                if (name.value == '' || passwd.value == '') {
                    tgc.action.registration('** please give a name and a password');
                } else {
                    tgc.action.focus = tgc.action.registration;
                    tgc.cc.login(name.value, passwd.value, CLIENT_LABEL, CLIENT_PROTOCOL);
                    tgc.board = loadBoard();
                }
            };
            ws.onclose = function(event) {
                tgc.action.showBye();
                tgc.action.showClient(false);
            };
            ws.onmessage = function(evt) {
                    tgc.parse(evt.data);
                };
            tgc.cc.send_data = function() {
                ws.send($inputField.val());
                $inputField.val("");
            };
            tgc.cc.sendTell = function() {
                ws.send('tell '+$adrTellField.val()+' '+$tellField.val());
                $tellField.val("");
            };
            tgc.cc.sendSay = function() {
                ws.send('say '+$sayField.val());
                $sayField.val("");
            };
            tgc.cc.sendShout = function() {
                ws.send('shout '+$shoutField.val());
                $shoutField.val("");
            };
            tgc.cc.shutdown = function() {
                ws.send("ciao");
                ws.close();
                window.onbeforeunload = function(){
                    return null;
                };
            };
            tgc.cc.sendWho = function() {
                ws.send("who");
            };
            tgc.cc.sendCmd = function(msg) {
                ws.send(msg);
            };
            tgc.cc.toggle = function(toggle) {
                ws.send('toggle ' + toggle);
            };
            tgc.cc.login = function(name, passwd, label, protVersion) {
                denied.style.display = "none";
                ws.send(mode+" "+name+" "+passwd+" "+label+" "+protVersion);
                return true;
            };
        },
        navigate: {                     /* TODO:0j: this can be compressed using arrays */
            show: function(element) {
                $('.button.bselected').attr('class', 'button');
                switch (element) {
                    case "board":
                        $('#boardButton').attr('class', 'button bselected');
                        information.style.display = "none";
                        developpane.style.display = "none";
                        board.style.display = "block";
                        tgc.action.focus = tgc.action.board;
                        break;
                    case "system":
                        $('#systemButton').attr('class', 'button bselected').removeAttr('title');
                        $('#playersButton').attr('class', 'button').removeAttr('title');
                        board.style.display = "none";
                        developpane.style.display = "none";
                        information.style.display = "block";
                        players.style.display = "none";
                        settings.style.display = "block";
                        tgc.action.focus = tgc.action.system;
                        break;
                    case "develop":
                        $('#developButton').attr('class', 'button bselected');
                        board.style.display = "none";
                        developpane.style.display = "block";
                        information.style.display = "none";
                        break;
                    case "players":
                        $('#playersButton').attr('class', 'button bselected').removeAttr('title');
                        $('#systemButton').attr('class', 'button').removeAttr('title');
                        tgc.cc.sendWho();
                        board.style.display = "none";
                        developpane.style.display = "none";
                        information.style.display = "block";
                        players.style.display = "block";
                        settings.style.display = "none";
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
  tgc.blackBoard.savedGamesFocus = '#generalAlert';
  tgc.dialogs = loadDialogs();
  tgc.dialect = loadDialect();
  if (window.tgcConfig.DEVELOP_MODE) {
    switchservers.style.display = "block";
    jQuery("#developButton").show()
  }
  window.tgc = tgc;
};

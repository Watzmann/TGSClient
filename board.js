/*
 * Board code for TigerGammonServer HTML5 Client
 *
 * This file is licensed under the Affero General Public License
 * version 3 or later; see LICENSE
 *
 * @author Andreas Hausmann <andreas@tigergammon.com>
 * @copyright Andreas Hausmann 2013 - 2015
 *
*/

function loadBoard() {
  return {
    gifRoot: "resources/board/",
    infoParts: {
            pName: document.getElementById("pName"),
            pPips: document.getElementById("pPips"),
            pDiff: document.getElementById("pDiff"),
            pScore: document.getElementById("pScore"),
            oName: document.getElementById("oName"),
            oPips: document.getElementById("oPips"),
            oDiff: document.getElementById("oDiff"),
            oScore: document.getElementById("oScore"),
            gameVariantText: document.getElementById("gameVariant"),
            gameCount: document.getElementById("gameCounter"),
            matchLength: document.getElementById("matchLength"),
    },
    parseBoard: function(board) {
        var boardParts = board.split(":");
/*
board:You:hannes:1:0:0:0:-1:0:0:0:-1:5:0:3:0:0:0:-4:5:0:0:0:-4:0:-5:0:0:0:0:2:0: 1:0:0:0:0: 1:1:1:0: -1:1:25:0: 0:0:0:0:2:0:0:0
hannes rolls 4 and 3.
*/
        var parts = {};
        var castInt = function(arr) {
            var result = new Array;
            for (var i in arr) {
                result.push(+ arr[i]);
            }
            return result;
        }
        parts["player"] = boardParts[1];
        parts["opponent"] = boardParts[2];
        parts["ML"] = boardParts[3];
        parts["pScore"] = boardParts[4];
        parts["oScore"] = boardParts[5];

        parts["position"] = boardParts.slice(6,32);

        parts["color"] = boardParts[41];
        parts["direction"] = boardParts[42];

        parts["turn"] = boardParts[32] == boardParts[41];
        parts["dice"] = castInt(boardParts.slice(33,37));

        parts["cubeValue"] = parseInt(boardParts[37]);
        parts["meMayDouble"] = (boardParts[38] == "1");
        parts["meMayTurn"] = (boardParts[38] == "1") && parts["turn"] &&
                               (parts["dice"][0] == 0);
        parts["cubeWasTurned"] = boardParts[40] == "1";

        parts["homePoint"] = boardParts[43];
        parts["onHome"] = boardParts.slice(45,47);
        parts["onBar"] = boardParts.slice(47,49);
        parts["nrMoves"] = parseInt(boardParts[49]);
        parts["pPips"] = parseInt(boardParts[53]);
        parts["oPips"] = parseInt(boardParts[54]);
        parts["gameCount"] = parseInt(boardParts[55]);

        return parts;
    },
    showAscii: function(boardPane, result) {
        boardPane.innerHTML = result;
    },
    setVariant: function(variant) {
        this.gameVariant = variant;
    },
    finishMatch: function(boardPane, data) {
        jQuery("#endOfMatch").html(data['line']).show();
        setTimeout(function(){
            jQuery("#endOfMatch").hide();
        },5000);
    },
    finish: function(boardPane, data) {
        jQuery(data['color']).remove();
        jQuery(".dice").remove();
    },
    setReject: function($b) {
        var pic;
        function reject() {
            tgc.cc.sendCmd("reject");
        }
        pic = '<img src="'+this.gifRoot+'reject.gif" alt="reject">';
        jQuery('<div id="reject">'+pic+'</div>').appendTo($b);
        jQuery('#reject').dblclick(reject);
    },
    resign: function(boardPane, data) {
        var pic;
        var value = {'1': 'normal', '2': 'gammon', '3': 'backgammon'};
        var $b = $(boardPane);
        function accept() {
            tgc.cc.sendCmd("accept");
        }
        pic = '<img src="'+this.gifRoot+'resign'+data['value'][0]+
              '.gif" alt="resign '+value[data['value']]+'">';
        jQuery('<div id="resign" class="resign">'+pic+'</div>').appendTo($b);
        jQuery('#resign').dblclick(accept);
        this.setReject($b);
    },
    draw: function(boardPane, board) {
        var gifRoot = this.gifRoot
            piece = {'player': gifRoot + "playerpiece.gif",
                     'opponent': gifRoot + "opponentpiece.gif",},
            oppPiece = {'player': gifRoot + "opponentpiece.gif",
                        'opponent': gifRoot + "playerpiece.gif",},
            home = {'player': gifRoot + "playerpiecehome.gif",
                    'opponent': gifRoot + "opponentpiecehome.gif",},
            transPosStandard = [0,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1],
            transPosFevga = [0,13,14,15,16,17,18,19,20,21,22,23,24,1,2,3,4,5,6,7,8,9,10,11,12],
            starthereHooksFevga = {'blocked': false},
            wasteFilter = {'1': '#p6,#p5,#p4,#p3,#p2',
                           '2': '#p6,#p5,#p4,#p3',
                           '3': '#p6,#p5,#p4',
                           '4': '#p6,#p5',
                           '5': '#p6',
                           '20': '#p19',
                           '21': '#p19,#p20',
                           '22': '#p19,#p20,#p21',
                           '23': '#p19,#p20,#p21,#p22',
                           '24': '#p19,#p20,#p21,#p22,#p23'
                           };
        var homeStandard = function (point) {return point < 7;}
        var homePlakoto = function (point) {return point > 18;}
        var targetStandard = function (player, checkers, captive) {
            if (player) { return "yes"; }
            else if (checkers > 1) { return "no"; }
            else if (checkers == 1) { return "hit"; }
            else { return "yes"; }
        }
        var targetPlakoto = function (player, checkers, captive) {
            if (player) { return "yes"; }
            else if (checkers > 1) { return "no"; }
            else if (checkers == 1 && captive) { return "no"; }
            else if (checkers == 1 && !captive) { return "hit"; }
            else { return "yes"; }
        }
        var targetFevga = function (player, checkers, captive) {
            if (player) { return "yes"; }   // TODO:00: missing: close home board and sixprime
            else if (checkers > 0) { return "no"; }
            else { return "yes"; }
        }
        var constraintsPlacebo = function (data) {
        }
        var constraintsFevga = function (data) {
            if (data.moves == 1) {
                var $s = $('#p24,#p23,#p22,#p21,#p20,#p19'),
                    $a = $s.filter('.neutral');
                if ($a.length == 0) {
                    $('.starthere').each(function () {
                        var $e = jQuery(this);
                        $e.attr('class', $e.attr('class').replace('starthere', 'neutral'));
                        }
                    );
                    $s.each(function () {
                        var $e = jQuery(this);
                        if ($e.attr('data-checkers') == 1) {
                            $e.attr('class', $e.attr('class').replace('neutral', 'starthere'));
                        }
                    }
                    );
                }
                else if ($a.length == 1) {
                    var tid = $a.attr('id').slice(1),
                        sid = parseInt(tid) + data.dice[0];
                    if (sid < 25) {
                        $p = $('#p' + sid);
                        if ($p.attr('data-checkers') > 0) {
                            $p.attr('class', $p.attr('class').replace('starthere', 'neutral'));
                        }
                    }
                }
            }
        }
        var variants = {'plakoto':  {'home': homePlakoto,
                                     'targetType': targetPlakoto,
                                     'pDitch': '0P',
                                     'oDitch': '<div id=oDitchP>',
                                     'constraints': constraintsPlacebo,
                                     'setCheckers': {'O': setCheckersO,
                                                     'X': setCheckersX},
                                    },
                        'portes':   {'home': homeStandard,
                                     'targetType': targetStandard,
                                     'pDitch': '0',
                                     'oDitch': '<div id=oDitch>',
                                     'constraints': constraintsPlacebo,
                                     'setCheckers': {'O': setCheckersO,
                                                     'X': setCheckersX},
                                    },
                        'fevga':    {'home': homeStandard,
                                     'targetType': targetFevga,
                                     'pDitch': '0',
                                     'oDitch': '<div id=oDitch>',
                                     'constraints': constraintsFevga,
                                     'setCheckers': {'O': setCheckersFevgaO,
                                                     'X': setCheckersFevgaX},
                                    },
                        'standard': {'home': homeStandard,
                                     'targetType': targetStandard,
                                     'pDitch': '0',
                                     'oDitch': '<div id=oDitch>',
                                     'constraints': constraintsPlacebo,
                                     'setCheckers': {'O': setCheckersO,
                                                     'X': setCheckersX},
                                    },
        }
        function moveChecker(element, dice, double, nrMoves, event, $board) {
            var target, $t, $s, $r,
                $divs = $board.find('div'),
                myPoint = element.id,
                myMove = new Array;
            var moveStandard = function (start, dice) {
                return start - dice;
            }
            var movePlakoto = function (start, dice) {
                return start + dice;
            }
            var targetWasteStandard = function () {
                if (target < 0) {
                    target = 0;
                    waste = myPoint.slice(1);
                }
                return target == 0;
            }
            var targetWastePlakoto = function () {
                if (target > 25) {
                    target = 25;
                    waste = myPoint.slice(1);
                }
                return target == 25;
            }
            var targetPointStandard = function (target) {
                if (target == 25) {
                    return '#p0P';
                } else {
                    return '#p' + target;
                }
            }
            var targetPointPlakoto = function (target) {
                if (target == 25) {
                    return '#p0P';
                } else {
                    return '#p' + target;
                }
            }
            var releasePlacebo = function ($point) {}
            var releaseBlockedPoint = function (id) {
                if (starthereHooksFevga['blocked']) {
                    if (parseInt(id.slice(1)) < 12) {
                        $point = $divs.filter('#p24');
                        $point.attr('class', $point.attr('class').replace('neutral', 'starthere'));
                        starthereHooksFevga['blocked'] = false;
                    }
                }
            }
            var variants = {'plakoto': {'move': movePlakoto,
                                        'hit': hitPointPlakoto,
                                        'waste': targetWastePlakoto,
                                        'target': targetPointPlakoto,
                                        'release': releasePlacebo,
                                        },
                            'portes': {'move': moveStandard,
                                        'hit': hitPointStandard,
                                        'waste': targetWasteStandard,
                                        'target': targetPointStandard,
                                        'release': releasePlacebo,
                                        },
                            'fevga': {'move': moveStandard,
                                        'hit': hitPointStandard,
                                        'waste': targetWasteStandard,
                                        'target': targetPointStandard,
                                        'release': releaseBlockedPoint,
                                        },
                            'standard': {'move': moveStandard,
                                        'hit': hitPointStandard,
                                        'waste': targetWasteStandard,
                                        'target': targetPointStandard,
                                        'release': releasePlacebo,
                                        },
            }
            var myGame = variants[this.tgc.board.gameVariant];
            if (event.which == 2) {        /* ignore middle clicks */
                return false;
            } else if (!double && nrMoves == 2 && event.which == 3) {
                dice.reverse();
            }
            /* Are checkers on the bar? If so, is this here the bar?? */
            $r = $divs.filter('#p25');
            if ($r.find('img').length > 0) {   /* TODO:0j: is there a better way to look for data-checkers != 0? */
                if (myPoint != 'p25') {        /*          YES, use property 'data-checkers' */
                    return false;
                }
            }
            /* Now comes movement on regular points. */
            var start = parseInt(myPoint.slice(1));
            $s = $divs.filter('#'+element.id);
            function bearOffPossible(waste) {
                var totals = 0;
                function sumUp() {
                    totals += parseInt(jQuery(this).attr('data-checkers'));
                }
                var $r = $board.find('.home').each(sumUp);
                if (totals < 15) {
                    return false;
                }
                totals = 0;
                $r.filter(wasteFilter[waste]).each(sumUp);
                return totals == 0;
            }
            function construct($p, diff) {
                var point, checkers, data, html;
                var id = $p.attr('id');
                var captive = $p.attr('data-captive') == "yes";
                point = $p.attr('data-point');
                checkers = parseInt($p.attr('data-checkers')) + diff;
                switch (id) {
                    case 'oBar':
                        html = composeOpponentsBar(checkers);
                        break;
                    case 'p0':
                    case 'p0P':
                        html = composePlayersDitch(checkers, point);
                        break;
                    case 'p25':
                        html = composePlayersBar(checkers, point);
                        break;
                    default:
                        id = parseInt(id.slice(1));
                        data = {'id': id, 'point': point};
                        if (captive && checkers == 0) {
                            data['color'] = 'opponent';
                            data['dynamic'] = false;
                            html = composePoint(data, 1, false);
                        } else {
                            data['color'] = 'player';
                            data['dynamic'] = checkers > 0;
                            html = composePoint(data, checkers, captive);
                        }
                        break;
                }
                return html;
            }
            function constructCaptive($p) {
                var point, checkers, data, html;
                var id = $p.attr('id');
                point = $p.attr('data-point');
                checkers = 1;
                id = parseInt(id.slice(1));
                data = {'id': id, 'point': point,
                        'color': 'player', 'dynamic': true};
                html = composePoint(data, checkers, true);
                return html;
            }
            function replacePoint($p, diff) {
                var div = construct($p, diff);
                var $r = $p.detach();
                /* Search the first 'alive' index to insertBefore */
                var i = 0;
                while ($divs[i].id == "" || $divs[i].nextSibling == null) {
                    i++;
                }
                jQuery(div).insertBefore($divs.eq(i));
                myGame['release']($r.attr('id'))
                return $r;
            }
            function hitPointStandard($p, $o) {
                var div = construct($p, 0);
                div += construct($o, +1);
                var $r = $p.add($o).detach();
                /* Search the first 'alive' index to insertBefore */
                var i = 0;
                while ($divs[i].id == "" || $divs[i].nextSibling == null) {
                    i++;
                }
                jQuery(div).insertBefore($divs.eq(i));
                return $r;
            }
            function hitPointPlakoto($p, $o) {
                var div = constructCaptive($p);
                var $r = $p.add($o).detach();
                /* Search the first 'alive' index to insertBefore */
                var i = 0;
                while ($divs[i].id == "" || $divs[i].nextSibling == null) {
                    i++;
                }
                jQuery(div).insertBefore($divs.eq(i));
                return $r;
            }
            for (var d in dice) {
                var undo = {'dice': dice.slice()};
                var used = dice.shift();
                var waste = '';
                target = myGame['move'](start, used);
                var borneoff = myGame['waste']();
                if (borneoff && !bearOffPossible(waste)) {
                    /* tried bearoff while not possible */
                    dice.push(used);
                    if (double) {
                        break;
                    } else {
                        continue;
                    }
                }
                $t = $divs.filter(myGame['target'](target));
                var targetType = $t.attr('data-target');
                if ( targetType == 'no') {
                    dice.push(used);
                    if (double) {
                        break;
                    } else {
                        continue;
                    }
                }
                undo['nrMoves'] = nrMoves;
                undo['myMove'] = myMove.slice();
                $r = replacePoint($s, -1);
                undo['$sClone'] = $r;
                myMove.push($r.attr('data-point'));
                if ( targetType == 'hit') {
                    $r = myGame['hit']($t, $board.find('#oBar'));
                    undo['$tClone'] = $r;
                    myMove.push($t.attr('data-point'));
                } else {
                    $r = replacePoint($t, +1);
                    undo['$tClone'] = $r;
                    myMove.push($t.attr('data-point'));
                }
                nrMoves--;
                break;

                /* TODO:0j:
                 *
                 * undo!! (for each move)
                 *
                 * with left click mark a point to be made (like gnubg)
                 *
                 * moves beim gegner zeigen
                 *    > tried 4 10           >> tried 4 10
                 *    > tried 10 12
                 *    > tried undo
                 */
            }
            if (myMove.length > 0) {
                return {'dice': dice, 'moves': nrMoves,
                        'myMove': myMove, 'undo': undo};
            } else {
                return false;
            }
        }
        function drawPoint(checkers, padding, color, captive) {
            /* Returns <checkers> * <img ...></img>.
             * It accounts for padding and stacking */
            function drawCheckers(checkers, color, captive) {
                var point = "";
                var startPiece = 0;
                var pieces = checkers;
                var stacked = checkers > 9;
                if (captive) {
                    pieces += 1;
                    startPiece = 1;
                }
                if (padding) {
                    var pheight = 6 - Math.min(5,(stacked ? pieces - 6 : pieces));
                    var pstacked = stacked ? 's' : '';
                    point = "<div class=\"cs" + pstacked + pheight + "\"></div>";
                } else if (stacked) {
                    point = "<div class=\"css1\"></div>";
                }
                if (captive && !padding) {
                    point += '<img src=' + oppPiece[color] +
                                                        ' alt=captured>';
                }
                pieces = stacked ? pieces - 6 : pieces;
                for (var c = startPiece; c < pieces; c++) {
                    var stack = ' class="' + color;
                    if (captive && padding && (c == 5)) {
                        point += '<img src=' + oppPiece[color] + ' alt=captured>';
                        captive = false;
                    }
                    if (padding && c > 4) {
                        stack += ' cp' + c + '"';
                    } else if (c > 8) {
                        stack += ' c9"';
                    } else if (c > 4) {
                        stack += ' c5"';
                    } else {
                        stack += '"';
                    }
                    point += '<img' + stack + ' src=' + piece[color] + ' alt=' + color + '>';
                }
                if (captive && padding) {
                    point += '<img src=' + oppPiece[color] + ' alt=captured>';
                }
                return point;
            }
            if (checkers == 0) {
                return "";
            } else {
                return drawCheckers(Math.abs(checkers), color, captive);
            }
        }
        function sendMoveApologies(nrP, more) {
            var m = more ? ' more' : ''
            return 'please move ' + nrP + m + ' piece' + (nrP > 1 ? 's':'');
        }
        function restoreBoard() {
            tgc.cc.sendCmd("board");
        }
        function composeDiv(values, captive) {
            var strCaptive = '';
            if (values['checkers'] > 5) {
                values['title'] = ' title="' + values['checkers'] + ' checkers"';
            } else {
                values['title'] = '';
            }
            if (captive) {
                strCaptive = 'data-captive="yes" '
            }
            return sprintf('<div id="p%(id)s" class="%(class)s" ' +
                           'data-point="%(point)s" ' +
                           strCaptive +
                           'data-target="%(target)s" ' +
                           'data-checkers="%(checkers)s"%(title)s>', values);
        }
        function composePoint(container, checkers, captive) {
            var div, html,
                variant = variants[this.tgc.board.gameVariant],
                player = container['color'] == 'player';
            if (container['dynamic']) {
                if (variant['home'](container['id'])) {
                    container['class'] = "starthere home";
                } else {
                    container['class'] = "starthere";
                }
            } else {
                container['class'] = "neutral";
            }
            if (checkers > 9) {
                container['class'] += " stacked" + (player ? "P" : "O");
            } else {
                container['class'] += " point";
            }
            container['checkers'] = checkers;
            container['target'] = variant['targetType'](player, checkers, captive);
            div = composeDiv(container, captive);
            html = drawPoint(checkers, container['id'] < 13, container['color'], captive);
            return div + html + "</div>";
        }
        function composePlayersDitch(checkers, pt) {
            var point = "",
                data = {'id': variants[this.tgc.board.gameVariant]['pDitch'],
                        'point': pt,
                        'class': "neutral home",
                        'checkers': checkers,
                        'target': 'yes'
                        },
                pheight = (15 - checkers);
            point = "<div class=\"pds" + pheight + "\"></div>";
            for (var c = 0; c < checkers; c++) {
                point += '<img src=' + home['player'] + ' alt="home piece player">';
            }
            return composeDiv(data, false) + point + '</div>';
        }
        function composeOpponentsDitch(checkers) {
            var ditch = variants[this.tgc.board.gameVariant]['oDitch'];
            var point = "";
            for (var c = 0; c < checkers; c++) {
                point += '<img src=' + home['opponent'] + ' alt="home piece opponent">';
            }
            return ditch + point + '</div>';
        }
        function composePlayersBar(checkers, pt) {
            /* TODO:0j: passen nur 5 auf die Bar :((( */
            var point = "",
                data = {'id': 25,
                        'point': pt,
                        'class': (checkers > 0) ? "starthere" : "",
                        'checkers': checkers,
                        'target': 'bar'
                        };
            var pheight = (5 - checkers);
            point = "<div class=\"cs" + pheight + "\"></div>";
            for (var c = 0; c < checkers; c++) {
                point += '<img src=' + piece['player'] + ' alt="bar piece player">';
            }
            return composeDiv(data, false) + point + '</div>';
        }
        function composeOpponentsBar(checkers) {
            /* TODO:0j: passen nur 5 auf die Bar :((( */
            var point = "";
            for (var c = 0; c < checkers; c++) {
                point += '<img src=' + piece['opponent'] + ' alt="bar piece player">';
            }
            return '<div id=oBar data-checkers=' + checkers + '>' + point + '</div>';
        }
        function setCheckersX(position, $b) {
            var checkers, container, captive, plr,
                div = "",
                tp = transPosStandard;
            for (var i=1; i<25; i++) {
                checkers = parseInt(position[tp[i]]);
                plr = checkers < 0;
                checkers = Math.abs(checkers);
                container = {id: i, point: tp[i]};
                captive = checkers > 20;
                if (captive) {
                    checkers -= 20;
                }
                container['color'] = plr ? 'player' : 'opponent';
                container['dynamic'] = plr && (checkers > 0);
                div += composePoint(container, checkers, captive);
            }
            jQuery(div).appendTo($b);
        }
        function setCheckersO(position, $b) {
            var checkers, container, captive, plr,
                div = "";
            for (var i=1; i<25; i++) {
                checkers = parseInt(position[i]);
                plr = checkers > 0;
                checkers = Math.abs(checkers);
                container = {id: i, point: i};
                captive = checkers > 20;
                if (captive) {
                    checkers -= 20;
                }
                container['color'] = plr ? 'player' : 'opponent';
                container['dynamic'] = plr && (checkers > 0);
                div += composePoint(container, checkers, captive);
            }
            jQuery(div).appendTo($b);
        }
        function setCheckersFevgaX(position, $b) {
            var checkers, container, captive, plr, blocked,
                div = "",
                tp = transPosFevga;
            function notPassed() {
                return (position[12] == -14) &&
                            (position[23] > -1) &&
                            (position[22] > -1) &&
                            (position[21] > -1) &&
                            (position[20] > -1) &&
                            (position[19] > -1) &&
                            (position[18] > -1) &&
                            (position[17] > -1) &&
                            (position[16] > -1) &&
                            (position[15] > -1) &&
                            (position[14] > -1) &&
                            (position[13] > -1) &&
                            (position[24] > -1);
            }
            for (var i=1; i<25; i++) {
                checkers = parseInt(position[tp[i]]);
                plr = checkers < 0;
                checkers = Math.abs(checkers);
                container = {id: i, point: tp[i]};
                captive = checkers > 20;
                if (captive) {
                    checkers -= 20;
                }
                blocked = (i == 24) && notPassed();
                starthereHooksFevga['blocked'] = blocked;
                container['color'] = plr ? 'player' : 'opponent';
                container['dynamic'] = plr && (checkers > 0) && !blocked;
                div += composePoint(container, checkers, captive);
            }
            jQuery(div).appendTo($b);
        }
        function setCheckersFevgaO(position, $b) {
            var checkers, container, captive, plr, blocked,
                div = "";
            function notPassed() {
                return (position[24] == 14) &&
                            (position[11] < 1) &&
                            (position[10] < 1) &&
                            (position[9] < 1) &&
                            (position[8] < 1) &&
                            (position[7] < 1) &&
                            (position[6] < 1) &&
                            (position[5] < 1) &&
                            (position[4] < 1) &&
                            (position[3] < 1) &&
                            (position[2] < 1) &&
                            (position[1] < 1) &&
                            (position[12] < 1);
            }
            for (var i=1; i<25; i++) {
                checkers = parseInt(position[i]);
                plr = checkers > 0;
                checkers = Math.abs(checkers);
                container = {id: i, point: i};
                captive = checkers > 20;
                if (captive) {
                    checkers -= 20;
                }
                blocked = (i == 24) && notPassed();
                starthereHooksFevga['blocked'] = blocked;
                container['color'] = plr ? 'player' : 'opponent';
                container['dynamic'] = plr && (checkers > 0) && !blocked;
                div += composePoint(container, checkers, captive);
            }
            jQuery(div).appendTo($b);
        }
        function setCube(cubeValue, meMayDouble, meMayTurn, cubeWasTurned, $b) {
            var pic, div, t;
            function double(picture) {
                var turnCube = function() {
                    jQuery('#rollDice').remove();
                    tgc.cc.sendCmd("double");
                    jQuery('#cube').attr('class', 'dCube');
                    jQuery('#cube img').attr('src', picture).attr('alt', 'turned cube');
                }
                return turnCube;
            }
            function accept() {
                tgc.cc.sendCmd("accept");
            }
            if (cubeWasTurned) {
                type = "dCube";
                cubeValue *= 2;
            } else if (cubeValue < 2) {
                type = "nCube";
            } else if (meMayDouble) {
                type = "pCube";
            } else {
                type = "oCube";
            }
            pic = '<img src="'+gifRoot+'cube'+cubeValue+'.gif" alt="cube'+cubeValue+'">';
            jQuery('<div id="cube" class="'+type+'">'+pic+'</div>').appendTo($b);
            if (cubeWasTurned) {
                tgc.board.setReject($b);
                jQuery('#cube').dblclick(accept);
            }
            if (meMayTurn) {
                pic = gifRoot+'cube' + cubeValue*2 + '.gif';
                jQuery('#cube').dblclick(double(pic));
            }
        }
        function setDitches(home, direction, homePoint, $b) {
            var div;
            div = composePlayersDitch(home[0], homePoint);
            div += composeOpponentsDitch(home[1]);
            jQuery(div).appendTo($b);
        }
        function setBars(bar, direction, $b) {
            var div;
            div = composePlayersBar(bar[0], (direction == '-1') ? 25 : 0);
            div += composeOpponentsBar(bar[1]);
            jQuery(div).appendTo($b);
        }
        function setDice(dice, turn, nrMoves, $b) {
            var pic, pic0 = '<img class="dice" src="' + gifRoot;
            function rollDice() {
                tgc.cc.sendCmd("roll");
            }
            if (dice[0] != 0) {
                var sortedDice = dice.slice(0,2);
                sortedDice.sort();
                sortedDice.reverse();
                pic = pic0 + 'playerdie'+sortedDice[0]+'.gif" alt="playerdie1">';
                jQuery('<div id="pDice1">'+pic+'</div>').appendTo($b);
                pic = pic0 + 'playerdie'+sortedDice[1]+'.gif" alt="playerdie2">';
                jQuery('<div id="pDice2">'+pic+'</div>').appendTo($b);
                jQuery('<div id="sendMove" title="' +
                        sendMoveApologies(nrMoves, false) + '"></div>').appendTo($b);
            } else if (dice[2] != 0) {
                pic = pic0 + 'opponentdie'+dice[2]+'.gif" alt="opponentdie1">';
                jQuery('<div id="oDice1">'+pic+'</div>').appendTo($b);
                pic = pic0 + 'opponentdie'+dice[3]+'.gif" alt="opponentdie2">';
                jQuery('<div id="oDice2">'+pic+'</div>').appendTo($b);
            } else if (turn) {
                pic = pic0 + 'rolldice.gif" alt="roll dice" title="click to roll">';
                jQuery('<div id="rollDice">' + pic + '</div>').appendTo($b);
                jQuery('#rollDice')[0].onclick = rollDice;
            }
            return dice[0] != 0;
        }
        function setUndo($b) {
            /* TODO:0j: undo is just a shortcut, so far.
             *          The better idea is to undo each move in reverse order
             *          (last in first out). Preparations are there already, as
             *          there is an object 'undo' being returned by moveChecker().
             * */
            var pic = '<img src="' + gifRoot + 'undo.gif" alt="undo"' +
                      ' title="click to undo your moves">';
            jQuery('<div id="undo">' + pic + '</div>').appendTo($b);
            jQuery('#undo')[0].onclick = restoreBoard;
        }
        function setInfo(elements) {
            var color, p = tgc.board.infoParts;
            var pdiff = elements['oPips'] - elements['pPips'];
            p['pName'].innerHTML = elements['player'];
            p['pPips'].innerHTML = elements['pPips'];
            p['pDiff'].innerHTML = pdiff;
            color = pdiff < 0 ? 'Red' : 'Green'
            p['pDiff'].setAttribute('class', 'iPips pip' + color)
            p['pScore'].innerHTML = elements['pScore'];
            p['oName'].innerHTML = elements['opponent'];
            p['oPips'].innerHTML = elements['oPips'];
            p['oDiff'].innerHTML = - pdiff;
            color = - pdiff < 0 ? 'Red' : 'Green'
            p['oDiff'].setAttribute('class', 'iPips pip' + color)
            p['oScore'].innerHTML = elements['oScore'];
            var variant = this.tgc.board.gameVariant;
            variant = variant[0].toUpperCase() + variant.slice(1);
            p['gameVariantText'].innerHTML = variant;
            p['gameCount'].innerHTML = elements['gameCount'];
            p['matchLength'].innerHTML = elements['ML'];
        }
        var elements = this.parseBoard(board);
        var setDirection = function($imgs, elements) {
            $imgs.filter('#pip13').attr('class', 'upperpipsX');
            $imgs.filter('#pip12').attr('class', 'lowerpipsX');
        }
        var drawPosition = function($board, elements) {
            var availableDice, initialDice, double, nrMoves,
                setCheckers = variants[this.tgc.board.gameVariant]['setCheckers'],
                checkConstraints = variants[this.tgc.board.gameVariant]['constraints'],
                fmtMoves = new Array,
                myMoves = new Array;
            function setAvailableDice(dice, nrmoves) {
                availableDice = dice;
                nrMoves = nrmoves;
            }
            function accumulateMoves(move) {
                myMoves = myMoves.concat(move);
                fmtMoves = fmtMoves.concat(move.join("/"));
            }
            function sendMove() {
                tgc.cc.sendCmd("move "+myMoves.join(" "));
                tgc.action.gameProtocol(sprintf("%-24s", fmtMoves.join(", ")));
                $board.find('#pDice1,#pDice2').remove();
                var $r = $board.find('#sendMove');
                $r[0].onclick = null;
                $r.attr('title', 'the game is finished');
            }
            setInfo(elements);
            $board.find('div').remove();
            if (elements['color'] == "-1") {
                setCheckers['X'](elements['position'], $board);
            } else {
                setCheckers['O'](elements['position'], $board);
            }
            setCube(elements['cubeValue'], elements['meMayDouble'],
                    elements["meMayTurn"], elements['cubeWasTurned'], $board);
            setDitches(elements['onHome'], elements['direction'],
                       elements['homePoint'], $board);
            setBars(elements['onBar'], elements['direction'], $board);
            var readyToSetCheckers = setDice(elements['dice'], elements['turn'],
                                             elements['nrMoves'], $board);
            /* TODO:0j: watchers must not be readyToSetCheckers */
            if (readyToSetCheckers) {
                initialDice = elements['dice'].slice(0,2);
                if (initialDice[0] == initialDice[1]) {
                    initialDice = initialDice.concat(initialDice);
                    double = true;
                } else {
                    initialDice.sort();
                    initialDice.reverse();
                    double = false;
                }
                setAvailableDice(initialDice, elements['nrMoves']);
                var move = function(element, dice, nrmoves) {
                    return function(event) {
                        var resulting, $dx,
                            color = elements['color'];
                        if (nrmoves > 0) {
                            resulting = moveChecker(element, dice, double,
                                                      nrmoves, event, $board);
                            if (resulting !== false) {
                                /* A regular action was taken */
                                setAvailableDice(resulting['dice'], resulting['moves']);
                                accumulateMoves(resulting['myMove']);
                                /* Manage Undo */
                                $dx = $board.find('#undo');
                                if ($dx.length < 1) {
                                    setUndo($board);
                                }
                                /* Manage actions regarding checkers */
                                $board.find('.starthere').each(clearAction);
                                if (resulting['moves'] > 0) {
                                    /* There are moves left; set hotspots accordingly */
                                    checkConstraints(resulting);
                                    $board.find('.starthere').each(setAction);
                                    $board.find('#sendMove').attr('title',
                                        sendMoveApologies(resulting['moves'], true));
                                    /* TODO:0j: when clicking the dice to send the move, there
                                     * is a message, that not all moves were yet made.
                                     * This might be especially interesting when there is a
                                     * move, difficult for beginners (like 1-6, where 6 is
                                     * possible only after a very special 1).
                                     * TODO: should there be a special alarm?????? */
                                } else {
                                    /* All moves done; set affirmative hotspot ready */
                                    $dx = $board.find('#sendMove')
                                    $dx.attr('title', 'click to affirm move');
                                    $dx[0].onclick = sendMove;    /* TODO:0j: also jQuery */
                                }
                            }
                        }
                        return false;   /* suppress contextmenu for right clicks */
                    };
                };
                function setAction(index, element) {
                    $(element).on("mousedown", function(event) {
                                move(element, availableDice, nrMoves)(event);
                                });
                }
                function clearAction(index, element) {
                    $(element).off();
                }
                $board.find('.starthere').each(setAction);
            }
        };
        $board = $(boardPane);
        setDirection($('#boardBg > img'), elements);
        drawPosition($board, elements);
    }
  }
};

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
        parts["opponent"] = boardParts[2];
        parts["position"] = boardParts.slice(6,32);

        parts["color"] = boardParts[41];
        parts["direction"] = boardParts[42];

        parts["turn"] = boardParts[32] == boardParts[41];
        parts["dice"] = castInt(boardParts.slice(33,37));

        parts["homePoint"] = boardParts[43];
        parts["onHome"] = boardParts.slice(45,47);
        parts["onBar"] = boardParts.slice(47,49);
        parts["nrMoves"] = parseInt(boardParts[49]);

        return parts;
    },
    showAscii: function(boardPane, result) {
        boardPane.innerHTML = result;
    },
    setVariant: function(variant) {
        this.gameVariant = variant;
    },
    draw: function(boardPane, board) {
        var gifRoot = "resources/board/",
            piece = {'player': gifRoot + "playerpiece.gif",
                     'opponent': gifRoot + "opponentpiece.gif",},
            oppPiece = {'player': gifRoot + "opponentpiece.gif",
                        'opponent': gifRoot + "playerpiece.gif",},
            home = {'player': gifRoot + "playerpiecehome.gif",
                    'opponent': gifRoot + "opponentpiecehome.gif",},
            wasteFilter = {'1': '#p6,#p5,#p4,#p3,#p2',
                           '2': '#p6,#p5,#p4,#p3',
                           '3': '#p6,#p5,#p4',
                           '4': '#p6,#p5',
                           '5': '#p6'};
        var homeStandard = function (point) {return point < 7;}
        var homePlakoto = function (point) {return point > 18;}
        var variants = {'plakoto':  {'home': homePlakoto,
                                     'pDitch': '0P',
                                     'oDitch': '<div id=oDitchP>',
                                    },
                        'portes':   {'home': homeStandard,
                                     'pDitch': '0',
                                     'oDitch': '<div id=oDitch>',
                                    },
                        'fevga':    {'home': homeStandard,
                                     'pDitch': '0',
                                     'oDitch': '<div id=oDitch>',
                                    },
                        'standard': {'home': homeStandard,
                                     'pDitch': '0',
                                    'oDitch': '<div id=oDitch>',
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
            var variants = {'plakoto': {'move': movePlakoto,
                                        'hit': hitPointPlakoto,
                                        'waste': targetWastePlakoto,
                                        'target': targetPointPlakoto,
                                        },
                            'portes': {'move': moveStandard,
                                        'hit': hitPointStandard,
                                        'waste': targetWasteStandard,
                                        'target': targetPointStandard,
                                        },
                            'fevga': {'move': moveStandard,
                                        'hit': hitPointStandard,
                                        'waste': targetWasteStandard,
                                        'target': targetPointStandard,
                                        },
                            'standard': {'move': moveStandard,
                                        'hit': hitPointStandard,
                                        'waste': targetWasteStandard,
                                        'target': targetPointStandard,
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
            if ($r.find('img').length > 0) {   /* TODO:0j: better way to look for data-checkers != 0? */
                if (myPoint != 'p25') {
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
                            html = composeOpponentsPoint(data, 1, id<13, false);
                        } else {
                            html = composePlayersPoint(data, checkers, id<13, id, captive);
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
                data = {'id': id, 'point': point};
                html = composePlayersPoint(data, checkers, id<13, id, true);
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
                if (captive) {
                    pieces += 1;
                    startPiece = 1;
                }
                if (padding) {
                    /* TODO:03: what do I need 6 checker divs for?? */
                    var pheight = (6 - Math.min(5,pieces));
                    point = "<div class=\"cs" + pheight + "\"></div>";
                }
                if (captive && !padding) {
                    point += '<img src=' + oppPiece[color] +
                                                        ' alt=captured>';
                }
                for (var c = startPiece; c < pieces; c++) {
                    var stack = '';
                    if (padding && c > 4) {
                        stack = ' class=cp' + c;
                    } else if (c > 8) {
                        stack = ' class=c9';
                    } else if (c > 4) {
                        stack = ' class=c5';
                    }
                    point += '<img' + stack + ' src=' + piece[color] +
                                                        ' alt=' + color + '>';
                }
                if (captive && padding) {
                    point += '<img src=' + oppPiece[color] +
                                                        ' alt=captured>';
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
        function composePlayersPoint(container, checkers, padding, point, captive) {
            var div, html;
            var home = variants[this.tgc.board.gameVariant]['home'](point);
            if (checkers > 0) {
                container['class'] = home ? "starthere home" : "starthere";
            } else {
                container['class'] = "neutral";
            }
            container['checkers'] = checkers;
            container['target'] = "yes";
            div = composeDiv(container, captive);
            html = drawPoint(checkers, padding, 'player', captive);
            return div + html + "</div>";
        }
        function composeOpponentsPoint(container, checkers, padding, captive) {
            var div, point;
            container['class'] = "neutral";
            container['checkers'] = checkers;
            if (checkers > 1) {
                container['target'] = "no";
            } else if (checkers == 1 && captive) {
                container['target'] = "no";
            } else if (checkers == 1 && !captive) {
                container['target'] = "hit";
            } else {
                container['target'] = "yes";
            }
            div = composeDiv(container, captive);
            point = drawPoint(checkers, padding, 'opponent', captive);
            return div + point + "</div>";
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
                div = "";
            for (var i=1; i<25; i++) {
                checkers = parseInt(position[25-i]);
                plr = checkers < 0;
                checkers = Math.abs(checkers);
                container = {id: i, point: 25-i};
                captive = checkers > 20;
                if (captive) {
                    checkers -= 20;
                }
                if (plr) {
                    div += composePlayersPoint(container, checkers, i<13, i, captive);
                } else {
                    div += composeOpponentsPoint(container, checkers, i<13, captive);
                }
                /* TODO:0j: is it a good idea to draw empty points?? */
            }
            jQuery(div).appendTo($b);
        }
        function setCheckersO(position, $b) {
            var checkers, div, container, captive, plr;
            for (var i=1; i<25; i++) {
                checkers = parseInt(position[i]);
                plr = checkers > 0;
                checkers = Math.abs(checkers);
                container = {id: i, point: i};
                captive = checkers > 20;
                if (captive) {
                    checkers -= 20;
                }
                if (plr) {
                    div = composePlayersPoint(container, checkers, i<13, i, captive);
                } else {
                    div = composeOpponentsPoint(container, checkers, i<13, captive);
                }
                /* TODO:0j: is it a good idea to draw empty points?? */
                jQuery(div).appendTo($b);
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
            var pic;
            function rollDice() {
                tgc.cc.sendCmd("roll");
            }
            if (dice[0] != 0) {
                var sortedDice = dice.slice(0,2);
                sortedDice.sort();
                sortedDice.reverse();
                pic = '<img src="' + gifRoot + 'playerdie'+sortedDice[0]+'.gif" alt="playerdie1">';
                jQuery('<div id="pDice1">'+pic+'</div>').appendTo($b);
                pic = '<img src="' + gifRoot + 'playerdie'+sortedDice[1]+'.gif" alt="playerdie2">';
                jQuery('<div id="pDice2">'+pic+'</div>').appendTo($b);
                jQuery('<div id="sendMove" title="' +
                        sendMoveApologies(nrMoves, false) + '"></div>').appendTo($b);
            } else if (dice[2] != 0) {
                pic = '<img src="' + gifRoot + 'opponentdie'+dice[2]+'.gif" alt="opponentdie1">';
                jQuery('<div id="oDice1">'+pic+'</div>').appendTo($b);
                pic = '<img src="' + gifRoot + 'opponentdie'+dice[3]+'.gif" alt="opponentdie2">';
                jQuery('<div id="oDice2">'+pic+'</div>').appendTo($b);
            } else if (turn) {
                pic = '<img src="' + gifRoot + 'rolldice.gif" alt="roll dice" title="click to roll">';
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
        var elements = this.parseBoard(board);
        var setDirection = function($imgs, elements) {
            if (elements['direction'] == '-1') {
                $imgs.filter('#pip13').attr('class', 'upperpipsO');
                $imgs.filter('#pip12').attr('class', 'lowerpipsO');
            } else {
                $imgs.filter('#pip12').attr('class', 'upperpipsX');
                $imgs.filter('#pip13').attr('class', 'lowerpipsX');
            }
        }
        var drawPosition = function($board, elements) {
            var availableDice, initialDice, double, nrMoves,
                myMoves = new Array;
            function setAvailableDice(dice, nrmoves) {
                availableDice = dice;
                nrMoves = nrmoves;
            }
            function accumulateMoves(move) {
                myMoves = myMoves.concat(move);
            }
            function sendMove() {
                tgc.cc.sendCmd("move "+myMoves.join(" "));
                $board.find('#pDice1,#pDice2').remove();
                var $r = $board.find('#sendMove');
                $r[0].onclick = null;
                $r.attr('title', 'the game is finished');
            }
            $board.find('div').remove();
            if (elements['color'] == "-1") {
                setCheckersX(elements['position'], $board);
            } else {
                setCheckersO(elements['position'], $board);
            }
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
        drawPosition($(boardPane), elements);
    }
  }
};
/* cube
 * resign
 */

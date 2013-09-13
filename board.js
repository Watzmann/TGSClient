/*
 * Board code for TigerGammon HTML5 client
 *
 * (c) 2013 Dr. Andreas Hausmann
 *
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
        parts["dice"].sort();
        parts["dice"].reverse();

        parts["onHome"] = boardParts.slice(45,47);
        parts["onBar"] = boardParts.slice(47,49);
        parts["nrMoves"] = parseInt(boardParts[49]);

        return parts;
    },
    showAscii: function(boardPane, result) {
        boardPane.innerHTML = result;
    },
    draw: function(boardPane, board) {
        var gifRoot = "resources/board/",
            piece = {'player': gifRoot + "playerpiece.gif",
                     'opponent': gifRoot + "opponentpiece.gif",};

        function moveChecker(element, dice, double, nrMoves, $divs) {
            var target, $t, $s, $p,
                myMove = new Array;
            if (event.button == 1) {        /* ignore middle clicks */
                return;
            } else if (!double && nrMoves == 2 && event.button == 2) {
                dice.reverse();
            }
            var start = parseInt(element.id.slice(1));
            $s = $divs.filter('#'+element.id);
            function construct($p, pip, diff) {
                var point, checkers, data;
                var id = parseInt($p.attr('id').slice(1));
                point = $p.attr('data-point');
                checkers = parseInt($p.attr('data-checkers')) + diff;
                data = {'id': id, 'point': point};
                return composePlayersPoint(data, checkers, pip<13);
            }
            function replacePoint($p, point, diff) {
                var div = construct($p, point, diff);
                $p.detach();
                /* here search the first index to work with insertBefore */
                var i = 0;
                while ($divs[i].id == "" || $divs[i].nextSibling == null) {
                    i++;
                }
                jQuery(div).attr('class', 'starthere').insertBefore($divs.eq(i));
                return $p;
            }
            for (var d in dice) {
                var undo = {'dice': dice.slice()};
                var used = dice.shift();
                target = start - used;
                $t = $divs.filter('#p'+target);
                if ($t.length == 0 || $t.attr('data-target') == 'no') {
                    dice.push(used);
                    if (double) {
                        break;
                    } else {
                        continue;
                    }
                }
                undo['nrMoves'] = nrMoves;
                undo['myMove'] = myMove.slice();
                $p = replacePoint($s, start, -1);
                undo['$sClone'] = $p;
                myMove.push($p.attr('data-point'));
                $p = replacePoint($t, target, +1);
                undo['$tClone'] = $p;
                myMove.push($p.attr('data-point'));
                nrMoves--;
                break;

                /* TODO:0j:
                 * undo!!
                 * moves beim gegner zeigen
                 * Hit beachten
                 * Bear Off
                 */
            }
            return {'dice': dice, 'moves': nrMoves,
                    'myMove': myMove, 'undo': undo};
        }
        function drawPoint(checkers, padding, color) {
            function drawCheckers(checkers, color) {
                var point = "";
                if (padding) {
                    var pheight = (6 - Math.min(5,checkers)) * 27;
                    point = "<div style=\"height:" + pheight + "px\"></div>";
                }
                for (var c = 0; c < checkers; c++) {
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
                return point;
            }
            if (checkers == 0) {
                return "";
            } else {
                return drawCheckers((checkers > 0) ? checkers : -checkers, color);
            }
        }
        function sendMoveApologies(nrP, more) {
            var m = more ? ' more' : ''
            return 'please move ' + nrP + m + ' piece' + (nrP > 1 ? 's':'');
        }
        function composeDiv(values) {
            if (values['checkers'] > 5) {
                values['title'] = ' title="' + values['checkers'] + ' checkers"';
            } else {
                values['title'] = '';
            }
            return sprintf('<div id="p%(id)d" class="%(class)s" ' +
                           'data-point="%(point)s" ' +
                           'data-target="%(target)s" ' +
                           'data-checkers="%(checkers)s"%(title)s>', values);
        }
        function composePlayersPoint(container, checkers, padding) {
            var div, point;
            container['class'] = "starthere";
            container['checkers'] = checkers;
            container['target'] = "yes";
            div = composeDiv(container);
            point = drawPoint(checkers, padding, 'player');
            return div + point + "</div>";
        }
        function composeOpponentsPoint(container, checkers, padding) {
            var div, point;
            container['class'] = "neutral";
            container['checkers'] = checkers;
            if (checkers > 1) {
                container['target'] = "no";
            } else if (checkers == 1) {
                container['target'] = "hit";
            } else {
                container['target'] = "yes";
            }
            div = composeDiv(container);
            point = drawPoint(checkers, padding, 'opponent');
            return div + point + "</div>";
        }
        function setCheckersX(position, $b) {
            var checkers, div, container;
            for (var i=1; i<25; i++) {
                checkers = parseInt(position[25-i]);
                container = {id: i, point: 25-i};
                if (checkers < 0) {
                    div = composePlayersPoint(container, -checkers, i<13);
                } else {
                    div = composeOpponentsPoint(container, checkers, i<13);
                }
                /* TODO:0j: is it a good idea to draw empty points?? */
                jQuery(div).appendTo($b);
            }
        }
        function setCheckersO(position, $b) {
            var checkers, div, container;
            for (var i=1; i<25; i++) {
                checkers = parseInt(position[i]);
                container = {id: i, point: i};
                if (checkers > 0) {
                    div = composePlayersPoint(container, checkers, i<13);
                } else {
                    div = composeOpponentsPoint(container, -checkers, i<13);
                }
                /* TODO:0j: is it a good idea to draw empty points?? */
                jQuery(div).appendTo($b);
            }
        }
        function setDice(dice, turn, nrMoves, $b) {
            var pic;
            function rollDice() {
                tgc.cc.sendCmd("roll");
            }
            if (dice[0] != 0) {
                pic = '<img src="' + gifRoot + 'playerdie'+dice[0]+'.gif" alt="playerdie1">';
                jQuery('<div id="pDice1">'+pic+'</div>').appendTo($b);
                pic = '<img src="' + gifRoot + 'playerdie'+dice[1]+'.gif" alt="playerdie2">';
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
            }
            $board.find('div').remove();
            if (elements['color'] == "-1") {
                setCheckersX(elements['position'], $board);
            } else {
                setCheckersO(elements['position'], $board);
            }
            setDice(elements['dice'], elements['turn'], elements['nrMoves'], $board);
            initialDice = elements['dice'].slice(0,2);
            if (initialDice[0] == initialDice[1]) {
                initialDice = initialDice.concat(initialDice);
                double = true;
            } else {
                double = false;
            }
            setAvailableDice(initialDice, elements['nrMoves']);
            if (elements['turn']) {
                var move = function(dice, nrmoves) {
                    return function() {
                        /* move() must be a closure with knowledge about
                         * availableDice and nrMoves.
                         * after moves are done, set a onclick on the dice to
                         * send of the moves */
                        var resulting,
                            direction = elements['direction'],
                            color = elements['color'];
                        if (nrmoves > 0) {
                            resulting = moveChecker(this, dice, double, nrmoves,
                                                            $board.find('div'));
                            setAvailableDice(resulting['dice'], resulting['moves']);
                            accumulateMoves(resulting['myMove']);
                            /* TODO:0j: hier kommt das undo hin */
                            if (resulting['moves'] > 0) {
                                $board.find('.starthere').each(setAction);
                                $board.find('#sendMove').attr('title',
                                    sendMoveApologies(resulting['moves'], true));
                                /* TODO:0j: when clicking the dice to send the move, there
                                 * is a message, that not all moves were yet made.
                                 * This might be especially interesting when there is a
                                 * move, difficult for beginners (like 1-6, where 6 is
                                 * possible only after a very special 1) */
                            } else {
                                $board.find('.starthere').each(clearAction);
                                var $dx = $board.find('#sendMove')
                                $dx.attr('title', 'click to affirm move');
                                $dx[0].onclick = sendMove;
                            }
                        }
                        return false;   /* suppress contextmenu for right clicks */
                    };
                };
                function setAction(index, element) {
                    element.onclick = move(availableDice, nrMoves);
                    element.oncontextmenu = move(availableDice, nrMoves);
                }
                function clearAction(index, element) {
                    element.onclick = null;
                    element.oncontextmenu = null;
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
/* würfeln
 * ditch und bar
 * bear off
 * cube
 */

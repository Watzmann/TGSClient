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

        function moveChecker(element, dice, double, nrMoves, $board) {
            var target, $t, $s,
                myMove = new Array,
                $divs = $board.find('div'); /* needs to be selected anew at
                    every function entry, since the divs are being manipulated. */
            if (event.button == 1) {        /* ignore middle clicks */
                return;
            } else if (event.button == 2 && nrMoves == 2) {
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
                $p.remove();
                jQuery(div).attr('class', 'starthere').insertBefore($divs.eq(0));
                return $p.attr('data-point');
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
                undo['start'] = '#' + element.id;
                undo['$sClone'] = $s.clone();
                undo['target'] = '#p' + target;
                undo['$tClone'] = $t.clone();
                undo['myMove'] = myMove;
                var point = replacePoint($s, start, -1);
                myMove.push(point);
                $divs = $board.find('div'); /* refresh selection, since divs
                                                have been manipulated.       */
                point = replacePoint($t, target, +1);
                myMove.push(point);
                nrMoves--;
                break;

                /* TODO:0j:
                 * undo!!
                 * moves beim gegner zeigen
                 * Hit beachten
                 */
            }
            return {'dice': dice, 'moves': nrMoves,
                    'myMove': myMove, 'undo': undo};
        }
        function drawPoint(checkers, padding, color) {
            function drawCheckers(checkers, color) {
                var point = "";
                if (padding) {
                    point = "<div style=\"height:"+(162-checkers*27)+"px\"></div>";
                }
                for (var c = 0; c < checkers; c++) {
                    point += '<img src=' + piece[color] + ' alt=' + color + '>';
                }
                return point;
            }
            if (checkers == 0) {
                return "";
            } else {
                return drawCheckers((checkers > 0) ? checkers : -checkers, color);
            }
        }
        function composeDiv(values) {
            return sprintf('<div id="p%(id)d" class="%(class)s" ' +
                           'data-point="%(point)s" ' +
                           'data-target="%(target)s" ' +
                           'data-checkers="%(checkers)s">', values);
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
        function setDice(dice, $b) {
            var pic;
            if (dice[0] != 0) {
                pic = '<img src="' + gifRoot + 'playerdie'+dice[0]+'.gif" alt="playerdie1">';
                jQuery('<div id="pDice1">'+pic+"</div>").appendTo($b);
                pic = '<img src="' + gifRoot + 'playerdie'+dice[1]+'.gif" alt="playerdie2">';
                jQuery('<div id="pDice2">'+pic+"</div>").appendTo($b);
            } else if (dice[2] != 0) {
                pic = '<img src="' + gifRoot + 'opponentdie'+dice[2]+'.gif" alt="opponentdie1">';
                jQuery('<div id="oDice1">'+pic+"</div>").appendTo($b);
                pic = '<img src="' + gifRoot + 'opponentdie'+dice[3]+'.gif" alt="opponentdie2">';
                jQuery('<div id="oDice2">'+pic+"</div>").appendTo($b);
            }
        }
        var elements = this.parseBoard(board);
        var setDirection = function($imgs, elements) {
            if (elements['direction'] == '-1') {
                $imgs.filter('#pip13').attr('class', 'upperpips');
                $imgs.filter('#pip12').attr('class', 'lowerpips');
            } else {
                $imgs.filter('#pip12').attr('class', 'upperpips');
                $imgs.filter('#pip13').attr('class', 'lowerpips');
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
            $board.find('div').remove();
            if (elements['color'] == "-1") {
                setCheckersX(elements['position'], $board);
            } else {
                setCheckersO(elements['position'], $board);
            }
            setDice(elements['dice'], $board);
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
                        var available,
                            direction = elements['direction'],
                            color = elements['color'];
                        if (nrmoves > 0) {
                            available = moveChecker(this, dice, double, nrmoves, $board);
                            setAvailableDice(available['dice'], available['moves']);
                            accumulateMoves(available['myMove']);
                            if (available['moves'] > 0) {
                                $board.find('.starthere').each(setAction);
                            } else {
                                $board.find('.starthere').each(clearAction);
                                /* TODO:0j: set click area on dice */
                                tgc.cc.sendCmd("move "+myMoves.join(" "));
                            }
                        /* TODO:0j: when clicking the dice to send the move, there
                         * might be a message, that not all moves were yet made.
                         * This might be especially interesting when there is a
                         * move, difficult for beginners (like 1-6, where 6 is
                         * possible only after a very special 1) */
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

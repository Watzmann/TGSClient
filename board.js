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

        function moveChecker(element, dice, nrMoves, $divs) {
            var target, $t, $s, div;
            if (event.button == 1) {
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
            for (var d in dice) {
                target = start - dice[d];
                $t = $divs.filter('#p'+target);
                if (target > 0 && target < 25 &&
                                $t.attr('data-target') == 'no') {
                    continue;
                }
                var undo = {'start': '#' + element.id,
                            '$sClone': $s.clone(),
                            'target': '#p' + target,
                            '$tClone': $t.clone(),
                            };
                div = construct($t, target, +1);
                $t.remove();
                jQuery(div).insertBefore($divs.eq(0))
                div = construct($s, start, -1);
                $s.remove();
                jQuery(div).insertBefore($divs.eq(0))
                break;

                /* TODO:0j:
                 * undo!!
                 * moves beim gegner zeigen
                 */
            }
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
                container = {id: i, point: 25-i,
                             /* TODO:0j: looks like we don't need 'point' */
                            };
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
                container = {id: i, point: i,
                             /* TODO:0j: looks like we don't need 'point' */
                            };
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
            $board.find('div').remove();
            if (elements['color'] == "-1") {
                setCheckersX(elements['position'], $board);
            } else {
                setCheckersO(elements['position'], $board);
            }
            setDice(elements['dice'], $board);
            if (elements['turn']) {
                var move = function() {
                    var dice = elements['dice'].slice(0,2),
                        nrMoves = elements['nrMoves'],
                        direction = elements['direction'],
                        color = elements['color'];
                    if (nrMoves > 0) {
                        moveChecker(this, dice, nrMoves, $board.find('div'));
                    }
                    return false;   /* suppress contextmenu for right clicks */
                };
                function setAction(index, element) {
                    element.onclick = move;
                    element.oncontextmenu = move;
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

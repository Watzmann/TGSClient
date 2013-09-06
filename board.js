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
        parts["opponent"] = boardParts[2];
        parts["position"] = boardParts.slice(6,32);

        parts["color"] = boardParts[41];
        parts["direction"] = boardParts[42];

        parts["turn"] = boardParts[32] == boardParts[41];
        parts["dice"] = boardParts.slice(33,37);

        parts["onHome"] = boardParts.slice(45,47);
        parts["onBar"] = boardParts.slice(47,49);

        return parts;
    },
    showAscii: function(boardPane, result) {
        boardPane.innerHTML = result;
    },
    draw: function(boardPane, board) {
        var gifRoot = "resources/board/",
            piece = {'O': gifRoot + "playerpiece.gif",
                     'X': gifRoot + "opponentpiece.gif",};
        function moveChecker() {
            alert('clicked '+this.id+'  '+event.button);
            return false;   /* suppress contextmenu for right clicks */
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
        function setCheckers(position, $b) {
            var color, point, checkers, div;
            for (var i=1; i<26; i++) {
                    checkers = position[i];
                if (checkers > 0) {
                    color='O';
                    div = "<div id=\"p"+i+"\" class=\"starthere\">";
                } else {
                    color='X';
                    div = "<div id=\"p"+i+"\">";
                }
                point = drawPoint(parseInt(checkers), i<13, color);
                jQuery(div+point+"</div>").appendTo($b);
            }
        }
        function setAction(index, element) {
            var action;
            element.onclick = moveChecker;
            element.oncontextmenu = moveChecker;

            /*if (color == 'X') {
                return "\">";
            } else {
                return "\" onclick=\"this.moveChecker('#p" +
                          from + "','#p" + from+pips + "')\">";
            }*/

        }
        var elements = this.parseBoard(board);
        var drawPosition = function(target, elements) {
            var $board;
            $board = $(target);
            $board.find("div").remove();
            setCheckers(elements['position'], $board);
            setDice(elements['dice'], $board);
            if (elements['turn']) {
                $board.find('.starthere').each(setAction);
            }
        };
        drawPosition(boardPane, elements);
    }
  }
};
